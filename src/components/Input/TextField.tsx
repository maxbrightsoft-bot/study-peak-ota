import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, Platform, KeyboardTypeOptions } from 'react-native'
import styles from './styles'
import { palette } from '@/theme'

export const KeyboardType = {
  default: 'default',
  numberPad: 'number-pad',
  decimalPad: 'decimal-pad',
  numeric: 'numeric',
  emailAddress: 'email-address',
  phonePad: 'phone-pad',
  numbersAndPunctuation: 'numbers-and-punctuation'
}

type TextFieldProps = {
  style?: any
  inputContainerStyle?: any
  label?: string
  isRequired?: boolean
  pointerEvents?: any
  labelComponent?: string
  labelStyle?: object
  error?: any
  readOnly?: boolean
  labelReadOnly?: any
  onPress?: () => void
  textInputStyle?: any
  textInputRightStyle?: any
  onFocus?: any
  onBlur?: any
  small?: any
  numberOfLines?: number
  multiline?: boolean
  disabled?: boolean
  onChangeText?: any
  keyboardType?: KeyboardTypeOptions
  inputRef?: any
  onEndEditing?: any
  containerInputStyle?: any
  placeholderTextColor?: any
  placeholder?: any
  secureTextEntry?: boolean
  value?: string
  maxLength?: number
  lineHeight?: number
}

const TextField = ({
  style,
  label = '',
  isRequired,
  multiline,
  pointerEvents,
  labelComponent,
  labelStyle,
  error,
  readOnly = false,
  labelReadOnly,
  onPress,
  numberOfLines,
  textInputStyle,
  textInputRightStyle,
  onFocus,
  onBlur,
  disabled,
  onChangeText,
  keyboardType,
  inputRef,
  onEndEditing,
  containerInputStyle,
  placeholder,
  secureTextEntry,
  value,
  maxLength,
  lineHeight = 20
}: TextFieldProps) => {
  const [active, setIsActive] = useState(false)

  const onFocusClick = useCallback(
    (e: any) => {
      setIsActive(true)
      onFocus && onFocus()
    },
    [setIsActive, onFocus]
  )

  const onBlurClick = useCallback(
    (e: any) => {
      setIsActive(false)
      onBlur && onBlur()
    },
    [setIsActive, onBlur]
  )

  const inputHeight = useMemo(() => {
    if (!numberOfLines) return
    if (multiline && numberOfLines > 1) {
      return numberOfLines * lineHeight + (Platform.OS === 'android' ? 8 : 4)
    }
    return undefined
  }, [multiline, numberOfLines, lineHeight])

  // const isBothReadyOnlyAndLabel = label && readOnly;

  const renderLabel = useCallback(() => {
    if (labelComponent) {
      return labelComponent
    } else if (label) {
      return (
        <View style={styles.labelView}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          {isRequired && <Text style={styles.requiredText}> *</Text>}
        </View>
      )
    } else {
      return null
    }
  }, [labelComponent, label, isRequired, labelStyle])

  const editable = !readOnly && !labelReadOnly && !onPress
  const _keyboardType =
    keyboardType === KeyboardType.numbersAndPunctuation
      ? Platform.OS === 'android'
        ? 'numeric'
        : 'numbers-and-punctuation'
      : keyboardType
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      disabled={!onPress || disabled}
      onPress={onPress}
    >
      {renderLabel()}
      <View style={[containerInputStyle, { paddingHorizontal: 12, paddingVertical: 8 }]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            textInputStyle,
            textInputRightStyle,
            { paddingHorizontal: 12, paddingVertical: 8 },
            style,
            inputHeight ? { height: inputHeight } : null,
            multiline &&
              numberOfLines && {
                textAlignVertical: 'top'
              }
          ]}
          onFocus={onFocusClick}
          onBlur={onBlurClick}
          editable={editable}
          numberOfLines={numberOfLines}
          multiline={multiline}
          pointerEvents={pointerEvents}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          keyboardType={_keyboardType}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={palette.grey[400]}
          value={value}
          maxLength={maxLength}
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </TouchableOpacity>
  )
}

export default TextField
