import { api } from '@/services/api/apiClient'
import { BASE_URL } from '@/utils/constants'
import {
  AccountLinksResponse,
  ConflictProfiles,
  ConflictVerifyBody,
  ConflictVerifyResponse,
  LinkAppleBody,
  LinkGoogleBody,
  LinkProvider,
  UnlinkGoogleBody,
  UnlinkGoogleChallenge
} from '../configs/types'

const LINKS_URL = `${BASE_URL}/api/auth/links`
const CONFLICTS_URL = `${LINKS_URL}/conflicts`

// Signed-in student calls: the axios guest-token override never applies while a user is signed in
// (and auth/links is not a guest-token route).
export const getAccountLinksApi = () => api.get<AccountLinksResponse>(LINKS_URL)

/** 200 linked; 409 `LinkConflict` when the Google account belongs to another account. */
export const linkGoogleAccountApi = (body: LinkGoogleBody) => api.post<{ status: number }>(`${LINKS_URL}/google`, body)

/** 200 linked; 409 `LinkConflict` when the Apple ID belongs to another account. */
export const linkAppleAccountApi = (body: LinkAppleBody) => api.post<{ status: number }>(`${LINKS_URL}/apple`, body)

export const unlinkAccountApi = (provider: LinkProvider) => api.delete(`${LINKS_URL}/${provider.toLowerCase()}`)

/** Validates the Google sign-in and emails a 6-digit code to that Google account. */
export const sendUnlinkGoogleCodeApi = (body: LinkGoogleBody) =>
  api.post<UnlinkGoogleChallenge>(`${LINKS_URL}/google/unlink/send-code`, body)

/** Redeems the emailed code and unlinks Google. */
export const unlinkGoogleAccountApi = (body: UnlinkGoogleBody) => api.delete(`${LINKS_URL}/google`, { data: body })

export const sendConflictCodeApi = (conflictToken: string) => api.post(`${CONFLICTS_URL}/send-code`, { conflictToken })

export const getConflictProfilesApi = (conflictToken: string) =>
  api.get<ConflictProfiles>(`${CONFLICTS_URL}/profiles`, { params: { conflictToken } })

export const verifyConflictApi = (body: ConflictVerifyBody) =>
  api.post<ConflictVerifyResponse>(`${CONFLICTS_URL}/verify`, body)

export const requestAdminMergeApi = (conflictToken: string, note?: string) =>
  api.post<{ requestId: number }>(`${CONFLICTS_URL}/request`, { conflictToken, note: note || undefined })
