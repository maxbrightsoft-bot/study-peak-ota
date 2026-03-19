import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Book = ({ width = 24, height = 24, color = '#C7C7C7', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 16.144V4.99801C2 3.90001 2.886 3.00801 3.982 3.07501C4.959 3.13501 6.113 3.25401 7 3.48701C8.05 3.76401 9.296 4.35401 10.282 4.87501C10.589 5.03801 10.916 5.15001 11.25 5.21401V20.393C10.9438 20.326 10.6483 20.217 10.372 20.069C9.372 19.537 8.082 18.919 7 18.633C6.123 18.402 4.984 18.283 4.015 18.223C2.906 18.153 2 17.256 2 16.144ZM12.75 20.393C13.0562 20.326 13.3517 20.217 13.628 20.069C14.628 19.537 15.918 18.919 17 18.633C17.877 18.402 19.016 18.283 19.985 18.223C21.094 18.153 22 17.255 22 16.143V4.93401C22 3.86201 21.154 2.98101 20.082 3.01901C18.953 3.05901 17.547 3.17501 16.5 3.48901C15.592 3.76001 14.535 4.30501 13.674 4.80401C13.3852 4.97073 13.0741 5.09532 12.75 5.17401V20.393Z"
        fill={color}
      />
    </Svg>
  )
}

export default Book
