import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  children?: React.ReactNode;
  index: any;
  value: number;
  style?: ViewStyle;
}

const TabPanel: React.FC<Props> = ({
  children,
  value,
  index,
  style
}) => {
  if (value !== index) return null;

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

export default TabPanel;

const styles = ScaledSheet.create({
  container: {
  },
});
