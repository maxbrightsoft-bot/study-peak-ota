import { useState, useEffect, useRef, useCallback } from 'react'
import _ from 'lodash'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { Audio } from 'expo-av'

import {
  getAlarmApi,
  getSuperAdminAlarmApi,
  pauseStudentAlarmApi,
  pauseSuperStudentAlarmApi,
  startStudentAlarmApi,
  startSuperStudentAlarmApi,
  toggleAlarmSpeakerApi,
  toggleSuperAlarmSpeakerApi
} from '@/services/api/alarmService'

import { AlarmClockTabProps } from '../partials/Alarm/AlarmClockTab'
import { AudioGuideModalProps } from '../components/AudioGuideModal'

import useAuthStore from '@/store/useAuthStore'
import useCountDownTimer from './useCountDownTimer'

import { SubjectTimerResponse } from '@/utils/types'
import { AlarmResponse } from '@/utils/types/alarm'
import { AlarmType, TimerStatus } from '@/utils/enums'
import { getErrorMessage, toast } from '@/utils/helpers'
import { DEFAULT_AUDIO_URL } from '../configs/constants'
import { getDataStorage, setDataStorage, removeDataStorage } from '@/utils/storage'
import { ToastExamStatus } from '../configs/enums'
import { TOAST_EXAM_STATUS, BASE_URL } from '@/utils/constants'
import useServerTime from '@/hooks/useServerTime'
import { stopAudioToastSound } from '../partials/Alarm/audioToastController'

const DEFAULT_ALARM_DURATION = 45
const TOTAL_MILLISECONDS_IN_MINUTE = 60 * 1000
const TOTAL_SECONDS_IN_TEN_MINUTES = 10 * 60
const TOTAL_MILLISECONDS_IN_TEN_MINUTES = 1000 * TOTAL_SECONDS_IN_TEN_MINUTES

