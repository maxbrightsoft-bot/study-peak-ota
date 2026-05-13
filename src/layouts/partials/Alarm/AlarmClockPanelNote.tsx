import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/theme/colors';
import { ScaledSheet } from 'react-native-size-matters'

const AlarmClockPanelNote: FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {t(
          'each_section_alarm_will_play_a_voice_prompt_just_like_in_the_actual_test'
        )}
      </Text>
      <Text style={styles.text}>
        {t('please_make_sure_to_turn_on_your_speakers')}
      </Text>
    </View>
  );
};

export default AlarmClockPanelNote;

const styles = ScaledSheet.create({
  container: {
    alignItems: 'center',
    gap: '4@ms',
  },
  text: {
    fontSize: '13@ms',
    fontWeight: '400',
    color: palette.grey[500],
    lineHeight: '18@ms',
    textAlign: 'center',
  },
});
