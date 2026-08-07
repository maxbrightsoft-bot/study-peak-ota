import { palette } from '@/theme';
import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters'

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

const styles = ScaledSheet.create({
  container: {
    backgroundColor: palette.grey[50],
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: '1@ms',
    borderBottomColor: palette.grey[100]
  },
  title: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[500],
    overflow: 'hidden',
  },
});

export default OverallTabHeader;