const useAlarm = (open: boolean, timers: SubjectTimerResponse[], noAction?: boolean) => {
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  const alarm = useAuthStore(state => state.alarm)
  const setAlarm = useAuthStore(state => state.setAlarm)
  const [alarmDuration, setAlarmDuration] = useState(DEFAULT_ALARM_DURATION)
  const [loadingItem, setLoadingItem] = useState(false)
  const [isFetching, setFetching] = useState(false)
  const [speaker, setSpeaker] = useState(true)
  const stoppingRef = useRef(false)
  const { getServerNow } = useServerTime();

  const [selectedTimer, setSelectedTimer] = useState<{
    timer: SubjectTimerResponse
    duration: number
  }>()

  const [audioPopupProps, setAudioPopupProps] = useState<any>(null)

  const soundRef = useRef<Audio.Sound | null>(null)
  const toastIdRef = useRef<string | null>(null)

  const startAudio = useRef(false)
  const tenMinAudio = useRef(false)
  const endAudio = useRef(false)

  const fetchedRef = useRef<string | null | undefined>(undefined)

  const academyDomain = user?.academyDomain?.toLowerCase?.() ?? ''
  const onAcademy = academyDomain || user?.isLearningSpace

  useEffect(() => {
    return () => {
      const cleanup = async () => {
        try {
          await soundRef.current?.stopAsync()
          await soundRef.current?.unloadAsync()
        } catch (e) {
          console.log({ e })
        } finally {
          soundRef.current = null
        }
      }

      cleanup()
    }
  }, [])

  const resetAudioFlags = () => {
    startAudio.current = false
    tenMinAudio.current = false
    endAudio.current = false
  }

  const stopCurrentAudio = async () => {
    try {
      await stopAudioToastSound()
      await soundRef.current?.stopAsync()
      await soundRef.current?.unloadAsync()
    } catch (e) {
      console.log('Error stopping sound:', e)
    } finally {
      soundRef.current = null
    }
  }

  const dismissAudioToast = async () => {
    toast.dismiss()
    await stopCurrentAudio()
    await removeDataStorage(TOAST_EXAM_STATUS)
    setAudioPopupProps(null)
  }

  const handleUpdateAlarm = (data: AlarmResponse, isGet?: boolean) => {
    setAlarm(data)

    if (data.status === TimerStatus.Started || data.status === TimerStatus.Paused) {
      setAlarmDuration((data.duration ?? 0) / TOTAL_MILLISECONDS_IN_MINUTE)
      setSpeaker(data.speakerMode)
    } else {
      setAlarmDuration(DEFAULT_ALARM_DURATION)
      setSpeaker(true)
    }

    if (data.status === TimerStatus.Started && !isGet) {
      resetAudioFlags()
    }

    if (data.status === TimerStatus.Stopped) {
      void resetEverything()
    }
  }

  const resetEverything = async () => {
    resetAudioFlags()
    await dismissAudioToast()
  }

  const showAudioPopup = async (remainSeconds: number, stage: ToastExamStatus, currentAlarm: AlarmResponse) => {
    const status = await getDataStorage(TOAST_EXAM_STATUS)
    if (status === stage) return

    await setDataStorage(TOAST_EXAM_STATUS, stage)
    const nowTime = getServerNow()

    toastIdRef.current = `audio-${nowTime}`

    const audioUrls = currentAlarm.subject?.audioUrls ?? []
    let audioSrc = ''

    if (currentAlarm.speakerMode) {
      switch (stage) {
        case ToastExamStatus.Start:
          audioSrc = audioUrls[0] || audioUrls[1] || DEFAULT_AUDIO_URL
          break
        case ToastExamStatus.PreEnd:
          audioSrc = audioUrls[2] || DEFAULT_AUDIO_URL
          break
        case ToastExamStatus.End:
          audioSrc = audioUrls[3] || DEFAULT_AUDIO_URL
          break
      }
    }

    if (audioSrc && !audioSrc.startsWith('http')) {
      audioSrc = `${BASE_URL}${audioSrc.startsWith('/') ? '' : '/'}${audioSrc}`
    }

    const encodedAudioSrc = audioSrc ? encodeURI(audioSrc) : ''

    const config = {
      soundRef,
      toastId: toastIdRef.current,
      audioSrc: encodedAudioSrc,
      remainTime: remainSeconds,
      alarm: currentAlarm
    }

    setAudioPopupProps(config)
    toast.show(config)
  }

  const handleShowAudioToast = async (remainSeconds: number, start = false, alarmParam?: AlarmResponse) => {
    const currentAlarm = alarmParam ?? alarm
    if (!currentAlarm || noAction) return

    if (start && !startAudio.current) {
      startAudio.current = true
      await showAudioPopup(remainSeconds, ToastExamStatus.Start, currentAlarm)
    }

    if (
      currentAlarm.duration >= 1.5 * TOTAL_MILLISECONDS_IN_TEN_MINUTES &&
      remainSeconds <= TOTAL_SECONDS_IN_TEN_MINUTES &&
      remainSeconds > 0 &&
      !tenMinAudio.current
    ) {
      tenMinAudio.current = true
      await showAudioPopup(remainSeconds, ToastExamStatus.PreEnd, currentAlarm)
    }

    if (remainSeconds <= 0) {
      if (endAudio.current) return
      endAudio.current = true
      await showAudioPopup(0, ToastExamStatus.End, currentAlarm)
    }
  }

  const resetAudio = async () => {
    await removeDataStorage(TOAST_EXAM_STATUS)
  }
  const handleCloseAudioGuide = () => {
    setSelectedTimer(undefined)
  }
  const handleStartSubjectAlarm = (duration: number, subject: SubjectTimerResponse) => {
    setSelectedTimer({ duration, timer: subject })
  }

  const handleStartSelectedSubjectAlarm = async (enable: boolean, duration?: number, subject?: SubjectTimerResponse, startTime?: number, skipPreAlarm?: boolean) => {
    const currentTimer = duration && subject && startTime ? { duration, timer: subject } : selectedTimer
    if (!currentTimer) return
    setLoadingItem(true)
    try {
      const start = onAcademy
        ? startStudentAlarmApi
        : startSuperStudentAlarmApi
      const res = await start({
        duration: currentTimer.duration,
        type: AlarmType.Subject,
        speakerMode: enable,
        subjectId: currentTimer.timer.id,
        startTime: duration && subject && startTime ? startTime : moment().utc().valueOf()
      })
      handleUpdateAlarm(res.data)
      await resetEverything()
      if (!skipPreAlarm) {
        await handleShowAudioToast(currentTimer.duration * 60, true, res.data)
      }
    } catch (error) {
      toast.error(
        t("failed_to_start_the_alarm", {
          message: getErrorMessage(t, error)
        })
      )
    }
    setLoadingItem(false)
  }

  const handleStartAlarm = async (
    type: AlarmType,
    duration: number,
    subject?: SubjectTimerResponse,
    skipPreAlarm?: boolean
  ) => {
    if (type === AlarmType.Subject && !subject) return
    if (type === AlarmType.Subject && !!subject) {
      handleStartSubjectAlarm(duration, subject)
      return;
    }

    setLoadingItem(true)
    try {
      const start = onAcademy ? startStudentAlarmApi : startSuperStudentAlarmApi
      const nowTime = getServerNow()
      const res = await start({
        duration,
        type,
        speakerMode: speaker,
        subjectId: subject?.id,
        startTime: moment(nowTime).utc().valueOf()
      })

      handleUpdateAlarm(res.data)
      await resetEverything()
      if (!skipPreAlarm) {
        await handleShowAudioToast(duration * 60, true, res.data)
      }
    } catch (error) {
      t("failed_to_start_the_alarm", {
        message: getErrorMessage(t, error)
      })
    } finally {
      setLoadingItem(false)
    }
  }

  const handleStopAlarm = async (alarmParam?: AlarmResponse | null, isAutoFinish?: boolean) => {
    const currentAlarm = alarmParam ?? alarm

    if (!isAutoFinish) {
      await dismissAudioToast()
    }

    if (!currentAlarm || currentAlarm.status === TimerStatus.Stopped || noAction || stoppingRef.current) return

    stoppingRef.current = true
    setLoadingItem(true)
    try {
      const pause = onAcademy ? pauseStudentAlarmApi : pauseSuperStudentAlarmApi
      const nowTime = getServerNow()
      const res = await pause({
        id: currentAlarm.id,
        status: TimerStatus.Stopped,
        stopTime: moment(nowTime).utc().valueOf(),
        rowVersion: currentAlarm.rowVersion
      })

      await removeDataStorage(TOAST_EXAM_STATUS)
      handleUpdateAlarm(res.data)
      setAudioPopupProps(null)
    } catch (error: any) {
      if (error?.response?.status === 409) {
        getAlarm()
      } else {
        toast.error(getErrorMessage(t, error))
      }
    } finally {
      setLoadingItem(false)
      stoppingRef.current = false
    }
  }

  const handleToggleSpeaker = async (alarmParam?: AlarmResponse | null) => {
    const currentAlarm = alarmParam ?? alarm

    if (!currentAlarm?.id) return
    const next = !speaker
    setSpeaker(next)
    if (soundRef.current) {
      soundRef.current.muted = !next
    }

    try {
      const toggle = onAcademy ? toggleAlarmSpeakerApi : toggleSuperAlarmSpeakerApi

      const res = await toggle({
        id: currentAlarm.id,
        speakerMode: next,
        rowVersion: currentAlarm.rowVersion
      })

      handleUpdateAlarm(res.data)
    } catch {
      setSpeaker(!next)
      if (soundRef.current) {
        soundRef.current.muted = next
      }
    }
  }

  const handleResumeOrPauseAlarm = async () => {
    if (!alarm || !alarm.id || alarm.status == TimerStatus.Stopped) return
    const isPaused = alarm.status === TimerStatus.Paused
    if (isPaused) soundRef.current?.pauseAsync()
    const nowTime = getServerNow()
    setLoadingItem(true)
    try {
      const pause = onAcademy
        ? pauseStudentAlarmApi
        : pauseSuperStudentAlarmApi
      const res = await pause({
        id: alarm.id,
        status: isPaused ? TimerStatus.Started : TimerStatus.Paused,
        pauseTime: !isPaused ? moment(nowTime).utc().valueOf() : 0,
        rowVersion: alarm.rowVersion
      })
      handleUpdateAlarm(res.data)
    } catch (error) {
      toast.error(
        t(
          isPaused
            ? "failed_to_start_the_alarm"
            : "failed_to_pause_the_alarm",
          { message: getErrorMessage(t, error) }
        )
      )
    }
    setLoadingItem(false)
  }

  const getAlarm = async () => {
    if (!user?.superId || isFetching) return

    if (((onAcademy && fetchedRef.current === academyDomain) || (!onAcademy && fetchedRef.current === null)) && !open)
      return
    setFetching(true)
    try {
      const res = onAcademy ? await getAlarmApi() : await getSuperAdminAlarmApi()

      fetchedRef.current = onAcademy ? academyDomain : null
      handleUpdateAlarm(res.data, true)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setFetching(false)
    }
  }

  const remainTime = useCountDownTimer({
    isLoading: loadingItem,
    runningTime: alarm?.totalRunningTime ?? 0,
    duration: alarm?.duration ?? 0,
    startTime: alarm?.startTime,
    lastResumeTime: alarm?.lastResumeTime,
    status: alarm?.status,
    onFinish: () => handleStopAlarm(null, true),
    playAudio: handleShowAudioToast
  })

  const isAlarmRunning = alarm?.status === TimerStatus.Started

  const alarmClockProps: AlarmClockTabProps = {
    getAlarm,
    isLoading: isFetching || loadingItem,
    isPlaying: alarm?.status === TimerStatus.Started || alarm?.status === TimerStatus.Paused,
    alarmProps: {
      alarmStatus: alarm?.status,
      onPause: handleResumeOrPauseAlarm,
      onResume: handleResumeOrPauseAlarm,
      onTerminate: handleStopAlarm,
      totalMinutes: alarmDuration,
      remainTime,
      isLoading: loadingItem
    },
    panelProps: {
      value: alarmDuration,
      subjects: timers,
      isLoading: loadingItem,
      onChange: setAlarmDuration,
      onIncrease: (v) => setAlarmDuration((s) => Math.max(0, s + v)),
      onStart: handleStartAlarm,
      onPauseOrResume: handleResumeOrPauseAlarm
    }
  }

  const audioGuideModalProps: AudioGuideModalProps = {
    open: !!selectedTimer,
    audioUrls: selectedTimer?.timer.audioUrls ?? [],
    onClose: handleCloseAudioGuide,
    onStart: (enable: boolean, skipPreAlarm?: boolean) => handleStartSelectedSubjectAlarm(enable, undefined, undefined, undefined, skipPreAlarm)
  }

  return {
    audioPopupProps,
    audioGuideModalProps,
    alarmClockProps,
    isAlarmRunning,
    speaker,
    handleStartSelectedSubjectAlarm,
    disabledSpeaker: loadingItem,
    handleToggleSpeaker,
    getAlarm,
    handleStopAlarm,
    handleResumeOrPauseAlarm
  }
}

export default useAlarm
