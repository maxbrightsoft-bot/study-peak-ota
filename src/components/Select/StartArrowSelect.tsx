import { palette, TYPO } from '@/theme'
import { Option } from '@/utils/types'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

type Props = {
  value: any
  onValueChange: (value: any) => void
  items: Option[]
  placeholder?: string
}

const StartArrowSelect = ({ value, onValueChange, items, placeholder }: Props) => {
  console.log({ items, value })
  return (
    <View style={styles.container}>
      <Dropdown
        data={items}
        labelField="label"
        valueField="value"
        value={value}
        onChange={(item) => onValueChange(item.value)}
        placeholder={placeholder}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  dropdown: {
    minWidth: 100,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
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
    borderRadius: 4
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8
  },
  placeholderStyle: {
    fontSize: 16
  },
  selectedTextStyle: {
    fontSize: 16
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16
  },
  iconStyle: {
    width: 20,
    height: 20
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textItem: {
    flex: 1,
    fontSize: 16
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  }
})

export default StartArrowSelect
