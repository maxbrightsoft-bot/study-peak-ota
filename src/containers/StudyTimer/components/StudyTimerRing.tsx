import React, { ReactNode } from 'react'
import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

type Props = {
  /** 0..1; success colour when 1, main below. */
  fraction: number
  size: number
  children?: ReactNode
}

const STROKE = 10

const StudyTimerRing = ({ fraction, size, children }: Props) => {
  const clamped = Math.min(1, Math.max(0, fraction))
  const radius = (size - STROKE) / 2
  const circumference = 2 * Math.PI * radius
  const color = clamped >= 1 ? palette.success.main : palette.main[600]

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.grey[200]}
          strokeWidth={STROKE}
          fill="none"
        />
        {clamped > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${circumference * clamped} ${circumference}`}
            fill="none"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        ) : null}
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  )
}

export default StudyTimerRing

const styles = ScaledSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  svg: {
    position: 'absolute'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '16@ms'
  }
})
