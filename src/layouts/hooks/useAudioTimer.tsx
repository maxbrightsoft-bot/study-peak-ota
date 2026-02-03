import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { TOTAL_SECONDS_BEFORE_START } from '../configs/constants'

type Props = {
  onEnded: () => void
  timeSkip: React.MutableRefObject<boolean>
}

const useAudioTimer = ({ onEnded, timeSkip }: Props) => {
  const [startTime, setStartTime] = useState<moment.Moment | null>(null)
  const [remainTime, setRemainTime] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()

  const handleReset = () => {
    setStartTime(null)
    setRemainTime(0)
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }
    intervalRef.current = null
  }

  const handleStartRunning = () => {
    const newStartTime = moment()
    setStartTime(newStartTime)
  }

  const handleStopRunning = () => {
    setStartTime(null)
  }

  useEffect(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }

    if (!startTime) return

    const running = () => {
      const progressTime = moment().diff(startTime, 'seconds')
      const timeLeft = TOTAL_SECONDS_BEFORE_START - progressTime
      setRemainTime(Math.max(0, timeLeft))

      if (timeSkip.current) return

      if (timeLeft <= 0) {
        onEnded()
        return
      }

      intervalRef.current = setTimeout(running, 500)
    }

    running()

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [startTime?.toISOString(), onEnded, timeSkip])

  const remainTimeString = useMemo(() => {
    const secondsToTimeSpan = (sec?: number) => {
      if (sec === undefined) {
        return t('mins_mins_seconds_seconds', {
          mins: '00',
          seconds: '00'
        })
      }

      const min = Math.floor(sec / 60)
      const seconds = sec - min * 60
      const time = `${min.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      return time
    }

    return secondsToTimeSpan(remainTime !== undefined && remainTime < 0 ? 0 : remainTime)
  }, [remainTime, t])

  return {
    startTime,
    remainTimeString,
    setStartTime,
    handleStartRunning,
    handleStopRunning,
    handleReset
  }
}

export default useAudioTimer
