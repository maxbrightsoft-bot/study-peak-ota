import React, { FC } from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import CircularTimer from '../CircularTimer'
import { useTranslation } from 'react-i18next'
import { TimerStatus } from '@/utils/enums'
import useAuthStore from '@/store/useAuthStore'
import { AlarmResponse } from '@/utils/types/alarm'
import { palette } from '@/theme'
import PauseIcon from '@/assets/iconJSX/pause'
import StopIcon from '@/assets/iconJSX/stop'
import { Ionicons } from '@expo/vector-icons'
import AlarmClockNote from './AlarmClockNote'

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

  console.log("remainTime", remainTime)

  return (
    <View style={styles.container}>
      <CircularTimer maxMinutes={totalMinutes} remainSeconds={remainTime} edit={false} size={232} />
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button]} onPress={handlePauseOrResume} disabled={isLoading}>
          {isPlaying ? <PauseIcon /> : <Ionicons name="play" size={24} color="black" />}
          <Text style={[styles.buttonLabel]}>{t(isPlaying ? 'pause' : 'resume')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onTerminate(alarm)} disabled={isLoading} style={[styles.button]}>
          <StopIcon />
          <Text style={[styles.buttonLabel]}>{t('end')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.note}>
        <AlarmClockNote />
      </View>
    </View>
  )
}

export default AlarmClock

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    paddingTop: 50,
    alignItems: 'center',
    paddingBottom: 60
  },
  actions: {
    flex: 1,
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
    paddingHorizontal: 20,
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
    marginTop: 14,
  }
})
