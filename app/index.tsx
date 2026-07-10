import RootNavigation from '../src/navigators/RootNavigation'
import { I18nextProvider } from 'react-i18next'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavigationIndependentTree } from '@react-navigation/native'
import { AppState, LogBox, Platform, View, ActivityIndicator, Text, Linking, TouchableOpacity } from 'react-native'
import i18n from '@/languages/i18n'
import hotUpdate from 'react-native-ota-hot-update'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { OTA_URL, STORE_VERSION_ANDROID, STORE_VERSION_IOS, STUDENT_URL } from '@/utils/constants'
import DeviceInfo from 'react-native-device-info'
import ForceUpdateScreen from '@/components/ForceUpdateScreen'
import ForceWebScreen from '@/components/ForceWebScreen'
import { useFonts } from 'expo-font'
import RNBootSplash from 'react-native-bootsplash'
import { requireNativeModule } from 'expo-modules-core'
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
  Feather
} from '@expo/vector-icons'
import useAppStore from '../src/store/useAppStore'
import { waitForAppStoreHydration } from '../src/store/useAppStore'
import { ActivityResource } from '@/utils/enums'
import { useActivityTracking } from '@/hooks/useActivityTracking'

export const CURRENT_BUNDLE_VERSION = process.env.EXPO_PUBLIC_CURRENT_BUNDLE_VERSION || '1.0.0'
const NativeFontLoader = requireNativeModule('ExpoFontLoader')

const OTA_MAX_RETRY = 3
const OTA_RETRY_DELAY = 3000
const OTA_MIN_CHECK_INTERVAL = 60 * 1000
const OTA_FETCH_TIMEOUT = 30000
const OTA_DOWNLOAD_TIMEOUT = 60000
const PERSIST_FLUSH_DELAY = 300
const OTA_RESET_APP_TIMEOUT = 5000

let otaAttemptCounter = 0

function normalizeVersion(version: string | number): number[] {
  const versionStr = String(version || '').trim()
  const parts = versionStr.split('.').map((item) => {
    const match = item.trim().match(/^(\d+)/)
    return match ? Number(match[1]) : 0
  })

  return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

function isNewerVersion(server: string | number, current: string | number): boolean {
  const s = normalizeVersion(server)
  const c = normalizeVersion(current)

  console.log(`[OTA] compare server=${server} => ${s.join('.')}, current=${current} => ${c.join('.')}`)

  for (let i = 0; i < 3; i++) {
    if (s[i] > c[i]) return true
    if (s[i] < c[i]) return false
  }

  return false
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

if (!Array.prototype.findLastIndex) {
  Array.prototype.findLastIndex = function (callback, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) {
        return i
      }
    }
    return -1
  }
}
if (!Array.prototype.findLast) {
  Array.prototype.findLast = function (callback: any, thisArg: any) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) {
        return this[i]
      }
    }
    return undefined
  }
}

