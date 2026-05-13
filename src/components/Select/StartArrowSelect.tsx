import { palette, TYPO } from '@/theme'
import { Option } from '@/utils/types'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  value: any
  onValueChange: (value: any) => void
  items: Option[]
  placeholder?: string
}

const StartArrowSelect = ({ value, onValueChange, items, placeholder }: Props) => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Dropdown
        data={items}
        labelField="label"
        valueField="value"
        value={value}
        onChange={(item) => onValueChange(item.value)}
        placeholder={placeholder ?? t('select_placeholder')}
        style={styles.dropdown}
        selectedTextStyle={styles.selectedText}
        iconStyle={styles.iconStyle}
        itemTextStyle={styles.text}
        containerStyle={styles.dropdownContainer}
        placeholderStyle={styles.placeholderStyle}
        inputSearchStyle={styles.inputSearchStyle}
        renderRightIcon={() => null}
        renderLeftIcon={() => <MaterialIcons name="arrow-drop-down" size={24} color={palette.grey[700]} />}
        renderItem={(item, selected) => (
          <View style={styles.item}>
            <Text style={styles.textItem}>{item.label}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: '8@ms'
  },
  dropdown: {
    minWidth: '100@ms',
    height: '50@ms',
    borderWidth: '1@ms',
    borderRadius: '8@ms',
    paddingHorizontal: '8@ms',
    alignSelf: 'flex-start',
    borderColor: palette.grey[100]
  },
  selectedText: {
    ...TYPO.body3
  },
  text: {
    overflow: 'hidden',
    wordWrap: 'unset'
  },
  dropdownContainer: {
    borderRadius: '4@ms'
  },
  dropdownLabel: {
    fontSize: '16@ms',
    color: '#333',
    marginRight: '8@ms'
  },
  placeholderStyle: {
    fontSize: '16@ms'
  },
  selectedTextStyle: {
    fontSize: '16@ms'
  },
  inputSearchStyle: {
    height: '40@ms',
    fontSize: '16@ms'
  },
  iconStyle: {
    width: '20@ms',
    height: '20@ms'
  },
  item: {
    padding: '17@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textItem: {
    flex: 1,
    fontSize: '16@ms'
  },
  emptyText: {
    fontSize: '16@ms',
    color: '#999'
  }
})

export default StartArrowSelect
