import { api } from '@/services/api/apiClient'
import { BASE_URL } from '@/utils/constants'
import { GuestResultBulkResult, GuestResultSearchItem } from '../configs/types'

const GUEST_RESULTS_URL = `${BASE_URL}/api/guest-results`

// Signed-in student calls: the axios guest-token override never applies while a user is signed in.
// The backend matches the signed-in student's own profile phones; nothing is sent from the client.
export const searchGuestResultsApi = () =>
  api.post<GuestResultSearchItem[]>(`${GUEST_RESULTS_URL}/search`, {})

export const combineMyGuestResultsApi = (ids: number[]) =>
  api.post<GuestResultBulkResult>(`${GUEST_RESULTS_URL}/combine`, { guestStudentExamSessionIds: ids })
