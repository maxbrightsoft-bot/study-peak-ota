import React from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  children?: React.ReactNode;
  index: any;
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

const styles = ScaledSheet.create({
  container: {
  },
});
