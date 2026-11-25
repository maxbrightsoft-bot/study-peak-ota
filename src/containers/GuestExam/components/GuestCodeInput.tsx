import React, { memo, useRef } from 'react'
import { NativeSyntheticEvent, Platform, TextInput, TextInputKeyPressEventData, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { GUEST_CODE_LENGTH } from '../configs/constants'
import { sanitizeGuestCode, writeCodeAt } from '../configs/helpers'

type GuestCodeInputProps = {
  value: string
  hasError?: boolean
  disabled?: boolean
  accessibilityLabel: string
  onChange: (value: string) => void
  onSubmit: () => void
}

const BOXES = Array.from({ length: GUEST_CODE_LENGTH }, (_, i) => i)

/** An ASCII keyboard without autocorrect/capitalisation: the code is case-sensitive. */
const CODE_KEYBOARD = Platform.OS === 'android' ? 'visible-password' : 'ascii-capable'

const GuestCodeInput = ({ value, hasError, disabled, accessibilityLabel, onChange, onSubmit }: GuestCodeInputProps) => {
  const inputsRef = useRef<Array<TextInput | null>>([])
  // Latest code, updated synchronously on writes so focus handlers fired
  // before the next render don't see a stale value (focus would bounce back).
  const valueRef = useRef(value)
  valueRef.current = value

  const commit = (code: string) => {
    valueRef.current = code
    onChange(code)
  }

  const focusBox = (index: number) => {
    inputsRef.current[Math.max(0, Math.min(index, GUEST_CODE_LENGTH - 1))]?.focus()
  }

  const writeAt = (index: number, text: string) => {
    const current = valueRef.current
    const { code, focusIndex } = writeCodeAt(current, index, text)
    if (code !== current) commit(code)
    focusBox(focusIndex)
  }

  // Removes one char; the chars after it move left (no gaps).
  const removeAt = (index: number) => {
    const current = valueRef.current
    if (index < 0 || index >= current.length) return
    commit(current.slice(0, index) + current.slice(index + 1))
    focusBox(index)
  }

  const handleChangeText = (index: number, raw: string) => {
    const chars = sanitizeGuestCode(raw)
    const old = valueRef.current[index] || ''
    if (!chars) {
      // The box's char was deleted (Backspace on a filled box).
      if (old && !raw) removeAt(index)
      return
    }
    // One typed char next to the box's old char replaces it in place; a longer value (paste,
    // autofill) fills forward from this box (from the first box when it is a whole code).
    let typed = chars
    if (old && chars.length === 2) {
      if (chars.startsWith(old)) typed = chars.slice(1)
      else if (chars.endsWith(old)) typed = chars.slice(0, -1)
    }
    writeAt(typed.length >= GUEST_CODE_LENGTH ? 0 : index, typed)
  }

  const handleKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    // Backspace on an empty box removes the char before it (a filled box is handled by onChangeText).
    if (e.nativeEvent.key === 'Backspace' && !valueRef.current[index] && index > 0) removeAt(index - 1)
  }

  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel}>
      {BOXES.map(index => {
        const char = value[index] || ''
        return (
          <TextInput
            key={index}
            ref={el => {
              inputsRef.current[index] = el
            }}
            value={char}
            editable={!disabled}
            style={[styles.box, !!char && styles.boxFilled, hasError && styles.boxError]}
            keyboardType={CODE_KEYBOARD}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            selectTextOnFocus
            returnKeyType={index === GUEST_CODE_LENGTH - 1 ? 'done' : 'next'}
            accessibilityLabel={`${accessibilityLabel} ${index + 1}`}
            onFocus={() => {
              // Always type into the first empty box.
              if (index > valueRef.current.length) focusBox(valueRef.current.length)
            }}
            onChangeText={text => handleChangeText(index, text)}
            onKeyPress={e => handleKeyPress(index, e)}
            onSubmitEditing={onSubmit}
            blurOnSubmit={index === GUEST_CODE_LENGTH - 1}
          />
        )
      })}
    </View>
  )
}

export default memo(GuestCodeInput)

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    gap: '8@ms',
    justifyContent: 'center'
  },
  box: {
    width: '52@ms',
    height: '60@ms',
    borderWidth: '1.5@ms',
    borderColor: palette.main[300],
    borderRadius: '12@ms',
    backgroundColor: palette.grey[0],
    textAlign: 'center',
    fontSize: '26@ms',
    fontWeight: '700',
    color: palette.main[600],
    padding: 0
  },
  boxFilled: {
    backgroundColor: palette.main[50]
  },
  boxError: {
    borderColor: palette.red[900]
  }
})
