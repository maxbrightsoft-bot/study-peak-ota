import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TimeLineTabPanel: React.FC<Props> = ({
  children,
  value,
  index,
}) => {
  if (value !== index) return null;

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

export default TimeLineTabPanel;
