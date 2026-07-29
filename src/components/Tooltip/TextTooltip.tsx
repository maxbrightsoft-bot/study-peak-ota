import React, { useState } from 'react'
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacityProps
} from 'react-native'
import Tooltip from 'react-native-walkthrough-tooltip'
import { ScaledSheet } from 'react-native-size-matters'

export interface TextTooltipProps {
  text: string
  numberOfLines?: number
  textStyle?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
  tooltipStyle?: StyleProp<ViewStyle>
  tooltipTextStyle?: StyleProp<TextStyle>
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  children?: React.ReactNode
  touchableProps?: Omit<TouchableOpacityProps, 'onPress' | 'style'>
}

const TextTooltip = ({
  text,
  numberOfLines = 1,
  textStyle,
  containerStyle,
  tooltipStyle,
  tooltipTextStyle,
  placement = 'top',
  children,
  touchableProps
}: TextTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  if (!text) return null

  return (
    <Tooltip
      isVisible={isVisible}
      content={
        <View style={styles.contentContainer}>
          <Text style={[styles.tooltipText, tooltipTextStyle]}>{text}</Text>
        </View>
      }
      onClose={() => setIsVisible(false)}
      placement={placement}
      backgroundColor="rgba(0, 0, 0, 0.4)"
      contentStyle={[styles.tooltip, tooltipStyle]}
      arrowSize={{ width: 12, height: 6 }}
      parentWrapperStyle={[{ flexShrink: 1 }, containerStyle]}
      showChildInTooltip={false}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsVisible(true)}
        style={[{ flexShrink: 1 }, containerStyle]}
        {...touchableProps}
      >
        {children ? (
          children
        ) : (
          <Text numberOfLines={numberOfLines} ellipsizeMode="tail" style={textStyle}>
            {text}
          </Text>
        )}
      </TouchableOpacity>
    </Tooltip>
  )
}

const styles = ScaledSheet.create({
  contentContainer: {
    padding: '6@ms',
    maxWidth: '260@ms'
  },
  tooltip: {
    backgroundColor: '#222222',
    borderRadius: '8@ms',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: '2@ms' },
    shadowOpacity: 0.25,
    shadowRadius: '4@ms',
    elevation: '5@ms'
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: '13@ms',
    fontWeight: '400',
    lineHeight: '18@ms'
  }
})

export default TextTooltip
