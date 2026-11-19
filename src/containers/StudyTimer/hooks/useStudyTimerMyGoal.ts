import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/store/useAuthStore'
import { getErrorMessage, toast } from '@/utils/helpers'
import { updateMyGoalApi } from '../apiClients'

/** Own daily goal: dialog state + save. minutes 0 removes the personal goal. */
const useStudyTimerMyGoal = (onSaved: () => void) => {
  const { t } = useTranslation()
  const isDemoMode = useAuthStore((state) => state.isDemoMode)
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const savingRef = useRef(false)

  const openDialog = () => setOpen(true)
  const closeDialog = () => setOpen(false)

  const save = async (minutes: number) => {
    if (savingRef.current) return
    if (isDemoMode) {
      toast.demoBlocked()
      return
    }
    savingRef.current = true
    setIsSaving(true)
    try {
      await updateMyGoalApi({ minutes })
      toast.success(t(minutes > 0 ? 'studytimer_my_goal_saved' : 'studytimer_my_goal_removed'))
      setOpen(false)
      onSaved()
    } catch (error: unknown) {
      toast.error(getErrorMessage(t, error))
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  return { open, isSaving, openDialog, closeDialog, save }
}

export default useStudyTimerMyGoal
