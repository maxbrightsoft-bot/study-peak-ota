// components/SimpleHeader.tsx
import { palette } from '@/theme';
import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SimpleHeader = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      ...styles.header,
      paddingTop: insets.top,
      height: insets.top + 100,
      }}>
      <StatusBar backgroundColor={palette.main[500]} barStyle="light-content" />
    </View>
  );
};

export default SimpleHeader;

const styles = StyleSheet.create({
  header: {
    backgroundColor: palette.main[500],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  }
});


