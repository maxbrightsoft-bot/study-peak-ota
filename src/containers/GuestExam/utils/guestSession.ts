import AsyncStorage from '@react-native-async-storage/async-storage'
import { AcademyHeaders, NoAcademyHeaders } from '@/utils/constants'
import { GUEST_RECOVER_PREFIX, GUEST_ROLLBACK_PREFIX, GUEST_SESSION_KEY } from '../configs/constants'

/**
 * A guest's exam session on this device. Kept in memory (read synchronously by the axios
 * interceptor) and mirrored to AsyncStorage; it is dropped when the guest leaves the result,
 * before every new code check / start, and whenever the login screen gets focus.
 * Never log it: it holds the guest token.
 */
export type GuestSession = {
  token: string
  code: string
  /** Academy domain; empty for Study Space. */
  domain: string
  isLearningSpace: boolean
}

let currentSession: GuestSession | undefined

const isValidSession = (session?: Partial<GuestSession> | null): session is GuestSession =>
  !!session && typeof session.token === 'string' && !!session.token && typeof session.code === 'string' && !!session.code

export const getGuestSession = (): GuestSession | undefined => currentSession

export const setGuestSession = async (session: GuestSession) => {
  currentSession = session
  try {
    await AsyncStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session))
  } catch {
    // Memory still holds the session; storage is only a mirror.
  }
}

/** Restores the mirrored session (e.g. after a JS reload) when memory has none. */
export const loadGuestSession = async (): Promise<GuestSession | undefined> => {
  if (currentSession) return currentSession
  try {
    const raw = await AsyncStorage.getItem(GUEST_SESSION_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<GuestSession>) : undefined
    if (isValidSession(parsed)) {
      currentSession = {
        token: parsed.token,
        code: parsed.code,
        domain: parsed.domain || '',
        isLearningSpace: !!parsed.isLearningSpace
      }
    }
  } catch {
    currentSession = undefined
  }
  return currentSession
}

/**
 * Drops the session and the guest's local answer backups (`grc.`/`grb.` keys): on a shared tablet the
 * next child may take the same code, and must never get the previous child's answers replayed.
 */
export const clearGuestSession = async () => {
  currentSession = undefined
  try {
    const keys = await AsyncStorage.getAllKeys()
    const guestKeys = keys.filter(
      key => key === GUEST_SESSION_KEY || key.startsWith(`${GUEST_RECOVER_PREFIX}.`) || key.startsWith(`${GUEST_ROLLBACK_PREFIX}.`)
    )
    if (guestKeys.length) await AsyncStorage.multiRemove(guestKeys)
  } catch {
    // Nothing else to drop.
  }
}

/** The tenant headers of the guest's academy: `Academy-Headers`, or `Accept-No-Academy` for Study Space. */
export const getGuestAcademyHeaders = (domain: string, isLearningSpace: boolean): Record<string, string> =>
  isLearningSpace || !domain ? { [NoAcademyHeaders]: 'true' } : { [AcademyHeaders]: domain }

const GUEST_TOKEN_EXAM_ACTIONS = ['info', 'join', 'questions', 'answer', 'finish', 'student-pause-resume']

const getRequestPath = (url?: string) => {
  const withoutQuery = (url || '').split('?')[0].split('#')[0]
  const apiIndex = withoutQuery.toLowerCase().indexOf('/api/')
  return apiIndex >= 0 ? withoutQuery.slice(apiIndex) : withoutQuery
}

/**
 * True for the public routes a guest calls with only the guest's academy headers and no token
 * at all: the server clock (`GET /api/auth/time`), which answers 400 without a tenant header.
 */
export const isGuestAcademyOnlyRoute = (url: string | undefined) => {
  const segments = getRequestPath(url).split('/').filter(Boolean)
  return (
    segments.length === 3 &&
    segments[0].toLowerCase() === 'api' &&
    segments[1].toLowerCase() === 'auth' &&
    segments[2].toLowerCase() === 'time'
  )
}

/**
 * True for the routes a guest token may call (see the P2 contract): the guest result / end routes,
 * the Pusher auth route, and the exam routes of the guest's own code (exact case). Everything else
 * — status, results, restart, any non-exam route — never gets the guest token.
 */
export const isGuestTokenRoute = (url: string | undefined, code: string) => {
  const segments = getRequestPath(url).split('/').filter(Boolean)
  if (segments.length < 3 || segments[0].toLowerCase() !== 'api') return false
  const area = segments[1].toLowerCase()

  if (area === 'guest-exams') return segments.length === 3 && ['result', 'end'].includes(segments[2].toLowerCase())
  if (area === 'auth') return segments.length === 3 && segments[2].toLowerCase() === 'pusher'
  if (area === 'examsession' && segments.length === 4) {
    let pathCode = segments[2]
    try {
      pathCode = decodeURIComponent(pathCode)
    } catch {
      return false
    }
    return pathCode === code && GUEST_TOKEN_EXAM_ACTIONS.includes(segments[3].toLowerCase())
  }
  return false
}