async function checkOtaUpdate(
  currentBundleVersion: string,
  setIsUpdating: (val: boolean) => void,
  setBundleVersion: (version: string) => void,
  setIsUpdatingOta: (isUpdating: boolean) => void,
  trackError: (error: any, context?: any) => void,
  retryCount = 0,
  effectiveBundleVersion: string = CURRENT_BUNDLE_VERSION,
  onFailCompletely?: () => void
) {
  otaAttemptCounter += 1
  const myAttemptId = otaAttemptCounter

  const isStaleAttempt = () => myAttemptId !== otaAttemptCounter

  let serverVersion: string | undefined
  let downloadUrl: string | undefined

  try {
    const timestamp = new Date().getTime()
    const res = await fetchWithTimeout(
      `${OTA_URL}?t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      },
      OTA_FETCH_TIMEOUT
    )

    if (!res.ok) {
      throw new Error(`OTA manifest fetch failed with status ${res.status}`)
    }

    const data = await res.json()
    serverVersion = data.version

    console.log('[OTA] server:', data.version, '| local:', currentBundleVersion, '| enabled:', data.otaEnabled)

    if (data.otaEnabled === false) {
      console.warn('[OTA] Disabled remotely via kill switch')
      return
    }

    if (!data.version) {
      console.warn('[OTA] Invalid manifest, missing version field')
      trackError(new Error('OTA manifest missing version field'), {
        resourceType: ActivityResource.User,
        metaData: { retryCount, rawManifest: JSON.stringify(data) }
      })
      return
    }

    if (!isNewerVersion(data.version, currentBundleVersion)) {
      console.log('[OTA] Up to date')
      if (onFailCompletely) onFailCompletely();
      return
    }

    downloadUrl = Platform.OS === 'ios' ? data.downloadIosUrl : data.downloadAndroidUrl

    if (!downloadUrl) {
      console.warn('[OTA] Missing download URL for platform', Platform.OS)
      trackError(new Error('OTA manifest missing download URL'), {
        resourceType: ActivityResource.User,
        metaData: { stage: 'validate_manifest', serverVersion, platform: Platform.OS, retryCount }
      })
      return
    }

    setIsUpdating(true)
    setIsUpdatingOta(true)

    const versionCode = data.versionCode ?? 1

    const downloadTimeout = setTimeout(() => {
      if (isStaleAttempt()) return

      console.log('[OTA] Download timed out')
      setIsUpdatingOta(false)

      trackError(new Error('OTA download timed out'), {
        resourceType: ActivityResource.User,
        metaData: {
          stage: 'download_timeout',
          serverVersion,
          currentVersion: currentBundleVersion,
          url: downloadUrl,
          retryCount
        }
      })

      if (retryCount < OTA_MAX_RETRY) {
        setTimeout(() => {
          if (isStaleAttempt()) return
          checkOtaUpdate(currentBundleVersion, setIsUpdating, setBundleVersion, setIsUpdatingOta, trackError, retryCount + 1, effectiveBundleVersion, onFailCompletely)
        }, OTA_RETRY_DELAY)
      } else {
        setIsUpdating(false)
        if (onFailCompletely) onFailCompletely();
      }
    }, OTA_DOWNLOAD_TIMEOUT)

    hotUpdate.downloadBundleUri(ReactNativeBlobUtil, downloadUrl, versionCode, {
      updateSuccess: async () => {
        clearTimeout(downloadTimeout)

        if (isStaleAttempt()) {
          console.log('[OTA] Ignoring stale updateSuccess from attempt', myAttemptId)
          return
        }

        console.log('[OTA] Success, flushing state before restart')
        setBundleVersion(data.version)
        setIsUpdatingOta(false)

        await delay(PERSIST_FLUSH_DELAY)

        if (isStaleAttempt()) return

        console.log('[OTA] Restarting silently')

        const resetTimeout = setTimeout(() => {
          console.warn('[OTA] resetApp did not complete in time, falling back to old bundle')
          trackError(new Error('OTA resetApp timeout'), {
            resourceType: ActivityResource.User,
            metaData: { stage: 'reset_app_timeout', bundleVersion: data.version }
          })
          setIsUpdating(false)
        }, OTA_RESET_APP_TIMEOUT)

        try {
          hotUpdate.resetApp()
          clearTimeout(resetTimeout)
        } catch (resetError: any) {
          clearTimeout(resetTimeout)
          console.error('[OTA] resetApp threw synchronously:', resetError)
          trackError(resetError, {
            resourceType: ActivityResource.User,
            metaData: { stage: 'reset_app_error', bundleVersion: data.version }
          })
          setIsUpdating(false)
        }
      },
      updateFail: (msg) => {
        clearTimeout(downloadTimeout)

        if (isStaleAttempt()) {
          console.log('[OTA] Ignoring stale updateFail from attempt', myAttemptId)
          return
        }

        console.log('[OTA] Failed:', msg, '| retry:', retryCount)
        setIsUpdatingOta(false)

        trackError(new Error(String(msg)), {
          resourceType: ActivityResource.User,
          metaData: {
            stage: 'download',
            serverVersion,
            currentVersion: currentBundleVersion,
            url: downloadUrl,
            retryCount
          }
        })

        if (retryCount < OTA_MAX_RETRY) {
          setTimeout(() => {
            if (isStaleAttempt()) return
            checkOtaUpdate(currentBundleVersion, setIsUpdating, setBundleVersion, setIsUpdatingOta, trackError, retryCount + 1, effectiveBundleVersion, onFailCompletely)
          }, OTA_RETRY_DELAY)
        } else {
          console.log('[OTA] Max retry reached, giving up this session')
          setIsUpdating(false)
          if (onFailCompletely) onFailCompletely();
        }
      },
      restartAfterInstall: false,
      maxBundleVersions: 3
    })
  } catch (e: any) {
    if (isStaleAttempt()) return

    console.log('[OTA] Error:', e, '| retry:', retryCount)

    trackError(e, {
      resourceType: ActivityResource.User,
      metaData: {
        stage: e?.name === 'AbortError' ? 'fetch_timeout' : 'fetch_manifest',
        serverVersion,
        currentVersion: currentBundleVersion,
        retryCount
      }
    })

    if (retryCount < OTA_MAX_RETRY) {
      setTimeout(() => {
        if (isStaleAttempt()) return
        checkOtaUpdate(currentBundleVersion, setIsUpdating, setBundleVersion, setIsUpdatingOta, trackError, retryCount + 1, effectiveBundleVersion, onFailCompletely)
      }, OTA_RETRY_DELAY)
    } else {
      setIsUpdating(false)
      if (onFailCompletely) onFailCompletely();
    }
  }
}

export default function App() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [fontWaitTimedOut, setFontWaitTimedOut] = useState(false)
  const { trackError } = useActivityTracking()

  const bundleVersion = useAppStore((state) => state.bundleVersion)
  const setBundleVersion = useAppStore((state) => state.setBundleVersion)
  const setIsUpdatingOta = useAppStore((state) => state.setIsUpdatingOta)
  const needsForceUpdate = useAppStore((state) => state.needsForceUpdate)
  const forceWebVersion = useAppStore((state) => state.forceWebVersion)
  const setForceWebVersion = useAppStore((state) => state.setForceWebVersion)
  const latestVersionName = useAppStore((state) => state.latestVersionName)
  const setNeedsForceUpdate = useAppStore((state) => state.setNeedsForceUpdate)
  const setLatestVersionName = useAppStore((state) => state.setLatestVersionName)
  const otaCheckTriggerCount = useAppStore((state) => state.otaCheckTriggerCount)

  useEffect(() => {
    const checkAppVersion = () => {
      try {
        const storeVersion = Platform.OS === 'android' ? STORE_VERSION_ANDROID : STORE_VERSION_IOS

        if (!storeVersion) return

        const currentVersion = DeviceInfo.getVersion()

        console.log(`[Version Check] Store: ${storeVersion}, Local: ${currentVersion}`)

        if (isNewerVersion(storeVersion, currentVersion)) {
          setNeedsForceUpdate(true)
          setLatestVersionName(storeVersion)
        }
      } catch (error) {
        console.error('[Version Check] Error checking app version:', error)
      }
    }
    if (!__DEV__) {
      checkAppVersion()
    }
  }, [])

  const [nativeFontsLoaded, setNativeFontsLoaded] = useState(false)
  const [nativeFontError, setNativeFontError] = useState<any>(null)

  const [expoFontsLoaded, expoFontError] = useFonts(
    Platform.OS === 'ios'
      ? {
          ...Ionicons.font,
          ...FontAwesome.font,
          ...FontAwesome5.font,
          ...MaterialIcons.font,
          ...MaterialCommunityIcons.font,
          ...AntDesign.font,
          ...Feather.font
        }
      : {}
  )

  useEffect(() => {
    if (Platform.OS === 'android') {
      const fontMap = {
        ionicons: 'fonts/Ionicons.ttf',
        FontAwesome: 'fonts/FontAwesome.ttf',
        'FontAwesome5Free-Regular': 'fonts/FontAwesome5_Regular.ttf',
        'FontAwesome5Free-Solid': 'fonts/FontAwesome5_Solid.ttf',
        'FontAwesome5Brands-Brand': 'fonts/FontAwesome5_Brands.ttf',
        material: 'fonts/MaterialIcons.ttf',
        'material-community': 'fonts/MaterialCommunityIcons.ttf',
        anticon: 'fonts/AntDesign.ttf',
        feather: 'fonts/Feather.ttf'
      }

      const loadAndroidFonts = async () => {
        try {
          for (const [key, file] of Object.entries(fontMap)) {
            await NativeFontLoader.loadAsync(key, `asset:///${file}`)
            console.log(`[FONTS] Successfully loaded native font: ${key}`)
          }
          setNativeFontsLoaded(true)
        } catch (err) {
          console.error('[FONTS] Failed to load native font:', err)
          setNativeFontError(err)
        }
      }

      loadAndroidFonts()
    }
  }, [])

  const fontsLoaded = Platform.OS === 'android' ? nativeFontsLoaded : expoFontsLoaded
  const fontError = Platform.OS === 'android' ? nativeFontError : expoFontError

  LogBox.ignoreAllLogs()

  useEffect(() => {
    if (fontsLoaded || fontError) return

    const timeout = setTimeout(() => {
      setFontWaitTimedOut(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [fontsLoaded, fontError])

  useEffect(() => {
    if (!isUpdating && (fontsLoaded || fontError || fontWaitTimedOut)) {
      console.log(
        '[FONTS] Hiding splash screen. Loaded:',
        fontsLoaded,
        'Error:',
        fontError,
        'Timeout:',
        fontWaitTimedOut
      )
      RNBootSplash.hide({ fade: true }).catch((err) => {
        console.log('[FONTS] Error hiding splash:', err)
      })
    }
  }, [isUpdating, fontsLoaded, fontError, fontWaitTimedOut])

  const lastCheckRef = useRef(0)
  const isCheckingRef = useRef(false)

  useEffect(() => {
    if (isNewerVersion(CURRENT_BUNDLE_VERSION, bundleVersion)) {
      setBundleVersion(CURRENT_BUNDLE_VERSION)
    }
  }, [bundleVersion, setBundleVersion])

  const runOtaCheck = useCallback(async (force = false) => {
    if (__DEV__) return
    if (isCheckingRef.current) return

    const now = Date.now()
    if (!force && now - lastCheckRef.current < OTA_MIN_CHECK_INTERVAL) return
    lastCheckRef.current = now
    isCheckingRef.current = true

    await waitForAppStoreHydration()

    const currentVersionToCheck = isNewerVersion(bundleVersion, CURRENT_BUNDLE_VERSION)
      ? bundleVersion
      : CURRENT_BUNDLE_VERSION

    const handleFailCompletely = () => {
      if (force) {
        setForceWebVersion(true)
      }
    }

    try {
      await checkOtaUpdate(
        currentVersionToCheck, 
        setIsUpdating, 
        setBundleVersion, 
        setIsUpdatingOta, 
        trackError, 
        0, 
        CURRENT_BUNDLE_VERSION, 
        handleFailCompletely
      )
    } finally {
      isCheckingRef.current = false
    }
  }, [bundleVersion, setBundleVersion, setIsUpdatingOta, trackError])

  useEffect(() => {
    runOtaCheck()
  }, [runOtaCheck])

  useEffect(() => {
    if (otaCheckTriggerCount > 0) {
      runOtaCheck(true)
    }
  }, [otaCheckTriggerCount, runOtaCheck])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        runOtaCheck()
      }
    })
    return () => sub.remove()
  }, [runOtaCheck])

  const handleOpenWeb = () => {
    if (STUDENT_URL) {
      Linking.openURL(STUDENT_URL).catch((err) => {
        console.log("Could not open web link:", err);
      });
    }
  }

  if (needsForceUpdate) {
    return <ForceUpdateScreen latestVersion={latestVersionName} />
  }

  if (forceWebVersion) {
    return <ForceWebScreen />
  }



  if (!fontsLoaded && !fontError && !fontWaitTimedOut) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10, fontSize: 12, color: '#999' }}>{i18n.t('loading_font')}</Text>
      </View>
    )
  }

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationIndependentTree>
        <RootNavigation />
      </NavigationIndependentTree>
      {isUpdating && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 9999 }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: '#333' }}>{i18n.t('updating_app')}</Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 32 }}>
            {i18n.t('ota_update_suggestion_web')}
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#5F30AA',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 24,
              marginTop: 20,
              shadowColor: '#5F30AA',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4
            }}
            activeOpacity={0.8}
            onPress={handleOpenWeb}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginRight: 8 }}>
              {i18n.t('force_web_button')}
            </Text>
            <Feather name="external-link" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </I18nextProvider>
  )
}