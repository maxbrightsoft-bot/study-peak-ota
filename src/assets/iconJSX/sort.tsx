import React from 'react'
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Sort = ({ width = 16, height = 16, color = '#222222', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <G clip-path="url(#clip0_2139_12575)">
        <Path d="M10.666 7.99984V2.6665" stroke={color} stroke-linecap="round" stroke-linejoin="round" />
        <Path d="M5.33398 13.3333V8" stroke={color} stroke-linecap="round" stroke-linejoin="round" />
        <Path
          d="M8.66602 4.6665L10.666 2.6665L12.666 4.6665"
          stroke={color}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M3.33398 11.3335L5.33398 13.3335L7.33398 11.3335"
          stroke={color}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2139_12575">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default Sort
