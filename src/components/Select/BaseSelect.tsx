// import React from 'react';
// import RNPickerSelect, { Item } from 'react-native-picker-select';
// import { StyleSheet, View, Text, Platform, ViewStyle } from 'react-native';
// import { palette } from '@/theme';
// import Icon from 'react-native-vector-icons/Ionicons';

// type Props = {
//   label?: string;
//   items: Item[];
//   value: string | null;
//   onValueChange: (value: string | null) => void;
//   placeholder?: string;
//   style?: ViewStyle;
// };

// const BaseSelect = ({
//   label,
//   items,
//   value,
//   onValueChange,
//   placeholder = '없음',
//   style,
// }: Props) => {
//   return (
//     <View style={style}>
//       {label && <Text style={styles.label}>{label}</Text>}
//       <View style={styles.wrapper}>
//         <RNPickerSelect
//           onValueChange={onValueChange}
//           value={value}
//           items={items}
//           placeholder={{ label: placeholder, value: null }}
//           Icon={() => <Icon name="caret-down-outline" size={20} color={palette.grey[300]} />}
//           useNativeAndroidPickerStyle={false}
//           style={pickerSelectStyles}
//         />
//       </View>
//     </View>
//   );
// };

// export default BaseSelect;

// const styles = StyleSheet.create({
//   label: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 6,
//   },
//   wrapper: {
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: Platform.OS === 'ios' ? 12 : 4,
//   },
// });

// const pickerSelectStyles = {
//   inputIOS: {
//     fontSize: 16,
//     color: '#333',
//   },
//   inputAndroid: {
//     fontSize: 16,
//     color: '#333',
//   },
//   iconContainer: {
//     top: Platform.OS === 'ios' ? 14 : 12,
//     right: 12,
//   },
// };
