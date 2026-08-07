import React from 'react'
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Edit = ({ width = 20, height = 20, color = '#222222', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <G clip-path="url(#clip0_2425_5614)">
        <Path
          d="M5.83325 5.8335H4.99992C4.55789 5.8335 4.13397 6.00909 3.82141 6.32165C3.50885 6.63421 3.33325 7.05814 3.33325 7.50016V15.0002C3.33325 15.4422 3.50885 15.8661 3.82141 16.1787C4.13397 16.4912 4.55789 16.6668 4.99992 16.6668H12.4999C12.9419 16.6668 13.3659 16.4912 13.6784 16.1787C13.991 15.8661 14.1666 15.4422 14.1666 15.0002V14.1668"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M16.9875 5.48759C17.3157 5.15938 17.5001 4.71424 17.5001 4.25009C17.5001 3.78594 17.3157 3.34079 16.9875 3.01259C16.6593 2.68438 16.2142 2.5 15.75 2.5C15.2858 2.5 14.8407 2.68438 14.5125 3.01259L7.5 10.0001V12.5001H10L16.9875 5.48759Z"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M13.3333 4.1665L15.8333 6.6665"
          stroke="#222222"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2425_5614">
          <Rect width="20" height="20" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default Edit
