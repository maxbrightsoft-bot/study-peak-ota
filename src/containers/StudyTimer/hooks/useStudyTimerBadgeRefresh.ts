import { useEffect } from 'react'
import { AppState } from 'react-native'
import useAuthStore from '@/store/useAuthStore'
import useStudyTimerStore, { isStudyTimerStudent } from '@/store/useStudyTimerStore'

/** Mount once in the authorized layout: refreshes the badge after login and whenever the app returns to the foreground. */
const useStudyTimerBadgeRefresh = () => {
  const userId = useAuthStore((state) => state.user?.id)
  const academyDomain = useAuthStore(
    (state) => state.selectedAcademy?.domain || state.user?.academyDomain
  )

  useEffect(() => {
    if (!userId || !isStudyTimerStudent()) {
      useStudyTimerStore.getState().clearBadge()
      return
    }
    useStudyTimerStore.getState().refreshBadge()
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') useStudyTimerStore.getState().refreshBadge()
    })
    return () => sub.remove()
  }, [userId, academyDomain])
}

export default useStudyTimerBadgeRefresh
