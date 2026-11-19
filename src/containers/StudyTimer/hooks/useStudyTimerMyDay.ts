import { useCallback, useEffect, useRef, useState } from 'react'
import { getTimeZone } from 'react-native-localize'
import { getMyDayApi } from '../apiClients'
import { StudyTimerDayResponse } from '../configs/types'

export type StudyTimerMyDayStatus = 'loading' | 'ready' | 'error'

/** One day (YYYY-MM-DD) of the student's own record. Stale responses are dropped. */
const useStudyTimerMyDay = (date: string, enabled = true, refreshKey = 0) => {
  const [day, setDay] = useState<StudyTimerDayResponse | null>(null)
  const [status, setStatus] = useState<StudyTimerMyDayStatus>('loading')
  const requestId = useRef(0)

  const reload = useCallback(async () => {
    const id = ++requestId.current
    setStatus('loading')
    try {
      const res = await getMyDayApi({ date, tz: getTimeZone() })
      if (id !== requestId.current) return
      setDay(res.data)
      setStatus('ready')
    } catch {
      if (id !== requestId.current) return
      setDay(null)
      setStatus('error')
    }
  }, [date])

  useEffect(() => {
    if (enabled) reload()
    return () => {
      requestId.current++
    }
  }, [enabled, reload, refreshKey])

  return { day, status, reload }
}

export default useStudyTimerMyDay
