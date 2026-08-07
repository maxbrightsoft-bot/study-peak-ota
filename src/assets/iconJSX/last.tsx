import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Last = ({ width = 20, height = 20, color = '#222222', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" >
      <Path
        d="M11.363 9.31823C11.5356 9.50337 11.6316 9.74709 11.6316 10.0002C11.6316 10.2534 11.5356 10.4971 11.363 10.6822L6.731 15.6452C6.111 16.3092 5 15.8712 5 14.9632V5.03723C5 4.12923 6.112 3.69123 6.731 4.35523L11.363 9.31823Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.264 10.0002L7 7.57419V12.4262L9.264 10.0002ZM11.364 10.6822C11.5366 10.4971 11.6326 10.2533 11.6326 10.0002C11.6326 9.74704 11.5366 9.50332 11.364 9.31819L6.73 4.35519C6.111 3.69019 5 4.12919 5 5.03719V14.9632C5 15.8712 6.112 16.3092 6.731 15.6452L11.364 10.6822Z"
        fill={color}
      />
      <Path
        d="M16.363 9.31823C16.5356 9.50337 16.6316 9.74709 16.6316 10.0002C16.6316 10.2534 16.5356 10.4971 16.363 10.6822L11.731 15.6452C11.111 16.3092 10 15.8712 10 14.9632V5.03723C10 4.12923 11.112 3.69123 11.731 4.35523L16.363 9.31823Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.264 10.0002L12 7.57419V12.4262L14.264 10.0002ZM16.364 10.6822C16.5366 10.4971 16.6326 10.2533 16.6326 10.0002C16.6326 9.74704 16.5366 9.50332 16.364 9.31819L11.73 4.35519C11.111 3.69019 10 4.12919 10 5.03719V14.9632C10 15.8712 11.112 16.3092 11.731 15.6452L16.364 10.6822Z"
        fill={color}
      />
    </Svg>
  )
}

export default Last
