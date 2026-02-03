import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<Props> = ({
  children,
  value,
  index,
}) => {
  if (value !== index) return null;

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

export default TabPanel;

const styles = StyleSheet.create({
  container: {
  },
});
