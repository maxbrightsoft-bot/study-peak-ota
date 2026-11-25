import { useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { endGuestExamApi, getGuestResultApi } from '../apiClients'
import { GUEST_NEXT_STUDENT_SECONDS, GUEST_RESULT_MAX_RETRIES, GUEST_RESULT_RETRY_MS } from '../configs/constants'
import { getGuestErrorMessage, getGuestErrorStatus } from '../configs/helpers'
import { GuestResultResponse } from '../configs/types'
import { dropGuestState, resetToGuestStart } from '../utils/guestNavigation'
import { getGuestSession } from '../utils/guestSession'

const useGuestResult = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const sessionRef = useRef(getGuestSession())
  const leftRef = useRef<boolean>(false)
  const [result, setResult] = useState<GuestResultResponse>()
  const [error, setError] = useState<string>()
  const [secondsLeft, setSecondsLeft] = useState<number>(GUEST_NEXT_STUDENT_SECONDS)

  /** Ends the guest session for good (revoke the token, drop it) and resets to the code screen. */
  const handleLeave = useCallback(() => {
    if (leftRef.current) return
    leftRef.current = true
    const session = sessionRef.current
    session && endGuestExamApi(session).catch(() => { })
    dropGuestState()
    resetToGuestStart()
  }, [])

  useEffect(() => {
    if (!sessionRef.current) {
      leftRef.current = true
      resetToGuestStart()
      return
    }
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const load = async (attempt: number) => {
      try {
        const res = await getGuestResultApi()
        if (!cancelled) setResult(res.data)
      } catch (err) {
        if (cancelled) return
        // The attempt is still being closed (the timer just ran out): try again shortly.
        if (getGuestErrorStatus(err) === 409 && attempt < GUEST_RESULT_MAX_RETRIES) {
          retryTimer = setTimeout(() => load(attempt + 1), GUEST_RESULT_RETRY_MS)
          return
        }
        setError(getGuestErrorMessage(t, err))
      }
    }
    load(0)
    return () => {
      cancelled = true
      retryTimer && clearTimeout(retryTimer)
    }
  }, [])

  // Back (header gesture or Android hardware back) also means "next student".
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: { preventDefault: () => void }) => {
      // Already leaving, or the session already ended elsewhere (401 reset): let it go.
      if (leftRef.current || !getGuestSession()) return
      e.preventDefault()
      handleLeave()
    })
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleLeave()
      return true
    })
    return () => {
      unsubscribe()
      backSub.remove()
    }
  }, [navigation, handleLeave])

  const isReady = !!result || !!error

  // Visible 5-second countdown, then "next student".
  useEffect(() => {
    if (!isReady) return
    if (secondsLeft <= 0) {
      handleLeave()
      return
    }
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [isReady, secondsLeft, handleLeave])

  return {
    t,
    result,
    error,
    isReady,
    secondsLeft,
    handleLeave
  }
}

export default useGuestResult
