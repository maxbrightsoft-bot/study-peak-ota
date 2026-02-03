import React, { FC } from 'react'
import { View, StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import { MaterialIcons } from '@expo/vector-icons'

import CircularTimer from '../CircularTimer'
import { useTranslation } from 'react-i18next'
import { TimerStatus } from '@/utils/enums'
import useAuthStore from '@/store/useAuthStore'
import { AlarmResponse } from '@/utils/types/alarm'
import { palette } from '@/theme'

export interface AlarmClockProps {
  isLoading: boolean
  totalMinutes: number
  remainTime?: number
  alarmStatus?: TimerStatus
  onTerminate: (alarm?: AlarmResponse | null) => void
  onPause: (alarm?: AlarmResponse | null) => void
  onResume: (alarm?: AlarmResponse | null) => void
}

const AlarmClock: FC<AlarmClockProps> = ({
  isLoading,
  totalMinutes,
  alarmStatus,
  remainTime,
  onTerminate,
  onPause,
  onResume
}) => {
  const { t } = useTranslation()
  const { alarm } = useAuthStore()
  const isPlaying = alarmStatus === TimerStatus.Started

  const handlePauseOrResume = () => {
    isPlaying ? onPause(alarm) : onResume(alarm)
  }

  return (
    <View style={styles.container}>
      <CircularTimer maxMinutes={totalMinutes} remainSeconds={remainTime} edit={false} />

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon={() => (
            <MaterialIcons name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'} size={18} color={'#FFF'} />
          )}
          buttonColor={palette.main[500]}
          onPress={handlePauseOrResume}
          disabled={isLoading}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {t(isPlaying ? 'pause' : 'resume')}
        </Button>

        <Button
          mode="outlined"
          onPress={() => onTerminate(alarm)}
          disabled={isLoading}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: palette.main[500] }]}
        >
          {t('stop_timer')}
        </Button>
      </View>
    </View>
  )
}

export default AlarmClock

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    padding: 8,
    gap: 16
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: "#FFF"
  }
})
