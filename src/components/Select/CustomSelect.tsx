import { palette, TYPO } from '@/theme'
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

type Props = {
  value: any
  onValueChange?: (value: any) => void
  options: any
  style?: any
  disabled?: boolean
  placeholder?: string
  icon?: any
}

const CustomSelect = ({ value, onValueChange, style, options, disabled, placeholder, icon }: Props) => {
  const { t } = useTranslation()

  return (
    <View>
      <Dropdown
        data={options}
        labelField="label"
        valueField="value"
        value={value ?? null}
        disable={disabled}
        onChange={(item) => onValueChange?.(item.value)}
        placeholder={placeholder ?? t('select_placeholder')}
        style={[styles.dropdown, style, disabled && styles.disabledDropdown]}
        selectedTextStyle={styles.selectedTextStyle}
        placeholderStyle={styles.placeholderStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        containerStyle={styles.dropdownContainer}
        renderRightIcon={icon ?? (() => <Ionicons name="caret-down-outline" size={20} color={disabled ? palette.grey[300] : "#222222"} />)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40
  },

  dropdown: {
    height: 50,
    backgroundColor: palette.grey[100],
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  disabledDropdown: {
    opacity: 0.6,
    backgroundColor: palette.grey[200]
  },

  dropdownContainer: {
    borderRadius: 12,
    overflow: 'hidden'
  },

  placeholderStyle: {
    fontSize: 14,
    color: '#222222'
  },

  itemTextStyle: {
    fontSize: 14,
    color: palette.grey[900]
  },

  selectedTextStyle: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
    color: '#222222'
  },

  iconStyle: {
    width: 24,
    height: 24
  }
})

export default CustomSelect
