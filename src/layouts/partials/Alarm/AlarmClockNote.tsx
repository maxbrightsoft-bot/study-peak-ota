import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const AlarmClockNote: FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialIcons
          name="error"
          size={16}
          color="#9A9A98"
        />
      </View>
      <Text style={styles.text}>
        {t(
          'the_alarm_will_still_work_even_if_you_close_the_screen'
        )}
      </Text>
    </View>
  );
};

export default AlarmClockNote;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
  },
  iconWrapper: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9A9A98',
    lineHeight: 18,
    flexShrink: 1,
  },
});
