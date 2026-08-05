import React, { useState } from 'react'
import {
  Text,
  TextStyle,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
  ScrollView
} from 'react-native'
import Tooltip from 'react-native-walkthrough-tooltip'
import { Portal } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

const PortalModal = ({ visible, children }: { visible: boolean; children: React.ReactNode }) => {
  if (!visible) return null
  return <Portal>{children}</Portal>
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
  const insets = useSafeAreaInsets()
  const [isVisible, setIsVisible] = useState(false)

  if (!text) return null

  return (
    <Tooltip
      modalComponent={PortalModal}
      isVisible={isVisible}
      content={
        <ScrollView contentContainerStyle={styles.contentContainer as any} showsVerticalScrollIndicator={true}>
          <TouchableOpacity activeOpacity={1}>
            <Text style={[styles.tooltipText as any, tooltipTextStyle]}>{text}</Text>
          </TouchableOpacity>
        </ScrollView>
      }
      onClose={() => setIsVisible(false)}
      placement={placement}
      backgroundColor="rgba(0, 0, 0, 0.4)"
      contentStyle={[styles.tooltip as any, tooltipStyle]}
      arrowSize={{ width: 12, height: 6 }}
      parentWrapperStyle={[{ flexShrink: 1, alignSelf: 'flex-start' }, containerStyle]}
      showChildInTooltip={false}
      closeOnContentInteraction={false}
      displayInsets={{
        top: Math.max(insets.top, 16),
        bottom: Math.max(insets.bottom, 16),
        left: Math.max(insets.left, 16),
        right: Math.max(insets.right, 16)
      }}
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
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: '13@ms',
    fontWeight: '400',
    lineHeight: '18@ms'
  }
})

export default TextTooltip
