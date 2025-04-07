import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pusher, PusherChannel } from "@pusher/pusher-websocket-react-native";
import { PUSHER_CONFIG } from "@/utils/constants";
import { Academy } from "@/utils/types";

interface StoreState {
  isLoading: boolean;
  user: any | null;
  academy: Academy | null;
  pusher: Pusher | null;
  channel: PusherChannel | null;
}

interface StoreActions {
  setAcademy: (academy: Academy) => void;
  login: (userData: any) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  subscribeChannel: (
    pusher: Pusher,
    channelName: string
  ) => Promise<PusherChannel>;
  disconnectPusher: (pusher: Pusher, channel: PusherChannel) => void;
  initializePusher: (token: string, key: string) => Promise<Pusher>;
}

type AuthStore = StoreState & StoreActions;

const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      isLoading: false,
      user: null,
      academy: null,
      pusher: null,
      channel: null,

      // Actions
      login: (userData: any) => {
        set((state) => {
          state.user = userData;
        });
      },

      logout: () => {
        const { pusher, channel } = get();
        if (channel) {
          channel.unsubscribe();
        }
        if (pusher) {
          pusher.disconnect();
        }

        set((state) => {
          state.user = null;
          state.pusher = null;
          state.channel = null;
        });
      },

      setLoading: (isLoading: boolean) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },

      setAcademy: (academy: Academy) => {
        set((state) => {
          state.academy = academy;
        });
      },

      subscribeChannel: async (pusher: Pusher, channelName: string) => {
        if (!pusher) {
          throw new Error("Pusher is not initialized");
        }

        const channelInstance = await pusher.subscribe({
          channelName,
          onEvent: (event) => {
            console.log("Event received:", event);
          },
        });

        set((state) => {
          state.channel = channelInstance;
        });

        return channelInstance;
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

      initializePusher: async (token: string, key: string) => {
        const pusherInstance = Pusher.getInstance();

        await pusherInstance.init({
          apiKey: PUSHER_CONFIG.key,
          cluster: PUSHER_CONFIG.cluster,
          onConnectionStateChange: (state) => {
            console.log("Pusher connection state:", state);
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
    })),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage as StateStorage),
      partialize: (state) => ({
        user: state.user,
        academy: state.academy,
      }),
    }
  )
);

export default useAuthStore;
