import { palette, TYPO } from '@/theme';
import React from 'react';
import { View, StyleSheet, StyleProp } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon  from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

type Props = {
  value: any
  onValueChange?: (value: any) => void
  options: any
  style?: any
  placeholder?: string
}

const CustomSelect = ({ value, onValueChange, style, options, placeholder }: Props) => {
  const { t } = useTranslation()
  return (
    <View>
      <Dropdown
        data={options}
        labelField="label"
        valueField="value"
        value={value} 
        onChange={(item) => onValueChange?.(item.value)}
        placeholder={placeholder ?? t('select_placeholder')}
        style={[styles.dropdown, style]}
        selectedTextStyle={styles.selectedText}
        iconStyle={styles.iconStyle}
        containerStyle={styles.dropdownContainer}
        itemTextStyle={styles.text}
        renderRightIcon={() => (
          <Icon name='chevron-down-outline' size={18} color={palette.grey[500]}  />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    borderBottomWidth: 0.5,
    borderColor: palette.grey[500],
    paddingRight: 15,
    height: 44,
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  selectedText: {
    ... TYPO.body3
  },
  text: {
    overflow: 'hidden',
    wordWrap: "unset"
  },
  iconStyle: {
    paddingRight: 10
  },
  dropdownContainer: {
    borderRadius: 4,
  },
});

export default CustomSelect;
