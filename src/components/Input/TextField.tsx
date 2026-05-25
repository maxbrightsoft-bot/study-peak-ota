import React, { useCallback, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, Platform, KeyboardTypeOptions, TextInputProps } from 'react-native'
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
  autoFocus?: boolean
  autoCorrect?: boolean
  autoComplete?: TextInputProps['autoComplete']
  spellCheck?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  textContentType?: TextInputProps['textContentType']
  importantForAutofill?: TextInputProps['importantForAutofill']
  disableFullscreenUI?: boolean
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
  placeholderTextColor,
  placeholder,
  secureTextEntry,
  value,
  maxLength,
  lineHeight = 20,
  rightComponent,
  autoFocus,
  autoCorrect,
  autoComplete,
  spellCheck,
  autoCapitalize,
  textContentType,
  importantForAutofill,
  disableFullscreenUI,
}: TextFieldProps) => {
  const internalRef = React.useRef<any>(null)
  const resolvedRef = inputRef || internalRef
  const nativeText = React.useRef(value ?? '')
  const pendingText = React.useRef<string | undefined>(undefined)
  const isFocused = React.useRef(false)

  React.useEffect(() => {
    if (value === undefined) {
      pendingText.current = undefined
      return
    }

    if (value === nativeText.current) {
      pendingText.current = undefined
      return
    }

    if (isFocused.current) {
      pendingText.current = value
      return
    }

    pendingText.current = undefined
    nativeText.current = value

    resolvedRef.current?.setNativeProps({ text: value })
  }, [value, resolvedRef])

  const _onChangeText = useCallback(
    (text: string) => {
      nativeText.current = text
      if (pendingText.current === text) {
        pendingText.current = undefined
      }
      onChangeText && onChangeText(text)
    },
    [onChangeText]
  )

  const onFocusClick = useCallback(
    (e: any) => {
      isFocused.current = true
      onFocus && onFocus(e)
    },
    [onFocus]
  )

  const onBlurClick = useCallback(
    (e: any) => {
      isFocused.current = false

      const nextText = pendingText.current ?? value
      pendingText.current = undefined

      if (nextText !== undefined && nextText !== nativeText.current) {
        nativeText.current = nextText
        resolvedRef.current?.setNativeProps({ text: nextText })
      }

      onBlur && onBlur(e)
    },
    [onBlur, resolvedRef, value]
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
          ref={resolvedRef}
          style={[
            styles.textInput,
            { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
            multiline && numberOfLines ? { textAlignVertical: 'top' } : null,
            inputHeight ? { height: inputHeight } : null,
            textInputStyle,
            textInputRightStyle,
          ]}
          onFocus={onFocusClick}
          onBlur={onBlurClick}
          editable={editable && !disabled}
          numberOfLines={numberOfLines}
          multiline={multiline}
          pointerEvents={pointerEvents}
          onChangeText={_onChangeText}
          onEndEditing={onEndEditing}
          keyboardType={_keyboardType}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={placeholderTextColor || palette.grey[400]}
          defaultValue={value ?? ''}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          importantForAutofill={importantForAutofill}
          disableFullscreenUI={disableFullscreenUI}
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

export default TextField
