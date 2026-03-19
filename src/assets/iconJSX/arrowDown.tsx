import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const ArrowDown = ({ width = 24, height = 24, color = '#fff', style }: Props) => {
  return (
    <Svg
      width={width}
      height={height}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ArrowDown
