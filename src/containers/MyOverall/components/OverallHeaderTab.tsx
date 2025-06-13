import { palette } from '@/theme';
import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
}

const OverallTabHeader: FC<Props> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.grey[50],
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100]
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.grey[500],
    overflow: 'hidden',
  },
});

export default OverallTabHeader;