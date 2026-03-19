import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

type Props = {
  isYear?: boolean
  icon?: React.JSX.Element
  onChange: (_: any, selectedDate?: Date | undefined) => void
  mode: 'date' | 'time' | 'datetime'
  value: Date | null
  maximumDate?: Date
  minimumDate?: Date
  placeholderText?: string
}

const DatePicker = ({
  value,
  onChange,
  mode,
  isYear,
  icon,
  maximumDate,
  minimumDate,
  placeholderText
}: Props) => {
  const [visible, setVisible] = useState(false)

  const displayContent = () => {
    if (!value) return placeholderText || ''

    if (isYear) return value.getFullYear()

    if (mode === 'date') {
      return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`
    }

    if (mode === 'time') {
      return `${value.getHours()}:${value.getMinutes()}`
    }

    return value.toLocaleString()
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.yearText, !value && styles.placeholderText]}>
          {displayContent()}
        </Text>
        {icon}
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={visible}
        mode={mode}
        date={value || new Date()}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        onConfirm={(date) => {
          onChange(null, date)
          setVisible(false)
        }}
        onCancel={() => setVisible(false)}
      />
    </View>
  )
}

export default DatePicker

const styles = ScaledSheet.create({
  container: {
    backgroundColor: palette.grey[100],
    borderRadius: '8@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '10@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  yearText: {
    fontSize: '14@ms',
    fontWeight: '500',
    lineHeight: 22,
    color: palette.main[600]
  },

  placeholderText: {
    color: palette.grey[400]
  }
})