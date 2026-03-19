import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Pause = ({ width = 9, height = 12, color = '#222222', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 9 12" fill="none" style={style}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5873 0C1.16632 0 0.762587 0.175595 0.46491 0.488155C0.167233 0.800716 0 1.22464 0 1.66667V10C0 10.442 0.167233 10.866 0.46491 11.1785C0.762587 11.4911 1.16632 11.6667 1.5873 11.6667C2.00828 11.6667 2.41202 11.4911 2.70969 11.1785C3.00737 10.866 3.1746 10.442 3.1746 10V1.66667C3.1746 1.22464 3.00737 0.800716 2.70969 0.488155C2.41202 0.175595 2.00828 0 1.5873 0ZM6.74603 0C6.32505 0 5.92132 0.175595 5.62364 0.488155C5.32596 0.800716 5.15873 1.22464 5.15873 1.66667V10C5.15873 10.442 5.32596 10.866 5.62364 11.1785C5.92132 11.4911 6.32505 11.6667 6.74603 11.6667C7.16701 11.6667 7.57075 11.4911 7.86842 11.1785C8.1661 10.866 8.33333 10.442 8.33333 10V1.66667C8.33333 1.22464 8.1661 0.800716 7.86842 0.488155C7.57075 0.175595 7.16701 0 6.74603 0Z"
        fill={color}
      />
    </Svg>
  )
}

export default Pause
