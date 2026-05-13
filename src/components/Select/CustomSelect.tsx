import { palette } from '@/theme'
import React, { forwardRef, useCallback, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Dropdown, IDropdownRef } from 'react-native-element-dropdown'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  value: any
  onValueChange?: (value: any) => void
  options: any
  style?: any
  disabled?: boolean
  placeholder?: string
  icon?: any
  search?: boolean
  onChangeText?: (keyword: string) => void
  searchPlaceholder?: string
  searchQuery?: ((keyword: string, labelValue: string) => boolean)
}

const DefaultIcon = ({ disabled }: { disabled?: boolean }) => (
  <Ionicons
    name="caret-down-outline"
    size={20}
    color={disabled ? palette.grey[300] : '#222222'}
  />
)

const CustomSelect = forwardRef<IDropdownRef, Props>(
  (
    {
      value,
      onValueChange,
      style,
      options,
      disabled,
      placeholder,
      icon,
      search,
      onChangeText,
      searchPlaceholder,
      searchQuery
    },
    ref
  ) => {
    const { t } = useTranslation()

    const renderRightIcon = () => (icon ? icon() : <DefaultIcon disabled={disabled} />)

    const translatedSearchPlaceholder = searchPlaceholder ?? t('search_placeholder')
    const translatedPlaceholder = placeholder ?? t('select_placeholder')

    return (
      <Dropdown
        ref={ref}
        search={search}
        onChangeText={onChangeText}
        searchPlaceholder={translatedSearchPlaceholder}
        searchQuery={searchQuery}
        data={options}
        labelField="label"
        valueField="value"
        value={value ?? null}
        disable={disabled}
        onChange={(item) => onValueChange?.(item.value)}
        onFocus={() => {
          if (search && onChangeText) {
            onChangeText('')
          }
        }}
        placeholder={translatedPlaceholder}
        style={[styles.dropdown, style, disabled && styles.disabledDropdown]}
        selectedTextStyle={styles.selectedTextStyle}
        placeholderStyle={styles.placeholderStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        containerStyle={styles.dropdownContainer}
        inputSearchStyle={styles.inputSearchStyle}
        renderRightIcon={renderRightIcon}
        dropdownPosition="auto"
        flatListProps={{
          keyboardShouldPersistTaps: 'handled'
        }}
      />
    )

  }
)

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '20@ms',
    paddingTop: '40@ms'
  },

  dropdown: {
    height: '50@ms',
    backgroundColor: palette.grey[100],
    borderRadius: '10@ms',
    overflow: 'hidden',
    paddingHorizontal: '12@ms',
    justifyContent: 'center'
  },
  disabledDropdown: {
    opacity: 0.6,
    backgroundColor: palette.grey[200]
  },

  dropdownContainer: {
    borderRadius: '12@ms',
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,

    borderWidth: '1@ms',
    borderColor: '#E5E5E5'
  },

  placeholderStyle: {
    fontSize: '14@ms',
    color: '#222222'
  },

  itemTextStyle: {
    fontSize: '14@ms',
    color: palette.grey[900]
  },

  selectedTextStyle: {
    fontSize: '14@ms',
    flex: 1,
    fontWeight: '500',
    color: '#222222'
  },

  iconStyle: {
    width: '24@ms',
    height: '24@ms'
  },

  inputSearchStyle: {
    height: '40@ms',
    fontSize: '14@ms',
    color: '#222222'
  }
})

export default CustomSelect
