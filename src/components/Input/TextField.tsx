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
  rightComponent?: React.ReactNode
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
  lineHeight = 20,
  rightComponent
}: TextFieldProps) => {
  const [active, setIsActive] = useState(false)

  const onFocusClick = useCallback(
    (e: any) => {
      setIsActive(true)
      onFocus && onFocus(e)
    },
    [onFocus]
  )

  const onBlurClick = useCallback(
    (e: any) => {
      setIsActive(false)
      onBlur && onBlur(e)
    },
    [onBlur]
  )

  const inputHeight = useMemo(() => {
    if (multiline && numberOfLines && numberOfLines > 1) {
      return numberOfLines * lineHeight + (Platform.OS === 'android' ? 8 : 4)
    }
    return undefined
  }, [multiline, numberOfLines, lineHeight])

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
  
  const _keyboardType = useMemo(() => {
    if (keyboardType === KeyboardType.numbersAndPunctuation) {
      return Platform.OS === 'android' ? 'numeric' : 'numbers-and-punctuation'
    }
    return keyboardType
  }, [keyboardType])

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      disabled={!onPress || disabled}
      onPress={onPress}
      activeOpacity={1}
    >
      {renderLabel()}
      <View style={[styles.inputContainer, containerInputStyle, { paddingVertical: 8 }]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
            textInputStyle,
            textInputRightStyle,
            inputHeight ? { height: inputHeight } : null,
            multiline && numberOfLines ? { textAlignVertical: 'top' } : null
          ]}
          onFocus={onFocusClick}
          onBlur={onBlurClick}
          editable={editable && !disabled}
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
          underlineColorAndroid="transparent"
        />
        {rightComponent && (
          <View style={{ marginRight: 10, justifyContent: 'center' }}>
            {rightComponent}
          </View>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </TouchableOpacity>
  )
}

export default React.memo(TextField)