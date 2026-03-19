import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const arrowRight = ({ width = 16, height = 16, color = '#71717A', style }: Props) => {
  return (
    <Svg
      width={width}
      height={height}
      style={style}
      viewBox="0 0 16 16"
      fill="none"
    >
      <Path
        d="M6 12L10 8L6 4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default arrowRight
