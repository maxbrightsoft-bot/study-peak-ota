import { TFunction } from 'i18next'
import { getErrorMessage } from '@/utils/helpers'
import { GUEST_CODE_LENGTH, GUEST_ERROR_KEYS } from './constants'
import { GuestAcademy } from './types'

type Translate = TFunction<'translation', undefined>

/** Keeps the case of what is typed; drops anything that can't be in an exam code. */
export const sanitizeGuestCode = (value: string) =>
  (value || '').replace(/[^A-Za-z0-9]/g, '').slice(0, GUEST_CODE_LENGTH)

/**
 * Writes `chars` into the code boxes starting at `index`, keeping the case. One char replaces that
 * box in place (the boxes after it stay); several chars (paste, autofill) overwrite from `index`
 * onward. Returns the new code and the box to focus next.
 */
export const writeCodeAt = (value: string, index: number, chars: string, length: number = GUEST_CODE_LENGTH) => {
  const clean = (chars || '').replace(/[^A-Za-z0-9]/g, '')
  const current = (value || '').slice(0, length)
  if (!clean) return { code: current, focusIndex: index }
  const start = Math.max(0, Math.min(index, current.length, length - 1))
  const written = clean.slice(0, length - start)
  const code = (current.slice(0, start) + written + current.slice(start + written.length)).slice(0, length)
  return { code, focusIndex: Math.min(start + written.length, length - 1) }
}

/** Same rule as the BE: 10 or 11 digits, with optional single `-`, `.` or space separators. */
export const isValidGuestPhone = (phone?: string) => {
  const value = (phone || '').trim()
  if (!/^\d+([ .-]\d+)*$/.test(value)) return false
  const digits = value.replace(/\D/g, '').length
  return digits >= 10 && digits <= 11
}

export const isSameGuestAcademy = (a?: GuestAcademy, b?: GuestAcademy) =>
  !!a &&
  !!b &&
  a.isLearningSpace === b.isLearningSpace &&
  a.domain.trim().toLowerCase() === b.domain.trim().toLowerCase()

/** The study space is always the first row; a server-sent learning-space row is dropped so it never shows twice. */
export const withStudySpaceFirst = (results: GuestAcademy[], studySpace: GuestAcademy): GuestAcademy[] => [
  studySpace,
  ...results.filter(item => !item.isLearningSpace)
]

export const getGuestErrorStatus = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status

/**
 * The join call fails with the server message "Teacher has not joined" while the teacher has not
 * opened the exam yet (a server rule for students too). The guest then waits instead of seeing an error.
 */
export const isTeacherNotJoinedError = (error: unknown) => {
  const data = (error as { response?: { data?: unknown } })?.response?.data
  const text = typeof data === 'string' ? data : JSON.stringify(data ?? '')
  return /teacher has not joined/i.test(text)
}

export const getGuestErrorMessage = (t: Translate, error: unknown) => {
  const status = getGuestErrorStatus(error)
  if (status === 429) return t('guest_too_many_requests')
  if (status === 401) return t('guest_session_ended')
  const code = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  if (typeof code === 'string' && GUEST_ERROR_KEYS[code]) return t(GUEST_ERROR_KEYS[code])
  return getErrorMessage(t, error)
}

export const formatGuestElapsed = (t: Translate, totalSeconds: number) => {
  const safe = Math.max(0, Math.round(totalSeconds || 0))
  return t('mins_mins_seconds_seconds', {
    mins: `${Math.floor(safe / 60)}`,
    seconds: `${safe % 60}`.padStart(2, '0')
  })
}
