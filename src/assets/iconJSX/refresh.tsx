import React from 'react'
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Refresh = ({ width = 20, height = 20, color = '#222222', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <G clip-path="url(#clip0_2502_5261)">
        <Path
          d="M16.6663 9.16658C16.4625 7.7001 15.7822 6.3413 14.7302 5.2995C13.6782 4.25769 12.3128 3.59068 10.8444 3.40121C9.376 3.21174 7.88603 3.51032 6.60401 4.25096C5.32199 4.99159 4.31905 6.1332 3.74967 7.49992M3.33301 4.16658V7.49992H6.66634"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M3.33301 10.8335C3.53681 12.3 4.21712 13.6588 5.26914 14.7006C6.32117 15.7424 7.68654 16.4094 9.15495 16.5989C10.6234 16.7883 12.1133 16.4898 13.3953 15.7491C14.6774 15.0085 15.6803 13.8669 16.2497 12.5002M16.6663 15.8335V12.5002H13.333"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2502_5261">
          <Rect width="20" height="20" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default Refresh
