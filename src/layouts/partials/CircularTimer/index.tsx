import React, { FC, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { useTranslation } from 'react-i18next'

import {
  DEFAULT_CIRCULAR_TIMER_SIZE,
  STROKE_WIDTH,
} from '../../configs/constants'
import { palette } from '@/theme/colors'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CircularTimerProps {
  edit: boolean
  value?: number
  remainSeconds?: number
  onChange?: (val: number) => void
  maxMinutes: number
  size?: number
}

const CircularTimer: FC<CircularTimerProps> = ({
  edit,
  value = 0,
  remainSeconds = 0,
  onChange,
  maxMinutes,
  size = DEFAULT_CIRCULAR_TIMER_SIZE,
}) => {
  const { t } = useTranslation()

  const radius = (size - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius

  const minutes = edit ? value : remainSeconds / 60

  const animatedMinutes = useRef(
    new Animated.Value(minutes)
  ).current

  useEffect(() => {
    Animated.timing(animatedMinutes, {
      toValue: minutes,
      duration: edit ? 0 : 300,
      useNativeDriver: false,
    }).start()
  }, [minutes, edit])

  const strokeDashoffset = animatedMinutes.interpolate({
    inputRange: [0, maxMinutes],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  })

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => edit,
      onPanResponderMove: (_, gesture) => {
        const delta =
          (gesture.dx / size) * maxMinutes

        animatedMinutes.stopAnimation((current) => {
          let next = current + delta
          next = Math.max(0, Math.min(maxMinutes, next))

          animatedMinutes.setValue(next)
          onChange?.(Math.round(next))
        })
      },
    })
  ).current

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.main[300]}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.main[500]}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View style={styles.center}>
          <Text style={styles.text}>
            {t('minutes_short_format', {
              mins: Math.floor(minutes),
            })}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default CircularTimer

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '500',
    color: '#5D5D5B',
  },
})
