import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pusher, PusherChannel, PusherEvent } from "@pusher/pusher-websocket-react-native";
import { ACADEMY_DOMAIN, AcademyHeaders, ACCESS_TOKEN, BASE_URL, LANGUAGES, LEARNING_SPACE, NoAcademyHeaders, PUSHER_CONFIG, SUPER_ADMIN_BASE_URL } from "@/utils/constants";
import { AcademyResponse, Language, UserResponse } from "@/utils/types";
import { removeDataStorage } from "@/utils/storage";
import { api } from "@/services/apiClient";
import { autoReconnectPusher } from "@/utils/helpers/pusher";

interface StoreState {
  isLoading: boolean;
  user: UserResponse | null;
  academies: AcademyResponse[] | [];
  selectedAcademy?: AcademyResponse | null,
  pusher: Pusher | null;
  channel: PusherChannel | null;
}

interface StoreActions {
  setAcademies: (academies: AcademyResponse[]) => void;
  setSelectAcademy: (academy?: AcademyResponse) => void;
  setUser: (userData: any) => void;
  language: Language
  logout: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setLanguage: (lang: Language) => void
  subscribeChannel: (
    pusher: Pusher,
    channelName: string,
    eventHandlers: EventHandler[]
  ) => Promise<PusherChannel>;
  unsubscribeChannelSafe: (pusher: Pusher,
    channelName: string,) => Promise<void>;
  disconnectPusher: (pusher: Pusher, channel: PusherChannel) => void;
  initializePusher: (academyDomain: string, isLearningSpace: boolean) => Promise<Pusher>;
}

interface EventHandler {
  eventName: string;
  handler: (data: any) => void;
}

type AuthStore = StoreState & StoreActions;

const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      isLoading: false,
      user: null,
      academies: [],
      selectedAcademy: null,
      pusher: null,
      channel: null,
      language: LANGUAGES[0],

      // Actions
      setUser: (userData: any) => {
        set((state) => {
          state.user = userData;
        });
      },

      setLoading: (isLoading: boolean) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },
      setLanguage: (lang: Language) => {
        set((state) => {
          state.language = lang;
        });
      },
      setSelectAcademy: (academy?: AcademyResponse) => {
        set((state) => {
          state.selectedAcademy = academy;
        });
      },

      setAcademies: (academies: AcademyResponse[]) => {
        set((state) => {
          state.academies = academies;
        });
      },

      subscribeChannel: async (
        pusher: Pusher,
        channelName: string,
        eventHandlers: EventHandler[]
      ): Promise<PusherChannel> => {
        if (!pusher) {
          throw new Error("[Pusher] Instance is not initialized");
        }

        await get().unsubscribeChannelSafe(pusher, channelName);

        try {
          const channel = await pusher.subscribe({
            channelName,
            onEvent: (event: PusherEvent) => {
              try {
                const matched = eventHandlers.find(e => e.eventName === event.eventName);
                console.log({ eventHandlers });
                if (matched) {
                  if (event.data) {
                    const parsedData = JSON.parse(event.data);
                    matched.handler(parsedData);
                  } else {
                    console.warn(`[Pusher] Event ${event.eventName} has no data`);
                    matched.handler(null);
                  }
                } else {
                  console.log(`[Pusher] Unhandled event: ${event.eventName}`);
                }
              } catch (parseErr) {
                console.error("[Pusher] Failed to parse event data", parseErr);
              }
            }
          });

          set((state) => {
            state.channel = channel;
          });

          return channel;
        } catch (err) {
          console.error(`[Pusher] Failed to subscribe to channel ${channelName}`, err);
          throw err;
        }
      },

      unsubscribeChannelSafe: async (
        pusher: Pusher,
        channelName: string
      ): Promise<void> => {
        try {
          await pusher.unsubscribe({ channelName });
  
        } catch (err) {
          console.warn(`[Pusher] Failed to unsubscribe from ${channelName}:`, err);
        }
      },

      disconnectPusher: (pusher: Pusher, channel: PusherChannel) => {
        if (channel) {
          channel.unsubscribe();
        }
        if (pusher) {
          pusher.disconnect();
        }

        set((state) => {
          state.pusher = null;
          state.channel = null;
        });
      },

      initializePusher: async (academyDomain: string, isLearningSpace:  boolean) => {
        const pusherInstance = Pusher.getInstance();

        await pusherInstance.init({
          apiKey: PUSHER_CONFIG.key,
          cluster: PUSHER_CONFIG.cluster,
          onAuthorizer: async (channelName, socketId) => {
            try {
              const formData = new FormData();
              formData.append('socket_id', socketId);
              formData.append('channel_name', channelName);

              const res = await api.post(`${academyDomain ? BASE_URL : SUPER_ADMIN_BASE_URL}/api/auth/pusher`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  [AcademyHeaders]: academyDomain,
                  [NoAcademyHeaders]: isLearningSpace,
                },
              });
              const data = await res.data

              return {
                auth: data.auth,
                channel_data: data.channel_data,
              }
            } catch (error) {
              console.error('Authorizer error', error)
              throw error
            }
          },
          useTLS: true,
          onConnectionStateChange: (state) => {
            console.log("Pusher connection state:", state);
            if (state === "DISCONNECTED") {
              autoReconnectPusher(pusherInstance);
            }
          },
          onError: (error) => {
            console.error("Pusher error:", error);
          },
        });

        await pusherInstance.connect();

        set((state) => {
          state.pusher = pusherInstance;
        });

        return pusherInstance;
      },
      logout: async () => {
        const { pusher, channel, disconnectPusher } = get();
        if (pusher && channel) {
            disconnectPusher(pusher, channel)
        }

        set((state) => {
          state.user = null;
          state.selectedAcademy = null;
          state.academies = [];
          state.pusher = null;
          state.channel = null;
        });
        await removeDataStorage(ACCESS_TOKEN)
        await removeDataStorage(LEARNING_SPACE)
        await removeDataStorage(ACADEMY_DOMAIN)

      },
    })),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage as StateStorage),
      partialize: (state) => ({
        user: state.user,
        academies: state.academies,
        isLoading: state.isLoading,
        selectedAcademy: state.selectedAcademy,
      }),
    }
  )
);

export default useAuthStore;
