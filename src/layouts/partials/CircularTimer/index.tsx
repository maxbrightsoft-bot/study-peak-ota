import { palette } from '@/theme'
import { formatMinutesToTime } from '@/utils/helpers'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'

interface CircularTimerProps {
  subject?: string
  isOnlyDisplay?: boolean
  edit: boolean
  value?: number
  remainSeconds?: number
  onChange?: (val: number) => void
  maxMinutes?: number
  size?: number
}

const CircularTimer: FC<CircularTimerProps> = ({
  subject,
  isOnlyDisplay,
  edit,
  value = 0,
  remainSeconds = 0,
  size
}) => {
  const { t } = useTranslation()
  const minutes = edit ? value : remainSeconds / 60

  return (
    <View style={[styles.container, subject && styles.alarmColor, ...(size ? [{ width: size, height: size }] : [])]}>
      <View style={styles.center}>
        {subject && <Text style={[styles.text, { color: '#FFF' }]}>{subject}</Text>}
        <Text style={[styles.text, subject && { color: '#FFF' }]}>
          {isOnlyDisplay
            ? t('minutes_short_format', {
                mins: Math.floor(minutes)
              })
            : formatMinutesToTime(minutes)}
        </Text>
      </View>
    </View>
  )
}

export default CircularTimer

const styles = StyleSheet.create({
  container: {
    height: 115,
    width: '100%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.main[50]
  },
  alarmColor: {
    backgroundColor: palette.main[600]
  },
  center: {
    position: 'absolute',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: palette.main[600]
  }
})
