import { requireOptionalNativeModule } from 'expo'

/**
 * True when the ExpoCamera native module is linked in this binary. Builds made before expo-camera
 * was added lack it, and rendering the scanner there crashes, so callers check this first.
 */
export const isCameraModuleAvailable = (load: () => unknown = () => requireOptionalNativeModule('ExpoCamera')): boolean => {
  try {
    return !!load()
  } catch {
    return false
  }
}
