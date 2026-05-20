import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import useAuthStore from '@/store/useAuthStore'
import { currentScreen } from '@/navigators/NavigationHelpers'
import { hiddenTabBar } from '@/navigators/RouteName'
import { useTranslation } from 'react-i18next'

const Watermark = () => {
  const isDemo = useAuthStore(state => state.isDemoMode)
  const { t } = useTranslation()
  
  if (!isDemo) return null

  // Tự động tính toán vị trí bottom để không đè lên Tab Bar
  const screen = currentScreen()
  const hasTabBar = !hiddenTabBar.includes(screen)
  const bottomOffset = hasTabBar ? 75 : 20

  const demoText = t('demo_mode').toUpperCase()

  return (
    <View style={styles.watermarkContainer} pointerEvents="none">

      <View style={[styles.badge, { bottom: bottomOffset }]}>
        <Text style={styles.badgeText}>{demoText}</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 0.1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
  },
  badgeText: {
    color: 'rgba(255, 255, 255, 0.85)', // Màu chữ trắng mờ nhẹ đồng điệu
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
})
