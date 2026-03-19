import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Pusher,
  PusherChannel,
  PusherEvent,
} from "@pusher/pusher-websocket-react-native";

import {
  AcademyHeaders,
  BASE_URL,
  LANGUAGES,
  NoAcademyHeaders,
  PUSHER_CONFIG,
} from "@/utils/constants";
import {
  AcademyResponse,
  LanguageResponse,
  SubjectTimerResponse,
  UserResponse,
} from "@/utils/types";
import { AlarmResponse } from "@/utils/types/alarm";
import { api } from "@/services/api/apiClient";
import { autoReconnectPusher } from "@/utils/helpers/pusher";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { toast } from "@/utils/helpers";

interface EventHandler<T = any> {
  eventName: string;
  handler: (data: T) => void;
}

interface StoreState {
  isLoading: boolean;
  redirectUrl: string | null,
  isLoadingWithoutOverlay: boolean;
  user: UserResponse | null;
  academies: AcademyResponse[];
  selectedAcademy: AcademyResponse | null;
  hasEnteredSelectAcademy: boolean
  language: LanguageResponse;
  timers: SubjectTimerResponse[];
  alarm: AlarmResponse | null;

  pusher?: Pusher;
  channel?: PusherChannel;
}

interface StoreActions {
  setUser: (user: UserResponse | null) => void;
  setAcademies: (academies: AcademyResponse[]) => void;
  setSelectAcademy: (academy?: AcademyResponse | null) => void;
  setHasEnteredSelectAcademy: (value: boolean) => void
  setLoading: (isLoading: boolean) => void;
  setLoadingWithoutOverlay: (isLoading: boolean) => void;
  setLanguage: (lang: LanguageResponse) => void;
  setRedirectUrl: (url: string) => void
  clearRedirectUrl: () => void

  setTimers: (timers: SubjectTimerResponse[] | null) => void;
  setAlarm: (alarm: AlarmResponse | null) => void;

  initializePusher: (
    academyDomain: string,
    isLearningSpace: boolean
  ) => Promise<Pusher>;

  subscribeChannel: (
    pusher: Pusher,
    channelName: string,
    eventHandlers: EventHandler[]
  ) => Promise<PusherChannel>;

  unsubscribeChannelSafe: (
    pusher: Pusher,
    channelName: string
  ) => Promise<void>;

  disconnectPusher: (
    pusher?: Pusher,
    channel?: PusherChannel
  ) => Promise<void>;

  logout: () => Promise<void>;
}

type AuthStore = StoreState & StoreActions;

const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      isLoading: false,
      isLoadingWithoutOverlay: false,
      user: null,
      academies: [],
      selectedAcademy: null,
      redirectUrl: null,
      language: LANGUAGES[0],
      timers: [],
      alarm: null,
      hasEnteredSelectAcademy: true,
      pusher: undefined,
      channel: undefined,

      setUser: (user) => {
        set((state) => {
          state.user = user;
        });
      },

      setHasEnteredSelectAcademy: (value) => {
        set((state) => {
          state.hasEnteredSelectAcademy = value
        })
      },

      setAcademies: (academies) => {
        set((state) => {
          state.academies = academies;
        });
      },

      setSelectAcademy: (academy = null) => {
        set((state) => {
          state.selectedAcademy = academy;
        });
      },

      setLoading: (isLoading) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },

      setLoadingWithoutOverlay: (isLoading) => {
        set((state) => {
          state.isLoadingWithoutOverlay = isLoading;
        });
      },

      setLanguage: (lang) => {
        set((state) => {
          state.language = lang;
        });
      },

      setRedirectUrl: (url) => set({ redirectUrl: url }),
      clearRedirectUrl: () => set({ redirectUrl: null }),

      setTimers: (timers) => {
        set((state) => {
          state.timers = timers ? [...timers] : [];
        });
      },

      setAlarm: (alarm) => {
        set((state) => {
          state.alarm = alarm;
          if (__DEV__) console.log("[Alarm]", alarm);
        });
      },

      initializePusher: async (academyDomain, isLearningSpace) => {
        const { pusher } = get();
        if (pusher) return pusher;

        const instance = Pusher.getInstance();

        await instance.init({
          apiKey: PUSHER_CONFIG.key,
          cluster: PUSHER_CONFIG.cluster,
          useTLS: true,

          onAuthorizer: async (channelName, socketId) => {
            const formData = new FormData();
            formData.append("socket_id", socketId);
            formData.append("channel_name", channelName);

            const res = await api.post(
              `${BASE_URL}/api/auth/pusher`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  [AcademyHeaders]: academyDomain,
                  [NoAcademyHeaders]: isLearningSpace,
                },
              }
            );

            return {
              auth: res.data.auth,
              channel_data: res.data.channel_data,
            };
          },

          onConnectionStateChange: (state) => {
            if (__DEV__) console.log("[Pusher] State:", state);
            if (state === "DISCONNECTED") {
              autoReconnectPusher(instance);
            }
          },

          onError: (error) => {
            console.error("[Pusher] Error:", error);
          },
        });

        await instance.connect();

        set((state) => {
          state.pusher = instance;
        });

        return instance;
      },

      subscribeChannel: async (pusher, channelName, eventHandlers) => {
        await get().unsubscribeChannelSafe(pusher, channelName);

        const channel = await pusher.subscribe({
          channelName,
          onEvent: (event: PusherEvent) => {
            try {
              const matched = eventHandlers.find(
                (e) => e.eventName === event.eventName
              );

              if (!matched) {
                if (__DEV__) {
                  console.log("[Pusher] Unhandled:", event.eventName);
                }
                return;
              }

              const data = event.data ? JSON.parse(event.data) : null;
              matched.handler(data);
            } catch (err) {
              console.error("[Pusher] Event error:", err);
            }
          },
        });

        set((state) => {
          state.channel = channel;
        });

        return channel;
      },

      unsubscribeChannelSafe: async (
        pusher?: any,
        channelName?: string
      ) => {
        if (!pusher || !channelName) return;

        try {
          await pusher.unsubscribe({ channelName });

          if (__DEV__) {
            console.log(`[Pusher] Unsubscribed: ${channelName}`);
          }
        } catch (err) {
          if (__DEV__) {
            console.warn("[Pusher] Unsubscribe failed:", err);
          }
        }
      },

      disconnectPusher: async (pusher, channel) => {
        try {
          if (channel) await channel.unsubscribe();
          if (pusher) await pusher.disconnect();
        } finally {
          set((state) => {
            state.pusher = undefined;
            state.channel = undefined;
          });
        }
      },

      logout: async () => {
        const { pusher, channel, disconnectPusher } = get();
        await GoogleSignin.signOut();

        await disconnectPusher(pusher, channel);
        toast.dismiss()

        set(() => ({
          isLoading: false,

          user: null,
          academies: [],
          selectedAcademy: null,

          language: LANGUAGES[0],
          timers: [],
          alarm: null,

          pusher: undefined,
          channel: undefined,
        }));

        await AsyncStorage.clear();
      },
    })),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage as StateStorage),
      partialize: (state) => ({
        user: state.user,
        academies: state.academies,
        selectedAcademy: state.selectedAcademy,
        isLoading: state.isLoading,
        language: state.language,
      }),
    }
  )
);

export default useAuthStore;
