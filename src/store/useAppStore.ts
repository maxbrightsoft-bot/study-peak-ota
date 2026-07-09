import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CURRENT_BUNDLE_VERSION } from "@/utils/constants";

interface AppStoreState {
  bundleVersion: string;
  isUpdatingOta: boolean;
  needsForceUpdate: boolean;
  latestVersionName: string;
  otaCheckTriggerCount: number;
}

interface AppStoreActions {
  setBundleVersion: (version: string) => void;
  setIsUpdatingOta: (isUpdating: boolean) => void;
  setNeedsForceUpdate: (val: boolean) => void;
  setLatestVersionName: (version: string) => void;
  triggerOtaCheck: () => void;
}

type AppStore = AppStoreState & AppStoreActions;

const useAppStore = create<AppStore>()(
  persist(
    immer((set) => ({
      bundleVersion: CURRENT_BUNDLE_VERSION,
      isUpdatingOta: false,
      needsForceUpdate: false,
      latestVersionName: "",
      otaCheckTriggerCount: 0,

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

      setNeedsForceUpdate: (val) => {
        set((state) => {
          state.needsForceUpdate = val;
        });
      },

      setLatestVersionName: (version) => {
        set((state) => {
          state.latestVersionName = version;
        });
      },

      triggerOtaCheck: () => {
        set((state) => {
          state.otaCheckTriggerCount += 1;
        });
      },
    })),
    {
      name: "app-storage-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bundleVersion: state.bundleVersion,
      }),
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

