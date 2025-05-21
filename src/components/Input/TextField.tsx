import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardTypeOptions,
} from "react-native";
import styles from "./styles";

export const KeyboardType = {
  default: "default",
  numberPad: "number-pad",
  decimalPad: "decimal-pad",
  numeric: "numeric",
  emailAddress: "email-address",
  phonePad: "phone-pad",
  numbersAndPunctuation: "numbers-and-punctuation",
};

type TextFieldProps = {
  style?: any;
  inputContainerStyle?: any;
  label?: string;
  isRequired?: boolean;
  pointerEvents?: any;
  labelComponent?: string;
  labelStyle?: object;
  error?: any;
  readOnly?: boolean;
  labelReadOnly?: any;
  onPress?: () => void;
  textInputStyle?: any;
  textInputRightStyle?: any;
  onFocus?: any;
  onBlur?: any;
  small?: any;
  onChangeText?: any;
  keyboardType?: KeyboardTypeOptions;
  inputRef?: any;
  onEndEditing?: any;
  containerInputStyle?: any;
  placeholderTextColor?: any;
  placeholder?: any;
  secureTextEntry?: boolean;
  value?: string;
  maxLength?: number;
};

const TextField = ({
  style,
  label = "",
  isRequired,
  pointerEvents,
  labelComponent,
  labelStyle,
  error,
  readOnly = false,
  labelReadOnly,
  onPress,
  textInputStyle,
  textInputRightStyle,
  onFocus,
  onBlur,
  small,
  onChangeText,
  keyboardType,
  inputRef,
  onEndEditing,
  containerInputStyle,
  placeholder,
  secureTextEntry,
  value,
  maxLength,
}: TextFieldProps) => {
  const [active, setIsActive] = useState(false);

  const onFocusClick = useCallback(
    (e: any) => {
      setIsActive(true);
      onFocus && onFocus();
    },
    [setIsActive, onFocus]
  );

  const onBlurClick = useCallback(
    (e: any) => {
      setIsActive(false);
      onBlur && onBlur();
    },
    [setIsActive, onBlur]
  );

  // const isBothReadyOnlyAndLabel = label && readOnly;

  const renderLabel = useCallback(() => {
    if (labelComponent) {
      return labelComponent;
    } else if (label) {
      return (
        <View style={styles.labelView}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          {isRequired && <Text style={styles.requiredText}> *</Text>}
        </View>
      );
    } else {
      return null;
    }
  }, [labelComponent, label, isRequired, labelStyle]);

  const editable = !readOnly && !labelReadOnly && !onPress;
  const _keyboardType =
    keyboardType === KeyboardType.numbersAndPunctuation
      ? Platform.OS === "android"
        ? "numeric"
        : "numbers-and-punctuation"
      : keyboardType;
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      disabled={!onPress}
      onPress={onPress}
    >
      {renderLabel()}
      <View style={[containerInputStyle]}>
        <TextInput
          ref={inputRef}
          style={[styles.textInput, textInputStyle, textInputRightStyle, !!style && { borderBottomWidth: 0 }]}
          onFocus={onFocusClick}
          onBlur={onBlurClick}
          editable={editable}
          pointerEvents={pointerEvents}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          keyboardType={_keyboardType}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          value={value}
          maxLength={maxLength}
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </TouchableOpacity>
  );
};

export default TextField;
