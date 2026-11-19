import { api } from '@/services'
import { BASE_URL } from '@/utils/constants'
import {
  StudyTimerMyCloseRequest,
  StudyTimerMyGoalUpdateRequest,
  StudyTimerMyMessagesQuery,
  StudyTimerMyReplyRequest
} from '../configs/types'

const MY_URL = `${BASE_URL}/api/study-timer/me`

export const getMySummaryApi = (q: { from: string; to: string; tz: string }) =>
  api.get(`${MY_URL}/summary`, { params: q })

export const getMyDayApi = (q: { date: string; tz: string }) =>
  api.get(`${MY_URL}/day`, { params: q })

export const getMyMessagesApi = (q: StudyTimerMyMessagesQuery) =>
  api.get(`${MY_URL}/messages`, { params: q })

export const getMyMessageApi = (id: number) => api.get(`${MY_URL}/messages/${id}`)

export const readMyMessageApi = (id: number) => api.post(`${MY_URL}/messages/${id}/read`)

export const replyMyMessageApi = (id: number, body: StudyTimerMyReplyRequest) =>
  api.post(`${MY_URL}/messages/${id}/reply`, body)

export const closeMyRecordApi = (id: number, body: StudyTimerMyCloseRequest) =>
  api.post(`${MY_URL}/records/${id}/close`, body)

export const discardMyRecordApi = (id: number) => api.post(`${MY_URL}/records/${id}/discard`)

export const updateMyGoalApi = (body: StudyTimerMyGoalUpdateRequest) =>
  api.put(`${MY_URL}/goal`, body)
