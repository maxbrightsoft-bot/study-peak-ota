import React from 'react'
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Bot = ({ width = 24, height = 24, color = '#A1A1AA', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <G clip-path="url(#clip0_2206_7427)">
        <Path
          d="M6 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21H6C5.46957 21 4.96086 20.7893 4.58579 20.4142C4.21071 20.0391 4 19.5304 4 19V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5Z"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M9 16C10 16.667 11 17 12 17C13 17 14 16.667 15 16"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path d="M9 7L8 3" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <Path d="M15 7L16 3" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <Path d="M9 12V11" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <Path d="M15 12V11" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </G>
      <Defs>
        <ClipPath id="clip0_2206_7427">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default Bot
