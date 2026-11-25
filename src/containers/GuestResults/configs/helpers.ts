import { TFunction } from 'i18next'
import { getErrorMessage } from '@/utils/helpers'
import { GuestResultSearchItem } from './types'

type Translate = TFunction<'translation', undefined>

/** A result can be ticked unless a combine is in flight or it also matches another student (teacher-only). */
export const isGuestResultSelectable = (item: Pick<GuestResultSearchItem, 'matchesOtherStudents'>, sending = false) =>
  !sending && !item.matchesOtherStudents

/** Selected ids restricted to rows that exist and are selectable, in selection order. */
export const getSelectableSelectedIds = (results: GuestResultSearchItem[] | undefined, selected: number[]) =>
  selected.filter(id => (results || []).some(item => item.guestStudentExamSessionId === id && isGuestResultSelectable(item)))

export const toggleGuestResult = (selected: number[], id: number) =>
  selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]

/**
 * 409 normally maps to a generic text in getErrorMessage, but the backend title (en/ko/vi)
 * says which conflict it is (not found / already combined / ...), so show it.
 */
export const getGuestResultErrorMessage = (t: Translate, error: unknown) => {
  const response = (error as { response?: { status?: number; data?: { title?: unknown } } })?.response
  const status = response?.status
  if (status === 429) return t('guest_too_many_requests')
  const title = response?.data?.title
  if (status && [400, 404, 409].includes(status) && typeof title === 'string' && title) {
    try {
      return decodeURIComponent(title)
    } catch {
      return title
    }
  }
  return getErrorMessage(t, error)
}

/** Distinct guest names (list order) of the selected rows, for the combine confirmation. */
export const getSelectedGuestNames = (results: GuestResultSearchItem[] | undefined, selected: number[]) => {
  const names: string[] = []
  ;(results || []).forEach(item => {
    const name = (item.guestName || '').trim()
    if (selected.includes(item.guestStudentExamSessionId) && isGuestResultSelectable(item) && name && !names.includes(name))
      names.push(name)
  })
  return names
}
