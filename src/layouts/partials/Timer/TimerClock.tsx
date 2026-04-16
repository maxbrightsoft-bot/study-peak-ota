import React, { FC, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import CircularTimer from '../CircularTimer'
import { TimerStatus } from '@/utils/enums'
import { palette } from '@/theme'
import PauseIcon from '@/assets/iconJSX/pause'
import StopIcon from '@/assets/iconJSX/stop'
import { Ionicons } from '@expo/vector-icons'
import { SubjectTimerResponse } from '@/utils/types'
import AlarmClockNote from '../Alarm/AlarmClockNote'
import { useTranslation } from 'react-i18next'
import { TimerBase } from '@/layouts/configs/types'

export interface AlarmClockProps {
  isLoading: boolean
  time?: number
  data: SubjectTimerResponse
  alarmStatus?: TimerStatus
  onTerminate: (data: SubjectTimerResponse) => void
  onStartOrPauseTimer: (data: SubjectTimerResponse, isRestart: boolean) => void
}

const TimerClock: FC<AlarmClockProps> = ({ isLoading, time, onTerminate, data, onStartOrPauseTimer }) => {
  const { t } = useTranslation()
  const isPlaying = data.status === TimerStatus.Started

  const getDisplayTime = (
    data?: TimerBase,
    seconds?: number
  ): number => {
    if (!data) return 0

    const limitedTime = Math.floor(data.limitedTime / 1000)

    if (data.limitedTimeReached) return limitedTime
    return Math.max(seconds ?? 0, 0)
  }

  const displayedTime = useMemo(
    () => getDisplayTime(data, time),
    [data.id, data.status, data.duration, time]
  )

  return (
    <View style={styles.container}>
      <CircularTimer value={(displayedTime || 0) / 60} edit size={232} subject={data.name} />

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button]} onPress={() => onStartOrPauseTimer(data, false)} disabled={isLoading}>
          {isPlaying ? <PauseIcon /> : <Ionicons name="play" size={24} color="black" />}
          <Text style={[styles.buttonLabel]}>{t(isPlaying ? 'pause' : 'resume')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTerminate(data)} disabled={isLoading} style={[styles.button]}>
          <StopIcon />
          <Text style={styles.buttonLabel}>{t('end')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.note}>
        <AlarmClockNote />
      </View>
    </View>
  )
}

export default TimerClock

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    paddingTop: 50,
    alignItems: 'center',
  },
  actions: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#222222'
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.grey[900]
  },
  note: {
    marginTop: 14
  }
})
