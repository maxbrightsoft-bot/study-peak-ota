import React from 'react'
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import { ViewStyle } from 'react-native'

interface Props {
  width?: number | string
  height?: number | string
  color?: string
  style?: ViewStyle
}

const Calendar = ({
  width = 20,
  height = 20,
  color = '#222222',
  style,
}: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
<G clip-path="url(#clip0_2540_2101)">
<Path d="M3.33301 5.83317C3.33301 5.39114 3.5086 4.96722 3.82116 4.65466C4.13372 4.3421 4.55765 4.1665 4.99967 4.1665H14.9997C15.4417 4.1665 15.8656 4.3421 16.1782 4.65466C16.4907 4.96722 16.6663 5.39114 16.6663 5.83317V15.8332C16.6663 16.2752 16.4907 16.6991 16.1782 17.0117C15.8656 17.3242 15.4417 17.4998 14.9997 17.4998H4.99967C4.55765 17.4998 4.13372 17.3242 3.82116 17.0117C3.5086 16.6991 3.33301 16.2752 3.33301 15.8332V5.83317Z" stroke="#222222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M13.333 2.5V5.83333" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M6.66699 2.5V5.83333" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M3.33301 9.1665H16.6663" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M9.16699 12.5H10.0003" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M10 12.5V15" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</G>
<Defs>
<ClipPath id="clip0_2540_2101">
<Rect width={width} height={height} fill="white"/>
</ClipPath>
</Defs>
</Svg>

  )
}

export default Calendar
