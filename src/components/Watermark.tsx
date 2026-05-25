import React from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
import useAuthStore from '@/store/useAuthStore'
import { currentScreen, reset } from '@/navigators/NavigationHelpers'
import { hiddenTabBar, Routes } from '@/navigators/RouteName'
import { useTranslation } from 'react-i18next'
import { setDemoMode } from '@/demoData/mockInterceptor'
import { getDataStorage, removeDataStorage, setDataStorage } from '@/utils/storage'
import { ACCESS_TOKEN, ACADEMY_DOMAIN, LEARNING_SPACE } from '@/utils/constants'
import { palette } from '@/theme'

const DEMO_MODE_STORAGE_KEY = 'DEMO_MODE'
const DEMO_SESSION_BACKUP_STORAGE_KEY = 'DEMO_SESSION_BACKUP'

const restoreStorageValue = async (key: string, value: string | null) => {
  if (value) {
    await setDataStorage(key, value)
    return
  }

  await removeDataStorage(key)
}

const Watermark = () => {
  const isDemo = useAuthStore(state => state.isDemoMode)
  const logout = useAuthStore(state => state.logout)
  const setIsDemoMode = useAuthStore(state => state.setIsDemoMode)
  const setUser = useAuthStore(state => state.setUser)
  const setAcademies = useAuthStore(state => state.setAcademies)
  const setSelectAcademy = useAuthStore(state => state.setSelectAcademy)
  const setHasEnteredSelectAcademy = useAuthStore(state => state.setHasEnteredSelectAcademy)
  const setRedirectUrl = useAuthStore(state => state.setRedirectUrl)
  const { t } = useTranslation()
  
  if (!isDemo) return null

  const handleExitDemoMode = async () => {
    try {
      setDemoMode(false)
      await removeDataStorage(DEMO_MODE_STORAGE_KEY)

      const backupRaw = await getDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)
      if (!backupRaw) {
        await logout()
        return
      }

      const backup = JSON.parse(backupRaw) as {
        accessToken: string | null
        academyDomain: string | null
        learningSpace: string | null
        user: ReturnType<typeof useAuthStore.getState>['user']
        academies: ReturnType<typeof useAuthStore.getState>['academies']
        selectedAcademy: ReturnType<typeof useAuthStore.getState>['selectedAcademy']
        hasEnteredSelectAcademy: boolean
      }

      await restoreStorageValue(ACCESS_TOKEN, backup.accessToken)
      await restoreStorageValue(ACADEMY_DOMAIN, backup.academyDomain)
      await restoreStorageValue(LEARNING_SPACE, backup.learningSpace)

      setIsDemoMode(false)
      setUser(backup.user)
      setAcademies(backup.academies || [])
      setSelectAcademy(backup.selectedAcademy)
      setHasEnteredSelectAcademy(backup.hasEnteredSelectAcademy)
      setRedirectUrl(Routes.Auth.Home)

      await removeDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)
      reset(Routes.Auth.Home)
    } catch (error) {
      console.error('[Watermark] Exit demo mode failed', error)
      await logout()
    }
  }

  // Tự động tính toán vị trí bottom để không đè lên Tab Bar
  const screen = currentScreen()
  const hasTabBar = !hiddenTabBar.includes(screen)
  const bottomOffset = hasTabBar ? 75 : 20

  const demoText = t('demo_mode').toUpperCase()

  return (
    <View style={styles.watermarkContainer} pointerEvents="box-none">
      <View style={[styles.badge, { bottom: bottomOffset }]} pointerEvents="auto">
        <Text style={styles.badgeText}>{demoText}</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitDemoMode}>
          <Text style={styles.exitButtonText}>{t('exit_demo_mode')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Watermark

const styles = StyleSheet.create({
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998, // Để 9998 để nằm dưới các loading overlay khẩn cấp nếu có, nhưng vẫn đè trên nội dung thường
  },
  diagonalContainer: {
    transform: [{ rotate: '-30deg' }],
  },
  diagonalText: {
    fontSize: 42,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.028)', // Đậm hơn một chút (2.8%) để dễ nhìn thấy nhưng không che chữ học tập
    letterSpacing: 6,
  },
  badge: {
    position: 'absolute',
    left: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.4)', // Giảm độ đậm xuống 35% để mờ tinh tế, dễ chịu
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: 'rgba(255, 255, 255, 0.95)', // Màu chữ trắng mờ nhẹ đồng điệu
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  exitButton: {
    backgroundColor: palette.main[600],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exitButtonText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  }
})
