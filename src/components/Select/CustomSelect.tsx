import { palette, TYPO } from '@/theme';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon  from '@expo/vector-icons/Ionicons';

type Props = {
  value: any
  onValueChange: (value: any) => void
  items: any
  placeholder?: string
}

const CustomSelect = ({ value, onValueChange, items, placeholder }: Props) => {
  return (
    <View>
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
