import { api } from '@/services/api/apiClient'
import { BASE_URL, NoAcademyHeaders } from '@/utils/constants'
import { GuestAcademy, GuestAcademyPage, GuestExamInfo, GuestResultResponse, GuestStartRequest, GuestStartResponse } from '../configs/types'
import { getGuestAcademyHeaders, GuestSession } from '../utils/guestSession'

const GUEST_EXAM_URL = `${BASE_URL}/api/guest-exams`
const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`

const academyHeaders = (academy: GuestAcademy) => getGuestAcademyHeaders(academy.domain, academy.isLearningSpace)

// Public routes: `guestPublic` makes the interceptor send no Authorization and keep these academy headers.
export const getGuestAcademiesApi = (q: string, page: number, pageSize: number) =>
  api.get<GuestAcademyPage>(`${GUEST_EXAM_URL}/academies`, {
    params: { q, page, pageSize },
    headers: { [NoAcademyHeaders]: 'true' },
    guestPublic: true
  })

export const getGuestAcademyByDomainApi = (domain: string) =>
  api.get<GuestAcademy>(`${GUEST_EXAM_URL}/academies/by-domain/${encodeURIComponent(domain)}`, {
    headers: { [NoAcademyHeaders]: 'true' },
    guestPublic: true
  })

export const getGuestExamApi = (academy: GuestAcademy, code: string) =>
  api.get<GuestExamInfo>(`${GUEST_EXAM_URL}/${encodeURIComponent(code)}`, {
    headers: academyHeaders(academy),
    guestPublic: true
  })

export const startGuestExamApi = (academy: GuestAcademy, code: string, body: GuestStartRequest) =>
  api.post<GuestStartResponse>(`${GUEST_EXAM_URL}/${encodeURIComponent(code)}/start`, body, {
    headers: academyHeaders(academy),
    guestPublic: true
  })

// Guest-token routes: the interceptor adds the guest token and academy header while the session is active.
export const joinGuestExamApi = (code: string) => api.post(`${EXAM_SESSION_URL}/${encodeURIComponent(code)}/join`)

export const getGuestResultApi = () => api.get<GuestResultResponse>(`${GUEST_EXAM_URL}/result`)

/**
 * Leaving the result. The session is passed in because it is cleared right after this call (before the
 * interceptor runs); a 401 here only means the token is already gone, so it must not bounce the screen.
 */
export const endGuestExamApi = (session: GuestSession) =>
  api.post(`${GUEST_EXAM_URL}/end`, null, { guestSession: session, guestIgnoreUnauthorized: true })
