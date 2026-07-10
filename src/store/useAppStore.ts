import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CURRENT_BUNDLE_VERSION } from "@/utils/constants";

interface AppStoreState {
  bundleVersion: string;
  isUpdatingOta: boolean;
}

interface AppStoreActions {
  setBundleVersion: (version: string) => void;
  setIsUpdatingOta: (isUpdating: boolean) => void;
}

type AppStore = AppStoreState & AppStoreActions;

const useAppStore = create<AppStore>()(
  persist(
    immer((set) => ({
      bundleVersion: CURRENT_BUNDLE_VERSION,
      isUpdatingOta: false,

      setBundleVersion: (version) => {
        set((state) => {
          state.bundleVersion = version;
        });
      },

      setIsUpdatingOta: (isUpdating) => {
        set((state) => {
          state.isUpdatingOta = isUpdating;
        });
      },
    })),
    {
      name: "app-storage-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export async function waitForAppStoreHydration(): Promise<void> {
  if (useAppStore.persist.hasHydrated()) return;

  return new Promise<void>((resolve) => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

export default useAppStore;

