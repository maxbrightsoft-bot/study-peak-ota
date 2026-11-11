import { api } from '@/services/api/apiClient'
import { BASE_URL } from '@/utils/constants'
import { OrderBy } from '@/utils/enums'
import { AnnouncementPage } from '../configs/types'

const ANNOUNCEMENT_URL = `${BASE_URL}/api/announcements`

export type AnnouncementQuery = {
  currentPage: number
  pageSize: number
  sortColumnName: string
  sortColumnDirection: OrderBy
  isRead?: boolean
}

/** Same defaults as the web bell. */
export const DEFAULT_ANNOUNCEMENT_QUERY: AnnouncementQuery = {
  currentPage: 1,
  pageSize: 10,
  sortColumnName: 'CreatedAt',
  sortColumnDirection: OrderBy.DESC
}

export const getAnnouncementsApi = (q: AnnouncementQuery) =>
  api.get<AnnouncementPage>(ANNOUNCEMENT_URL, { params: q })

export const getUnreadAnnouncementCountApi = () => api.get<number>(`${ANNOUNCEMENT_URL}/unread`)

export const markAnnouncementReadApi = (id: number) => api.post(`${ANNOUNCEMENT_URL}/${id}/mark-as-read`)

export const markAllAnnouncementsReadApi = () => api.post(`${ANNOUNCEMENT_URL}/mark-as-read`)
