import React from 'react'
import { View, Text } from 'react-native'
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell
} from 'react-native-confirmation-code-field'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

interface CodeInputProps {
  value: string
  onChangeText?: (text: string) => void
  editable?: boolean
  cellCount?: number
}

const CodeInput = ({
  value,
  onChangeText,
  editable = true,
  cellCount = 6
}: CodeInputProps) => {
  const ref = useBlurOnFulfill({ value, cellCount })
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChangeText || (() => {})
  })

  return (
    <View style={styles.container}>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={onChangeText}
        cellCount={cellCount}
        rootStyle={styles.codeFieldRoot}
        keyboardType="default"
        textContentType="oneTimeCode"
        autoCapitalize="characters"
        editable={editable}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            style={[
              styles.cell,
              isFocused && styles.focusCell,
              !editable && styles.readOnlyCell
            ]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            <Text
              style={[
                styles.cellText,
                !editable && styles.readOnlyCellText
              ]}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

export default CodeInput

const styles = ScaledSheet.create({
  container: {
    marginVertical: '16@ms',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  codeFieldRoot: {
    width: '290@ms',
    justifyContent: 'space-between'
  },
  cell: {
    width: '42@ms',
    height: '50@ms',
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    borderRadius: '10@ms',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  focusCell: {
    borderColor: palette.main[500] || '#835CF6',
    borderWidth: 2
  },
  readOnlyCell: {
    backgroundColor: palette.main[50] || '#F4F3FF',
    borderColor: palette.main[100] || '#DFD6EE'
  },
  cellText: {
    fontSize: '22@ms',
    fontWeight: '800',
    color: palette.grey[900],
    textAlign: 'center'
  },
  readOnlyCellText: {
    color: palette.main[600] || '#7036EC'
  }
})
