import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Pusher,
  PusherChannel,
  PusherEvent,
  PusherMember,
} from "@pusher/pusher-websocket-react-native";
import {
  BASE_URL,
  PUSHER_CONFIG,
  ACCESS_TOKEN,
  ACADEMY_DOMAIN,
  LEARNING_SPACE,
  REDIRECT_URL,
  APPLE_USER_KEY,
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
import crashlytics from '@react-native-firebase/crashlytics'
import { AccountLinkResponse, getLinkedStudentsForParentApi } from "@/containers/AccountLinking/apiClients";
import { Role } from "@/utils/enums";

interface EventHandler<T = any> {
  eventName: string;
  handler: (data: T) => void;
}

export interface SubscribeOptions {
  onMemberRemoved?: (member: PusherMember) => void;
}

export interface ParentViewModeState {
  isActive: boolean;
  linkId: number | null;
  studentAcademyUserId?: number | null;
  studentName: string | null;
  studentEmail: string | null;
  studentAcademyDomain: string | null;
}

interface StoreState {
  isLoading: boolean;
  redirectUrl: string | null,
  redirectParams: any | null,
  pendingRedirectUrl: string | null,
  pendingRedirectParams: any | null,
  hasConsented: boolean,
  isLoadingWithoutOverlay: boolean;
  user: UserResponse | null;
  academies: AcademyResponse[];
  selectedAcademy: AcademyResponse | null;
  hasEnteredSelectAcademy: boolean
  language: LanguageResponse | null;
  timers: SubjectTimerResponse[];
  alarm: AlarmResponse | null;
  activeTimerId: number | undefined;
  activeTimerSeconds: number | undefined;
  isOpenTimerDialog: boolean;

  pusher?: Pusher;
  channel?: PusherChannel;
  hasSeenTutorial: boolean;
  isDemoMode: boolean;
  parentViewMode: ParentViewModeState | null;
  linkedStudents: AccountLinkResponse[];
  isUserCustomLoaded: boolean;
  activeEventHandlers: Record<string, EventHandler[]>;
}

interface StoreActions {
  setUser: (user: UserResponse | null) => void;
  setUserCustom: (user: UserResponse | null) => Promise<void>;
  setParentViewMode: (viewMode: ParentViewModeState | null) => void;
  setLinkedStudents: (students: AccountLinkResponse[]) => void;
  syncParentLinkedStudents: (signal?: AbortSignal) => Promise<AccountLinkResponse[]>;
  setHasConsented: (value: boolean) => void;
  setIsDemoMode: (value: boolean) => void;
  setAcademies: (academies: AcademyResponse[]) => void;
  setSelectAcademy: (academy?: AcademyResponse | null) => void;
  setHasEnteredSelectAcademy: (value: boolean) => void
  setLoading: (isLoading: boolean) => void;
  setLoadingWithoutOverlay: (isLoading: boolean) => void;
  setLanguage: (lang: LanguageResponse) => void;
  setRedirectUrl: (url: string, params?: any) => void
  clearRedirectUrl: () => void
  setPendingRedirectUrl: (url: string | null, params?: any) => void
  setCrashlyticsUser: (user?: any) => void
  clearCrashlyticsUser: () => void

  setTimers: (timers: SubjectTimerResponse[] | null) => void;
  setAlarm: (alarm: AlarmResponse | null) => void;
  setActiveTimerId: (id: number | undefined) => void;
  setActiveTimerSeconds: (seconds: number | undefined) => void;
  setIsOpenTimerDialog: (isOpen: boolean) => void;

  initializePusher: () => Promise<Pusher>;

  subscribeChannel: (
    pusher: Pusher,
    channelName: string,
    getEventHandlers: EventHandler[] | (() => EventHandler[]),
    options?: SubscribeOptions
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
  setHasSeenTutorial: (value: boolean) => void;
}

type AuthStore = StoreState & StoreActions;

const computeParentViewMode = (
  studentsList: AccountLinkResponse[],
  currentViewMode: ParentViewModeState | null,
  academyDomain?: string | null
): ParentViewModeState => {
  if (studentsList.length === 0) {
    return {
      isActive: true,
      linkId: null,
      studentAcademyUserId: null,
      studentName: null,
      studentEmail: null,
      studentAcademyDomain: academyDomain || null,
    };
  }

  const currentLinkId = currentViewMode?.linkId;
  const exists = currentLinkId ? studentsList.some((item) => item.id === currentLinkId) : false;
  if (!currentLinkId || !exists) {
    const firstChild = studentsList[0];
    return {
      isActive: true,
      linkId: firstChild.id,
      studentAcademyUserId: firstChild.studentAcademyUserId || null,
      studentName: firstChild.studentName || null,
      studentEmail: firstChild.studentEmail || null,
      studentAcademyDomain: academyDomain || null,
    };
  }

  return currentViewMode;
};

const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      isLoading: false,
      isLoadingWithoutOverlay: false,
      user: null,
      academies: [],
      hasConsented: false,
      selectedAcademy: null,
      redirectUrl: null,
      redirectParams: null,
      pendingRedirectUrl: null,
      pendingRedirectParams: null,
      language: null,
      timers: [],
      alarm: null,
      activeTimerId: undefined,
      activeTimerSeconds: undefined,
      isOpenTimerDialog: false,
      hasEnteredSelectAcademy: true,
      pusher: undefined,
      channel: undefined,
      hasSeenTutorial: false,
      isDemoMode: false,
      parentViewMode: null,
      linkedStudents: [],
      isUserCustomLoaded: false,
      activeEventHandlers: {},

      setUser: (user) => {
        set((state) => {
          state.user = user;
        });
      },

      setUserCustom: async (user) => {
        if (!user) {
          set((state) => {
            state.user = null;
            state.linkedStudents = [];
            state.parentViewMode = null;
            state.isUserCustomLoaded = true;
          });
          return;
        }

        let studentsList: AccountLinkResponse[] = [];
        let newParentViewMode = get().parentViewMode;

        const isParent = user?.roles?.includes(Role.Parent);
        if (isParent) {
          try {
            const response = await getLinkedStudentsForParentApi();
            studentsList = response.data?.data || [];
            newParentViewMode = computeParentViewMode(studentsList, newParentViewMode, user.academyDomain);
          } catch (error) {
            console.error("Failed to fetch linked children:", error);
            return;
          }
        }

        set((state) => {
          state.user = user;
          if (isParent) {
            state.linkedStudents = studentsList;
            state.parentViewMode = newParentViewMode;
          }
          state.isUserCustomLoaded = true;
        });
      },

      setLinkedStudents: (students) => {
        const currentUser = get().user;
        const currentViewMode = get().parentViewMode;
        const newParentViewMode = computeParentViewMode(students, currentViewMode, currentUser?.academyDomain);

        set((state) => {
          state.linkedStudents = students;
          state.parentViewMode = newParentViewMode;
        });
      },

      syncParentLinkedStudents: async (signal?: AbortSignal) => {
        const response = await getLinkedStudentsForParentApi(signal);
        const studentsList = response.data?.data || [];
        get().setLinkedStudents(studentsList);
        return studentsList;
      },

      setParentViewMode: (viewMode) => {
        set((state) => {
          state.parentViewMode = viewMode;
        });
      },

      setHasConsented: (value) => {
        set((state) => {
          state.hasConsented = value
        })
      },

      setIsDemoMode: (value) => {
        set((state) => {
          state.isDemoMode = value
        })
      },

      setHasEnteredSelectAcademy: (value) => {
        set((state) => {
          state.hasEnteredSelectAcademy = value
        })
      },
      setHasSeenTutorial: (value) => {
        set((state) => {
          state.hasSeenTutorial = value
        })
      },

      setCrashlyticsUser: async (user?: any) => {
        if (!user?.id) return

        crashlytics().setUserId(String(user.id))

        crashlytics().setAttributes({
          userId: String(user.id),
          academyDomain: user.academyDomain || '',
        })
      },
      clearCrashlyticsUser: () => {
        crashlytics().setUserId('')
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

      setRedirectUrl: (url, params) => set({ redirectUrl: url, redirectParams: params }),
      clearRedirectUrl: () => set({ redirectUrl: null, redirectParams: null, pendingRedirectUrl: null, pendingRedirectParams: null }),
      setPendingRedirectUrl: (url, params) => set({ pendingRedirectUrl: url, pendingRedirectParams: params }),

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

      setActiveTimerId: (id) => {
        set((state) => {
          state.activeTimerId = id;
        });
      },
      setActiveTimerSeconds: (seconds) => {
        set((state) => {
          state.activeTimerSeconds = seconds;
        });
      },
      setIsOpenTimerDialog: (isOpen) => {
        set((state) => {
          state.isOpenTimerDialog = isOpen;
        });
      },

      initializePusher: async () => {
        // Skip Pusher trong Demo Mode
        const { isDemoMode } = get();
        if (isDemoMode) {
          console.log('[Pusher] Skipped - Demo Mode');
          return undefined as any;
        }

        const { pusher } = get();
        if (pusher) return pusher;

        const instance = Pusher.getInstance();

        await instance.init({
          apiKey: PUSHER_CONFIG.key,
          cluster: PUSHER_CONFIG.cluster,
          useTLS: true,

          onAuthorizer: async (channelName, socketId) => {
            try {
              const formData = new FormData();
              formData.append("socket_id", socketId);
              formData.append("channel_name", channelName);

              const res = await api.post(
                `${BASE_URL}/api/auth/pusher`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              return {
                auth: res?.data?.auth || "",
                channel_data: res?.data?.channel_data || "",
              };
            } catch (err) {
              console.error("[Pusher] Authorizer failed:", err);
              return {
                auth: "",
                channel_data: "",
              };
            }
          },

          onConnectionStateChange: (state) => {
            // if (__DEV__) console.log("[Pusher] State:", state);
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

      subscribeChannel: async (pusher, channelName, getEventHandlers, options) => {
        const channel = await pusher.subscribe({
          channelName,
          ...options,
          onEvent: (event: PusherEvent) => {
            try {
              const eventHandlers = typeof getEventHandlers === 'function'
                ? getEventHandlers()
                : getEventHandlers;

              // console.log("[Pusher] Event:", event.eventName, '| channel:', channelName);
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

          // if (__DEV__) {
          //   console.log(`[Pusher] Unsubscribed: ${channelName}`);
          // }
        } catch (err) {
          if (__DEV__) {
            console.warn("[Pusher] Unsubscribe failed:", err);
          }
        }
      },

      disconnectPusher: async (pusher, channel) => {
        try {
          if (pusher && channel?.channelName) {
            await pusher.unsubscribe({ channelName: channel.channelName });
          }
          if (pusher) await pusher.disconnect();
        } finally {
          set((state) => {
            state.pusher = undefined;
            state.channel = undefined;
          });
        }
      },

      logout: async () => {
        const { pusher, channel, disconnectPusher, clearCrashlyticsUser } = get();
        await GoogleSignin.signOut();

        await disconnectPusher(pusher, channel);
        toast.dismiss()
        clearCrashlyticsUser()

        set((state) => ({
          isLoading: false,
          user: null,
          academies: [],
          selectedAcademy: null,
          timers: [],
          alarm: null,
          activeTimerId: undefined,
          activeTimerSeconds: undefined,
          pusher: undefined,
          channel: undefined,
          isDemoMode: false,
          hasConsented: false,
          parentViewMode: null,
          linkedStudents: [],
          isUserCustomLoaded: false,
        }));

        const keysToRemove = [
          ACCESS_TOKEN,
          ACADEMY_DOMAIN,
          LEARNING_SPACE,
          REDIRECT_URL,
          APPLE_USER_KEY,
        ].filter((key): key is string => typeof key === 'string');
        await AsyncStorage.multiRemove(keysToRemove);
        // Tắt demo mode khi logout
        try {
          const { setDemoMode } = require('@/demoData/mockInterceptor');
          setDemoMode(false);
        } catch {}
      },
    })),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage as StateStorage),
      partialize: (state) => ({
        user: state.user,
        academies: state.academies,
        selectedAcademy: state.selectedAcademy,
        language: state.language,
        hasConsented: state.hasConsented,
        hasSeenTutorial: state.hasSeenTutorial,
        isDemoMode: state.isDemoMode,
      }),
    }
  )
);

export default useAuthStore;
