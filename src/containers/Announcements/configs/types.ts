// Mirrors the web bell (TouchStudy.Core containers/Announcements/configs/types.ts). camelCase JSON from api/announcements.
import { AnnouncementType } from './enums'

export type AnnouncementData = {
  senderId: number
  senderFullName: string
  senderEmail: string
  senderAvatar: string
  senderRoles: string[]
  /** Note items: "noteId|content" or "noteId|commentId|parentCommentId|content". */
  data: string
}

export type AnnouncementResponse = {
  id: number
  isRead: boolean
  type: AnnouncementType | string
  extraData: string
  createdAt: string
  updatedAt?: string | null
  groupKey?: string | null
  count?: number
  resourceId: string
  resource: string
  data: AnnouncementData
  isResolved?: boolean | null
}

export type AnnouncementPage = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  items: AnnouncementResponse[]
}

export type WrongNoteAnnouncementExtraData = {
  examSessionId?: number
  studentExamSessionId?: number | null
  attemptNumber?: number | null
  attemptCount?: number | null
  examTitle?: string
  deadlineAt?: string | null
  /** WrongNoteLateAllowed only: false = late submission withdrawn (missing on old items = allowed). */
  lateAllowed?: boolean
  studentUserId?: number
  /** The question's SuperId. */
  questionId?: number
  questionOrder?: number
  questionNumber?: string | null
  count?: number
  senderId?: number
  senderFullName?: string
  senderAvatar?: string
}

export type StudyTimerAnnouncementExtraData = {
  courseId?: number
  courseName?: string
  senderUserId?: number
  requestedByUserId?: number
  teacherUserId?: number
  teacherName?: string
  studentUserId?: number
  studentName?: string
  template?: number
  audience?: number
  days?: number
  count?: number
  pct?: number
  message?: string
  replyReason?: number
  /** StudyTimerGoalUpdated: 0 personal goal set, 1 personal goal removed, 2 class goal changed. */
  goalAction?: number
  minutes?: number
}
