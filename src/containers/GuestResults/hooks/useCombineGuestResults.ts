import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { toast } from '@/utils/helpers'
import { combineMyGuestResultsApi, searchGuestResultsApi } from '../apiClients'
import {
  getGuestResultErrorMessage,
  getSelectableSelectedIds,
  getSelectedGuestNames,
  isGuestResultSelectable,
  toggleGuestResult
} from '../configs/helpers'
import { GuestResultSearchItem } from '../configs/types'

const useCombineGuestResults = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [results, setResults] = useState<GuestResultSearchItem[]>()
  const [selected, setSelected] = useState<number[]>([])
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // The backend matches the student's own profile phones, so results load on focus without any input.
  const loadResults = useCallback(async (keepError = false) => {
    setSearching(true)
    if (!keepError) setError('')
    try {
      const res = await searchGuestResultsApi()
      setResults(res.data || [])
      setSelected([])
    } catch (err) {
      setResults(undefined)
      setSelected([])
      setError(getGuestResultErrorMessage(t, err))
    } finally {
      setSearching(false)
    }
  }, [t])

  useFocusEffect(
    useCallback(() => {
      loadResults()
    }, [loadResults])
  )

  const handleToggle = (id: number) => {
    const item = results?.find(r => r.guestStudentExamSessionId === id)
    if (!item || !isGuestResultSelectable(item)) return
    setSelected(prev => toggleGuestResult(prev, id))
  }

  const handleCombine = async () => {
    setConfirmOpen(false)
    const ids = getSelectableSelectedIds(results, selected)
    if (!ids.length || sending) return
    setSending(true)
    setError('')
    try {
      try {
        const res = await combineMyGuestResultsApi(ids)
        setSelected([])
        const { succeeded = [], failed = [] } = res.data || { succeeded: [], failed: [] }
        if (succeeded.length) toast.success(t('guest_results_combined', { count: succeeded.length }))
        if (failed.length) setError(failed[0].title)
      } catch (err) {
        setError(getGuestResultErrorMessage(t, err))
      }
      // Keep `sending` true until the list has reloaded so the button cannot re-send moved ids.
      await loadResults(true)
    } finally {
      setSending(false)
    }
  }

  return {
    t,
    goBack: () => navigation.goBack(),
    results,
    selected: getSelectableSelectedIds(results, selected),
    searching,
    sending,
    error,
    handleToggle,
    handleCombine,
    confirmOpen,
    openConfirm: () => setConfirmOpen(true),
    closeConfirm: () => setConfirmOpen(false),
    selectedNames: getSelectedGuestNames(results, selected)
  }
}

export default useCombineGuestResults
