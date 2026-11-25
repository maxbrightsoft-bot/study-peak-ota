import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TFunction } from 'i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

type StatesProps = {
  t: TFunction<'translation', undefined>
}

const SKELETON_ROWS = [0, 1, 2, 3]

/** Four placeholder rows with a soft opacity pulse (no extra package). */
export const AcademyPickerSkeleton = ({ t }: StatesProps) => {
  const pulse = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])

  return (
    <View accessible accessibilityLabel={t('loading')} accessibilityState={{ busy: true }}>
      {SKELETON_ROWS.map(row => (
        <Animated.View key={row} style={[styles.skeletonRow, { opacity: pulse }]}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonText}>
            <View style={[styles.skeletonBar, styles.skeletonLong]} />
            <View style={[styles.skeletonBar, styles.skeletonShort]} />
          </View>
        </Animated.View>
      ))}
    </View>
  )
}

/** Footer spinner while the next page loads. */
export const AcademyPickerMore = ({ t }: StatesProps) => (
  <View style={styles.more} accessible accessibilityLabel={t('loading')} accessibilityState={{ busy: true }}>
    <ActivityIndicator color={palette.main[600]} />
  </View>
)

export const AcademyPickerEmpty = ({ t }: StatesProps) => (
  <View style={styles.panel} accessibilityLiveRegion="polite">
    <View style={styles.icon}>
      <Ionicons name="search" size={22} color={palette.grey[400]} />
    </View>
    <Text style={styles.title}>{t('guest_academy_not_found')}</Text>
    <Text style={styles.body}>{t('guest_academy_not_found_hint')}</Text>
  </View>
)

type ErrorProps = StatesProps & {
  message: string
  onRetry: () => void
}

export const AcademyPickerError = ({ t, message, onRetry }: ErrorProps) => (
  <View style={styles.panel} accessibilityLiveRegion="assertive">
    <View style={[styles.icon, styles.errorIcon]}>
      <Ionicons name="alert-circle-outline" size={22} color={palette.error.main} />
    </View>
    <Text style={styles.message}>{message}</Text>
    <TouchableOpacity style={styles.retry} onPress={onRetry} accessibilityRole="button">
      <Ionicons name="refresh" size={18} color={palette.main[600]} />
      <Text style={styles.retryText}>{t('retry')}</Text>
    </TouchableOpacity>
  </View>
)

const styles = ScaledSheet.create({
  more: {
    paddingVertical: '16@ms',
    alignItems: 'center'
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms',
    minHeight: '52@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms'
  },
  skeletonAvatar: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    backgroundColor: palette.grey[100]
  },
  skeletonText: {
    flex: 1,
    gap: '6@ms'
  },
  skeletonBar: {
    height: '12@ms',
    borderRadius: '6@ms',
    backgroundColor: palette.grey[100]
  },
  skeletonLong: {
    width: '62%'
  },
  skeletonShort: {
    width: '38%'
  },
  panel: {
    alignItems: 'center',
    gap: '8@ms',
    paddingVertical: '24@ms',
    paddingHorizontal: '16@ms'
  },
  icon: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.grey[50]
  },
  errorIcon: {
    backgroundColor: palette.error.lighter
  },
  title: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.grey[900],
    textAlign: 'center'
  },
  body: {
    maxWidth: '280@ms',
    fontSize: '13@ms',
    color: palette.grey[600],
    textAlign: 'center'
  },
  message: {
    fontSize: '14@ms',
    color: palette.grey[800],
    textAlign: 'center'
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6@ms',
    minHeight: '44@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: palette.main[600]
  },
  retryText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[600]
  }
})
