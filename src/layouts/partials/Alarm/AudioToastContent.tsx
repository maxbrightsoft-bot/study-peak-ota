import React, { FC, useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, IconButton, ProgressBar } from 'react-native-paper'
import { Audio } from 'expo-av'
import { useTranslation } from 'react-i18next'

import { palette } from '@/theme/colors'
import { formatTime } from '../../configs/fn'
import { TimerStatus } from '@/utils/enums'
import { getRemainTimeFromMinutes, toast } from '@/utils/helpers'
import { removeDataStorage } from '@/utils/storage'
import { TOAST_EXAM_STATUS } from '@/utils/constants'
import { BaseToast, ErrorToast, InfoToast, SuccessToast  } from 'react-native-toast-message'

interface Props {
  audioSrc: string
  toastId: string
  alarm?: any
  soundRef: React.MutableRefObject<any>
  remainTime: number
  onClose: () => void
}

const AUTO_CLOSE_TIME = 3_000

const AudioToastContent: FC<Props> = ({ soundRef, audioSrc, alarm, remainTime, onClose }) => {
  const { t } = useTranslation()

  const [progress, setProgress] = useState(1)
  const [timeLeft, setTimeLeft] = useState(remainTime)
  const [isClosing, setIsClosing] = useState(false)

  const closeTimer = useRef<NodeJS.Timeout | null>(null)
  const tickTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const play = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: audioSrc }, { shouldPlay: true })
        soundRef.current = sound

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded || status.didJustFinish) {
            setIsClosing(true)
          }
        })
      } catch {
        setIsClosing(true)
      }
    }

    play()

    return () => {
      soundRef.current?.unloadAsync()
    }
  }, [audioSrc])

  useEffect(() => {
    if (!isClosing || alarm?.status !== TimerStatus.Started) return

    const start = Date.now()

    closeTimer.current = setInterval(async () => {
      const elapsed = Date.now() - start
      const remain = Math.max(0, AUTO_CLOSE_TIME - elapsed)

      setProgress(remain / AUTO_CLOSE_TIME)

      if (remain <= 0) {
        if (closeTimer.current) {
          clearInterval(closeTimer.current)
          closeTimer.current = null
        }

        if (timeLeft === 0) {
          await removeDataStorage(TOAST_EXAM_STATUS)
        }

        onClose()
      }
    }, 300)

    return () => {
      if (closeTimer.current) {
        clearInterval(closeTimer.current)
        closeTimer.current = null
      }
    }
  }, [isClosing, alarm?.status])

  useEffect(() => {
    if (!alarm) return

    if (alarm.status === TimerStatus.Paused) {
      setTimeLeft(Math.floor((alarm.duration - alarm.totalRunningTime) / 1000))
      return
    }

    if (alarm.status !== TimerStatus.Started) return

    const tick = () => {
      const remain = getRemainTimeFromMinutes(
        alarm.startTime,
        alarm.duration,
        alarm.totalRunningTime,
        alarm.lastResumeTime
      )

      if (typeof remain !== 'number') {
        setTimeLeft(0)
        return
      }

      setTimeLeft(Math.max(0, Math.floor(remain / 1000)))

      tickTimer.current = setTimeout(tick, 1000)
    }

    tick()

    return () => {
      if (tickTimer.current) {
        clearTimeout(tickTimer.current)
        tickTimer.current = null
      }
    }
  }, [alarm])

  const handleClose = async () => {
    await soundRef.current?.stopAsync()
    onClose()
  }

  return (
    <View style={styles.container}>
      <IconButton icon="close" size={16} onPress={handleClose} style={styles.close} />

      <View style={styles.header}>
        <Text style={styles.title}>{t('warning_bell')}</Text>
        <View style={styles.timeRow}>
          <Text style={styles.label}>{t('time_remaining_short')}</Text>
          <Text style={styles.time}>{formatTime(timeLeft, t)}</Text>
        </View>
      </View>
      {isClosing && alarm?.status === TimerStatus.Started && (
        <ProgressBar progress={progress} color={palette.main[500]} style={styles.progress} />
      )}
    </View>
  )
}

export default AudioToastContent

export const audioToastConfig = {
  success: (props: any) => (
    <View
      style={{
        zIndex: 99999,
        elevation: 99999
      }}
    >
      <SuccessToast {...props} />
    </View>
  ),
  error: (props: any) => (
    <View
      style={{
        zIndex: 99999,
        elevation: 99999
      }}
    >
      <ErrorToast {...props} />
    </View>
  ),
  info: (props: any) => (
    <View
      style={{
        zIndex: 99999,
        elevation: 99999
      }}
    >
      <InfoToast {...props} />
    </View>
  ),
  warning: (props: any) => (
    <View
      style={{
        zIndex: 99999,
        elevation: 99999
      }}
    >
      <BaseToast {...props} />
    </View>
  ),
  audio: ({ props }: any) => {
    return (
      <AudioToastContent
        audioSrc={props.audioSrc}
        alarm={props.alarm}
        remainTime={props.remainTime}
        toastId={props.toastId}
        soundRef={props.soundRef}
        onClose={() => {
          toast.dismiss()
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: palette.main[500],
    backgroundColor: '#FFF',
    borderRadius: 6,
    elevation: 3
  },
  close: {
    position: 'absolute',
    top: 2,
    right: 2
  },
  header: {
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.main[500]
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.grey[700]
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.main[500]
  },
  progress: {
    marginTop: 12,
    height: 4,
    transform: [{ scaleX: -1 }]
  }
})
