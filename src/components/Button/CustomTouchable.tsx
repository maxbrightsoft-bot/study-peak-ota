import { palette } from '@/theme'
import React from 'react'
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle
} from 'react-native'

type Props = TouchableOpacityProps & {
  disabledStyle?: StyleProp<ViewStyle>
}

const CustomTouchable = ({
  disabled,
  style,
  disabledStyle,
  children,
  ...rest
}: Props) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        style,
        disabled && { borderColor: palette.grey[300] },
        disabled && disabledStyle
      ]}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  )
}

export default CustomTouchable
