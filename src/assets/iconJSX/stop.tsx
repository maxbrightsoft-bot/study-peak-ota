import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Stop = ({ width = 12, height = 12, color = '#222222', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 12" fill="none">
      <Path
        d="M0 2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0H10C10.5304 0 11.0391 0.210714 11.4142 0.585786C11.7893 0.960859 12 1.46957 12 2V10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12H2C1.46957 12 0.960859 11.7893 0.585786 11.4142C0.210714 11.0391 0 10.5304 0 10V2Z"
        fill={color}
      />
    </Svg>
  )
}

export default Stop
