import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'
import { palette } from '@/theme'

interface ExpiryProgressBarProps {
  expiredTime?: string | null
  createdAt?: string | null
  totalSeconds?: number
  onExpire?: () => void
  containerStyle?: ViewStyle
  showCountdownText?: boolean
}

const ExpiryProgressBar: React.FC<ExpiryProgressBarProps> = ({
  expiredTime,
  createdAt,
  totalSeconds: totalSecondsProp,
  onExpire,
  containerStyle,
  showCountdownText = true,
}) => {
  const { t } = useTranslation()

  // Convert thời gian UTC từ BE sang Local Time của điện thoại
  const getLocalMoment = (dateStr?: string | null): moment.Moment | null => {
    if (!dateStr) return null
    // Đảm bảo chuỗi luôn được hiểu là UTC dù BE có gửi kèm 'Z' hay không
    const utcStr = (dateStr.endsWith('Z') || dateStr.includes('+')) ? dateStr : `${dateStr}Z`
    const m = moment.utc(utcStr).local()
    return m.isValid() ? m : null
  }

  // Đo thời gian thực còn lại: Lấy Local Time hết hạn trừ cho Local Time hiện tại (moment())
  const getExactSecondsLeft = (): number => {
    const localExpiry = getLocalMoment(expiredTime)
    if (!localExpiry) return 0
    const now = moment()
    return Math.max(0, localExpiry.diff(now, 'seconds'))
  }

  // Tính tổng số giây chuẩn của đợt đếm ngược
  const calculateTotalSeconds = (): number => {
    if (totalSecondsProp && totalSecondsProp > 0) return totalSecondsProp
    const localExpiry = getLocalMoment(expiredTime)
    const localCreated = getLocalMoment(createdAt)
    if (localExpiry && localCreated && localExpiry.isAfter(localCreated)) {
      return Math.max(1, localExpiry.diff(localCreated, 'seconds'))
    }
    if (localExpiry) {
      const diff = localExpiry.diff(moment(), 'seconds')
      if (diff > 300) return 1800
    }
    return 300
  }

  const totalSeconds = calculateTotalSeconds()
  const [secondsLeft, setSecondsLeft] = useState<number>(getExactSecondsLeft)
  const progressVal = useRef(new Animated.Value(0)).current
  const pulseVal = useRef(new Animated.Value(0.85)).current
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    hasExpiredRef.current = false

    const updateProgress = () => {
      const remaining = getExactSecondsLeft()
      setSecondsLeft(remaining)

      if (totalSeconds > 0) {
        const ratio = Math.min(1, Math.max(0, (totalSeconds - remaining) / totalSeconds))
        progressVal.setValue(ratio)
      }

      if (remaining <= 0) {
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true
          onExpire?.()
        }
        return false
      }
      return true
    }

    const isRunning = updateProgress()
    if (!isRunning) return

    // Mỗi giây gọi Date.now() để trừ lại theo thời gian thực (Real-time Clock Sync)
    const timer = setInterval(() => {
      const stillRunning = updateProgress()
      if (!stillRunning) {
        clearInterval(timer)
      }
    }, 1000)

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseVal, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(pulseVal, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    )
    pulseAnimation.start()

    return () => {
      clearInterval(timer)
      pulseAnimation.stop()
    }
  }, [expiredTime, createdAt, totalSeconds])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const widthInterpolate = progressVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: widthInterpolate,
              opacity: pulseVal,
            },
          ]}
        />
      </View>
      {showCountdownText && (
        <Text style={styles.countdownText}>
          {t('request_valid_time', { time: formatTime(secondsLeft) })}
        </Text>
      )}
    </View>
  )
}

export default ExpiryProgressBar

const styles = ScaledSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    height: '6@ms',
    borderRadius: '3@ms',
    backgroundColor: palette.grey[100] || '#DFDFE0',
    overflow: 'hidden',
    marginBottom: '10@ms',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5F30AA',
    borderRadius: '3@ms',
  },
  countdownText: {
    fontSize: '12@ms',
    color: palette.grey[400] || '#C7C7C8',
    fontWeight: '600',
  },
})
