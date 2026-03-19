import React from 'react'
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Reduce = ({ width = 16, height = 16, color = '#7036EC', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" style={style}>
      <G clipPath="url(#clip0_2206_6968)">
        <Path d="M3.3335 8H12.6668" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      <Defs>
        <ClipPath id="clip0_2206_6968">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default Reduce
