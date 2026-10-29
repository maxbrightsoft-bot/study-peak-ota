import { useState, useEffect, useCallback } from 'react'
import { Alert, Linking, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as LocalAuthentication from 'expo-local-authentication'
import { getDataStorage, setDataStorage } from '@/utils/storage'
import { IS_BIOMETRIC_ENABLED } from '@/utils/constants'

export const useBiometric = () => {
  const { t } = useTranslation()
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false)

  const openSecuritySettings = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        await Linking.sendIntent('android.settings.BIOMETRIC_ENROLL')
      } catch {
        try {
          await Linking.sendIntent('android.settings.SECURITY_SETTINGS')
        } catch {
          await Linking.openSettings()
        }
      }
    } else if (Platform.OS === 'ios') {
      try {
        const url = 'App-Prefs:root=TOUCHID_PASSCODE'
        const canOpen = await Linking.canOpenURL(url)
        if (canOpen) {
          await Linking.openURL(url)
        } else {
          await Linking.openSettings()
        }
      } catch {
        await Linking.openSettings()
      }
    } else {
      await Linking.openSettings()
    }
  }, [])

  const checkBiometricStatus = useCallback(async () => {
    try {
      const val = await getDataStorage(IS_BIOMETRIC_ENABLED)
      setIsBiometricEnabled(val === 'true')
    } catch {
      setIsBiometricEnabled(false)
    }
  }, [])

  useEffect(() => {
    checkBiometricStatus()
  }, [])

  const handleToggleBiometric = async (nextValue: boolean): Promise<boolean> => {
    if (nextValue) {
      // Yêu cầu bật tính năng sinh trắc học
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync()

      if (!hasHardware) {
        Alert.alert(
          t('biometric_not_supported_title'),
          t('biometric_not_supported_desc'),
          [{ text: t('ok') }]
        )
        return false
      }

      // Kiểm tra phải có Vân tay hoặc Face ID được cài đặt (cấp độ BIOMETRIC_WEAK hoặc BIOMETRIC_STRONG)
      const hasBiometricEnrolled = enrolledLevel >= LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK

      if (!hasBiometricEnrolled) {
        Alert.alert(
          t('biometric_not_enrolled_title'),
          t('biometric_not_enrolled_desc'),
          [
            { text: t('cancel'), style: 'cancel' },
            {
              text: t('open_settings'),
              onPress: openSecuritySettings
            }
          ]
        )
        return false
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric_prompt_enable'),
        fallbackLabel: t('cancel')
      })

      if (authResult.success) {
        await setDataStorage(IS_BIOMETRIC_ENABLED, 'true')
        setIsBiometricEnabled(true)
        return true
      }
      return false
    } else {
      // Tắt tính năng -> yêu cầu xác thực trước khi tắt
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric_prompt_disable'),
        fallbackLabel: t('cancel')
      })

      if (authResult.success) {
        await setDataStorage(IS_BIOMETRIC_ENABLED, 'false')
        setIsBiometricEnabled(false)
        return true
      }
      return false
    }
  }

  const authenticateBiometric = async (customPromptMessage?: string): Promise<boolean> => {
    const biometricStored = await getDataStorage(IS_BIOMETRIC_ENABLED)
    if (biometricStored === 'true') {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: customPromptMessage || t('biometric_prompt_access'),
        fallbackLabel: t('cancel')
      })
      return authResult.success
    }
    return true
  }

  return {
    isBiometricEnabled,
    handleToggleBiometric,
    authenticateBiometric,
    checkBiometricStatus,
  }
}

export default useBiometric
