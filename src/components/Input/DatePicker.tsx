import React, { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import CustomSelect from '../Select/CustomSelect'
import moment from 'moment'

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

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const minYear = minimumDate
      ? moment.utc(minimumDate).local().year()
      : currentYear - 100

    const maxYear = maximumDate
      ? moment.utc(maximumDate).local().year()
      : currentYear

    const years = []
    for (let y = maxYear; y >= minYear; y--) {
      years.push({
        label: `${y}`,
        value: y
      })
    }

    return years
  }, [minimumDate, maximumDate])

  const displayContent = () => {
    if (!value) return placeholderText || ''

    if (mode === 'date') {
      return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`
    }

    if (mode === 'time') {
      return `${value.getHours()}:${value.getMinutes()}`
    }

    return value.toLocaleString()
  }

  const handleYearChange = (year: number) => {
    const newDate = value ? new Date(value) : new Date()
    newDate.setFullYear(year)

    onChange(null, newDate)
  }

  return (
    <View>
      {isYear ? (
        <CustomSelect
          value={moment.utc(value).local()?.year()}
          onValueChange={handleYearChange}
          options={yearOptions}
          placeholder={placeholderText}
          icon={() => icon}
        />
      ) : (
        <>
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
        </>
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: palette.grey[100],
    borderRadius: '10@ms',
    paddingHorizontal: '12@ms',
    height: '50@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  yearText: {
    fontSize: '14@ms',
    fontWeight: '500',
    lineHeight: '22@ms',
    color: '#222222'
  },

  placeholderText: {
    color: palette.grey[400]
  }
})

export default DatePicker