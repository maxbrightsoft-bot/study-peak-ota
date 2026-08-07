import React, { FC, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { Text, IconButton, ProgressBar } from 'react-native-paper'
import { Audio } from 'expo-av'
import { useTranslation } from 'react-i18next'

import { palette } from '@/theme/colors'
import { formatTime } from '../../configs/fn'
import { TimerStatus } from '@/utils/enums'
import { getRemainTimeFromMinutes, toast } from '@/utils/helpers'
import { removeDataStorage } from '@/utils/storage'
import { TOAST_EXAM_STATUS } from '@/utils/constants'
import { BaseToast, ErrorToast, InfoToast, SuccessToast } from 'react-native-toast-message'
import useServerTime from '@/hooks/useServerTime'
import {
  clearAudioToastSound,
  createAudioToastSession,
  setAudioToastSound,
  stopAudioToastSound
} from './audioToastController'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  audioSrc: string
  toastId: string
  alarm?: any
  soundRef?: React.MutableRefObject<any>
  remainTime: number
  onClose: () => void
}

const AUTO_CLOSE_TIME = 1_000

const AudioToastContent: FC<Props> = ({ soundRef, audioSrc, toastId, alarm, remainTime, onClose }) => {
  const { t } = useTranslation()
  const localSoundRef = useRef<any>(null)
  const sound = soundRef ?? localSoundRef

  const [progress, setProgress] = useState(1)
  const [timeLeft, setTimeLeft] = useState(remainTime)
  const [isClosing, setIsClosing] = useState(false)

  const closeTimer = useRef<NodeJS.Timeout | null>(null)
  const tickTimer = useRef<NodeJS.Timeout | null>(null)
  const { getServerNow } = useServerTime();

  useEffect(() => {
    let isMounted = true
    const audioSession = createAudioToastSession()

    const play = async () => {
      if (!audioSrc) {
        if (isMounted) setIsClosing(true)
        return
      }

      try {
        if (sound.current) {
          await sound.current.stopAsync()
          await sound.current.unloadAsync()
        }

        if (!isMounted) return

        const { sound: audio } = await Audio.Sound.createAsync({ uri: audioSrc }, { shouldPlay: true })

        if (!isMounted || !audioSession.isActive()) {
          await audio.stopAsync().catch(() => undefined)
          await audio.unloadAsync()
          return
        }

        const isRegistered = await setAudioToastSound(audio, audioSession.session)
        if (!isRegistered) return

        sound.current = audio

        audio.setOnPlaybackStatusUpdate((status) => {
          if (!isMounted) return
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsClosing(true)
            }
          } else if (!status.isLoaded && status.error) {
            setIsClosing(true)
          }
        })
      } catch (e) {
        if (isMounted) setIsClosing(true)
      }
    }

    play()

    return () => {
      isMounted = false
      if (sound.current) {
        const currentSound = sound.current
        currentSound.stopAsync().catch(() => undefined)
        currentSound.unloadAsync().catch(() => undefined)
        clearAudioToastSound(currentSound)
        sound.current = null
      }
      removeDataStorage(TOAST_EXAM_STATUS)
    }
  }, [audioSrc, toastId])

  useEffect(() => {
    if (!isClosing) return

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
  }, [isClosing])

  useEffect(() => {
    if (!alarm) return

    if (alarm.status === TimerStatus.Paused) {
      setTimeLeft(Math.floor((alarm.duration - alarm.totalRunningTime) / 1000))
      return
    }

    if (alarm.status !== TimerStatus.Started) return

    const tick = () => {
      const nowTime = getServerNow();
      const remain = getRemainTimeFromMinutes(
        alarm.startTime,
        alarm.duration,
        alarm.totalRunningTime,
        nowTime,
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
    await stopAudioToastSound()
    if (sound.current) {
      await sound.current.stopAsync().catch(() => undefined)
      await sound.current.unloadAsync().catch(() => undefined)
      clearAudioToastSound(sound.current)
      sound.current = null
    }
    await removeDataStorage(TOAST_EXAM_STATUS)
    onClose()
  }

  return (
    <View style={styles.container}>

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
        key={props.toastId}
        audioSrc={props.audioSrc}
        alarm={props.alarm}
        remainTime={props.remainTime}
        toastId={props.toastId}
        soundRef={props?.soundRef}
        onClose={async () => {
          await stopAudioToastSound()
          await removeDataStorage(TOAST_EXAM_STATUS)
          toast.dismiss()
        }}
      />
    )
  }
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderWidth: '1@ms',
    borderColor: palette.main[500],
    backgroundColor: '#FFF',
    borderRadius: '6@ms',
    elevation: '3@ms'
  },
  close: {
    position: 'absolute',
    top: '2@ms',
    right: '2@ms'
  },
  header: {
    alignItems: 'center'
  },
  title: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.main[500]
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },
  label: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[700]
  },
  time: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[500]
  },
  progress: {
    marginTop: '12@ms',
    height: '4@ms',
    transform: [{ scaleX: -1 }]
  }
})
