import React, { FC } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { palette } from '@/theme/colors'

const AlarmClockNote: FC = () => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('the_alarm_will_still_work_even_if_you_close_the_screen')}</Text>
    </View>
  )
}

export default AlarmClockNote

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '400',
    color: palette.grey[400],
    lineHeight: 20,
  }
})
