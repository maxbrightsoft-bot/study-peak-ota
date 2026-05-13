import { palette } from '@/theme'
import { formatMinutesToTime } from '@/utils/helpers'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TextInput } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

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
  size,
  onChange
}) => {
  const { t } = useTranslation()

  const minutes = edit ? value : remainSeconds / 60

  return (
    <View style={[styles.container, subject && styles.alarmColor, ...(size ? [{ width: size, height: size }] : [])]}>
      <View style={styles.center}>
        {subject && <Text style={[styles.text, { color: '#FFF' }]}>{subject}</Text>}
        {edit && onChange && isOnlyDisplay ? (
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.text, styles.input, subject && { color: '#FFF' }]}
              value={value === 0 ? '' : String(value)}
              placeholder="0"
              placeholderTextColor={subject ? 'rgba(255,255,255,0.5)' : palette.grey[300]}
              onChangeText={(text) => {
                const num = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                onChange(num);
              }}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
            />
            <Text style={[styles.text, subject && { color: '#FFF' }]}>
              {t('minutes_short_format', { mins: '' })}
            </Text>
          </View>
        ) : (
          <Text style={[styles.text, subject && { color: '#FFF' }]}>
            {isOnlyDisplay
              ? t('minutes_short_format', {
                mins: Math.floor(minutes)
              })
              : formatMinutesToTime(minutes)}
          </Text>
        )}
      </View>
    </View>
  )
}

export default CircularTimer

const styles = ScaledSheet.create({
  container: {
    height: '115@ms',
    width: '115@ms',
    borderRadius: '9999@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.main[50]
  },
  alarmColor: {
    backgroundColor: palette.main[600]
  },
  center: {
    position: 'absolute',
    gap: '4@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: '24@ms',
    fontWeight: '700',
    lineHeight: '32@ms',
    color: palette.main[600]
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    padding: 0,
    margin: 0,
    textAlign: 'center',
    minWidth: '32@ms',
  },
})
