import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { getTimeZone } from 'react-native-localize'
import useStudyTimerStore from '@/store/useStudyTimerStore'
import { getErrorMessage } from '@/utils/helpers'
import { getMySummaryApi } from '../apiClients'
import { StudyTimerMyPeriod } from '../configs/enums'
import { getErrorStatus, myWindowFor, shiftMyWindow, todayIso } from '../configs/helpers'
import { StudyTimerMySummaryResponse, StudyTimerMyWindow } from '../configs/types'

export type StudyTimerMyStatus = 'loading' | 'ready' | 'error' | 'forbidden'

const useStudyTimerMy = () => {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<StudyTimerMySummaryResponse | null>(null)
  const [window, setWindow] = useState<StudyTimerMyWindow>(() =>
    myWindowFor(StudyTimerMyPeriod.Week, todayIso())
  )
  const [status, setStatus] = useState<StudyTimerMyStatus>('loading')
  const [errorText, setErrorText] = useState('')
  const requestId = useRef(0)
  // Bumped on every focus / app resume so the inbox and the day timeline reload (the tab stays mounted).
  const [refreshKey, setRefreshKey] = useState(0)
  // The "today" the current window was built on; used to roll a current window over midnight.
  const anchorToday = useRef(todayIso())
  const windowRef = useRef(window)
  windowRef.current = window

  const reload = useCallback(async () => {
    const id = ++requestId.current
    setStatus((s) => (s === 'ready' ? s : 'loading'))
    try {
      const res = await getMySummaryApi({
        from: window.from,
        to: window.to,
        tz: getTimeZone()
      })
      if (id !== requestId.current) return
      setSummary(res.data)
      setErrorText('')
      setStatus('ready')
    } catch (error) {
      if (id !== requestId.current) return
      if (getErrorStatus(error) === 403) {
        setStatus('forbidden')
        return
      }
      setErrorText(getErrorMessage(t, error, t('studytimer_load_failed')))
      setStatus('error')
    }
  }, [window.from, window.to, t])

  // Reload when the window changes and whenever the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      reload()
      return () => {
        // invalidate in-flight response once the screen loses focus
        requestId.current++
      }
    }, [reload])
  )

  // On focus / resume: bump refreshKey and, if the window was ending on the day it was built on and that
  // day has passed, re-anchor it to the new today.
  const refreshAnchor = useCallback(() => {
    setRefreshKey((k) => k + 1)
    const now = todayIso()
    const w = windowRef.current
    if (w.to === anchorToday.current && now > anchorToday.current) {
      setWindow(myWindowFor(w.period, now))
    }
    anchorToday.current = now
  }, [])

  const reloadRef = useRef(reload)
  reloadRef.current = reload

  useFocusEffect(
    useCallback(() => {
      refreshAnchor()
      const sub = AppState.addEventListener('change', (next) => {
        if (next !== 'active') return
        refreshAnchor()
        reloadRef.current()
      })
      return () => sub.remove()
    }, [refreshAnchor])
  )

  // Server-side change (e.g. the teacher changed the goal): reload like a resume. The first value is skipped,
  // the focus effect above already loads.
  const refreshSeq = useStudyTimerStore((state) => state.refreshSeq)
  const seenRefreshSeq = useRef(refreshSeq)
  useEffect(() => {
    if (seenRefreshSeq.current === refreshSeq) return
    seenRefreshSeq.current = refreshSeq
    refreshAnchor()
    reloadRef.current()
  }, [refreshSeq, refreshAnchor])

  const setPeriod = useCallback((period: StudyTimerMyPeriod) => {
    const now = todayIso()
    anchorToday.current = now
    setWindow(myWindowFor(period, now))
  }, [])

  const shift = useCallback((dir: 1 | -1) => {
    setWindow((w) => {
      const next = shiftMyWindow(w, dir)
      if (next.to === todayIso()) anchorToday.current = next.to
      return next
    })
  }, [])

  return { summary, window, setPeriod, shift, status, errorText, reload, refreshKey }
}

export default useStudyTimerMy
