import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, Line, Polygon } from 'react-native-svg'
import { palette } from '@/theme/colors'
import { ConfidenceLevel } from '@/utils/enums'

interface Props {
  confidence?: ConfidenceLevel
  size?: number
}

const ConfidenceIcon = memo(({ confidence, size = 18 }: Props) => {
  const isSure = confidence === ConfidenceLevel.Sure
  const isUnsure = confidence === ConfidenceLevel.Unsure
  const isRandom = confidence === ConfidenceLevel.Random
  const hasConfidence = isSure || isUnsure || isRandom

  const borderColor = isSure
    ? palette.confidence.sure.border
    : isUnsure
    ? palette.confidence.unsure.border
    : isRandom
    ? palette.confidence.random.border
    : palette.grey[400]

  const bgColor = isSure
    ? palette.confidence.sure.bg
    : isUnsure
    ? palette.confidence.unsure.bg
    : isRandom
    ? palette.confidence.random.bg
    : '#F9FAFB'

  const iconColor = isSure
    ? palette.confidence.sure.text
    : isUnsure
    ? palette.confidence.unsure.text
    : isRandom
    ? palette.confidence.random.text
    : palette.grey[500]

  const strokeWidth = 1.8

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.max(4, Math.round(size * 0.22)),
          borderWidth: hasConfidence ? 1.5 : 1,
          borderStyle: hasConfidence ? 'solid' : 'dashed',
          borderColor,
          backgroundColor: bgColor,
        },
      ]}
    >
      {hasConfidence ? (
        <Svg width={size} height={size} viewBox="0 0 20 20">
          {isSure && (
            <Circle
              cx="10"
              cy="10"
              r="4.5"
              stroke={iconColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          )}
          {isUnsure && (
            <Polygon
              points="10,5.2 15,13.8 5,13.8"
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {isRandom && (
            <>
              <Line
                x1="6.5"
                y1="6.5"
                x2="13.5"
                y2="13.5"
                stroke={iconColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <Line
                x1="13.5"
                y1="6.5"
                x2="6.5"
                y2="13.5"
                stroke={iconColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            </>
          )}
        </Svg>
      ) : (
        <Text
          style={{
            color: iconColor,
            fontWeight: '700',
            fontSize: Math.max(10, Math.round(size * 0.55)),
            textAlign: 'center',
            lineHeight: size,
          }}
        >
          ?
        </Text>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
})

export default ConfidenceIcon
