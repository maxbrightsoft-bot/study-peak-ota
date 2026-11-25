import { palette } from '@/theme'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { ScaledSheet, moderateScale } from 'react-native-size-matters'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ModalBase from '@/components/ModalBase/ModalBase'

export type SelectOption = {
  label: string
  value: any
  [key: string]: any
}

export type CustomSelectRef = {
  open: () => void
  close: () => void
}

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
  onFocus?: () => void
  emptyText?: string
  maxHeight?: number
  selectedTextStyle?: any
  placeholderStyle?: any
  isClearable?: boolean
}

const DefaultIcon = ({ disabled }: { disabled?: boolean }) => (
  <Ionicons
    name="caret-down-outline"
    size={14}
    color={disabled ? palette.grey[300] : palette.grey[900]}
  />
)

const defaultSearchQuery = (keyword: string, label: string) =>
  label.toLowerCase().includes(keyword.trim().toLowerCase())

/**
 * Select field whose option list opens in a bottom sheet drawn through the react-native-paper Portal
 * (ModalBase), like the app's other dialogs. A native Modal window (what react-native-element-dropdown
 * uses) can fail to draw on newer Android, leaving an invisible list that swallows taps.
 */
const CustomSelect = forwardRef<CustomSelectRef, Props>(
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
      searchQuery,
      onFocus,
      emptyText,
      maxHeight = 300,
      selectedTextStyle,
      placeholderStyle,
      isClearable
    },
    ref
  ) => {
    const { t } = useTranslation()
    const { height: windowHeight } = useWindowDimensions()
    // The sheet sits at the screen bottom: keep the last option clear of the gesture/navigation bar.
    const { bottom: bottomInset } = useSafeAreaInsets()
    const [open, setOpen] = useState(false)
    const [keyword, setKeyword] = useState('')

    const items: SelectOption[] = useMemo(() => (Array.isArray(options) ? options : []), [options])
    const selected = useMemo(() => items.find(i => i.value === value), [items, value])

    const filtered = useMemo(() => {
      if (!search || !keyword.trim()) return items
      const match = searchQuery ?? defaultSearchQuery
      return items.filter(i => match(keyword, String(i.label ?? '')))
    }, [items, keyword, search, searchQuery])

    const handleOpen = useCallback(() => {
      if (disabled) return
      setKeyword('')
      if (search && onChangeText) onChangeText('')
      onFocus?.()
      setOpen(true)
    }, [disabled, search, onChangeText, onFocus])

    const handleClose = useCallback(() => setOpen(false), [])

    useImperativeHandle(ref, () => ({ open: handleOpen, close: handleClose }), [handleOpen, handleClose])

    const handleSelect = (item: SelectOption) => {
      setOpen(false)
      onValueChange?.(item.value)
    }

    const handleKeyword = (text: string) => {
      setKeyword(text)
      onChangeText?.(text)
    }

    const translatedPlaceholder = placeholder ?? t('select_placeholder')
    // Keep the sheet within the screen even when a caller passes a large maxHeight.
    const listMaxHeight = Math.min(Math.max(maxHeight, 240), windowHeight * 0.6)

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={`${translatedPlaceholder}, ${selected?.label ?? ''}`}
          accessibilityState={{ disabled: !!disabled, expanded: open }}
          style={[styles.dropdown, style, disabled && styles.disabledDropdown]}
        >
          <Text
            numberOfLines={1}
            style={selected ? [styles.selectedTextStyle, selectedTextStyle] : [styles.placeholderStyle, placeholderStyle]}
          >
            {selected ? selected.label : translatedPlaceholder}
          </Text>
          <View style={styles.iconStyle}>
            {isClearable && value != null && value !== '' && !disabled ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  onValueChange?.(undefined)
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={palette.grey[400]} />
              </TouchableOpacity>
            ) : icon ? (
              icon()
            ) : (
              <DefaultIcon disabled={disabled} />
            )}
          </View>
        </TouchableOpacity>

        <ModalBase isVisible={open} onClose={handleClose} position="bottom">
          <View style={{ paddingBottom: bottomInset + moderateScale(12) }}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle} numberOfLines={1}>{translatedPlaceholder}</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('close')}>
                <Ionicons name="close" size={22} color={palette.grey[900]} />
              </TouchableOpacity>
            </View>
            {search ? (
              <TextInput
                value={keyword}
                onChangeText={handleKeyword}
                placeholder={searchPlaceholder ?? t('search_placeholder')}
                placeholderTextColor={palette.grey[400]}
                style={styles.inputSearchStyle}
                autoCorrect={false}
              />
            ) : null}
            <FlatList
              data={filtered}
              keyExtractor={(item, index) => `${String(item.value)}-${index}`}
              style={{ maxHeight: listMaxHeight }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value
                return (
                  <TouchableOpacity
                    style={[styles.item, isSelected && styles.itemSelected]}
                    onPress={() => handleSelect(item)}
                    accessibilityRole="button"
                    accessibilityLabel={String(item.label ?? '')}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.itemTextStyle, isSelected && styles.itemTextSelected]} numberOfLines={2}>
                      {item.label}
                    </Text>
                    {isSelected ? <Ionicons name="checkmark" size={18} color={palette.main[600]} /> : null}
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>{emptyText ?? t('no_data')}</Text>
                </View>
              }
            />
          </View>
        </ModalBase>
      </>
    )
  }
)

export default CustomSelect

const styles = ScaledSheet.create({
  dropdown: {
    height: '50@ms',
    backgroundColor: palette.grey[100],
    borderRadius: '10@ms',
    overflow: 'hidden',
    paddingHorizontal: '12@ms',
    flexDirection: 'row',
    alignItems: 'center'
  },
  disabledDropdown: {
    opacity: 0.6,
    backgroundColor: palette.grey[200]
  },
  placeholderStyle: {
    flex: 1,
    fontSize: '14@ms',
    color: palette.grey[900]
  },
  selectedTextStyle: {
    flex: 1,
    fontSize: '14@ms',
    fontWeight: '500',
    color: palette.grey[900]
  },
  iconStyle: {
    width: '24@ms',
    height: '24@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingTop: '18@ms',
    paddingBottom: '10@ms'
  },
  sheetTitle: {
    flex: 1,
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.grey[900],
    marginRight: '12@ms'
  },
  inputSearchStyle: {
    height: '42@ms',
    marginHorizontal: '20@ms',
    marginBottom: '8@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '10@ms',
    backgroundColor: palette.grey[100],
    fontSize: '14@ms',
    color: palette.grey[900]
  },
  item: {
    minHeight: '48@ms',
    paddingHorizontal: '20@ms',
    paddingVertical: '12@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemSelected: {
    backgroundColor: palette.main[50]
  },
  itemTextStyle: {
    flex: 1,
    fontSize: '14@ms',
    color: palette.grey[900]
  },
  itemTextSelected: {
    fontWeight: '600',
    color: palette.main[600]
  },
  empty: {
    padding: '16@ms',
    alignItems: 'center'
  },
  emptyText: {
    color: palette.grey[500]
  }
})
