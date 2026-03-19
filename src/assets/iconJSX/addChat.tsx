import React from 'react'
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const AddChat = ({ width = 16, height = 16, color = '#fff', style }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <G clip-path="url(#clip0_2540_873)">
        <Path
          d="M8.00467 13.3201C7.01049 13.322 6.02879 13.0986 5.13333 12.6667L2 13.3334L2.86667 10.7334C1.31733 8.44206 1.916 5.48539 4.26667 3.81739C6.61733 2.15006 9.99333 2.28673 12.1633 4.13739C13.4913 5.27073 14.1167 6.83073 13.9947 8.36406"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M10.667 12.6667H14.667"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M12.667 10.6667V14.6667"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2540_873">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default AddChat
