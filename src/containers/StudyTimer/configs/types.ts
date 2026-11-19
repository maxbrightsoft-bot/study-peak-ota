// camelCase, int ids, UTC dates without "Z" (parse with moment.utc).
// Mirrors docs/api-contract.md. Local calendar days arrive as "2026-10-20T00:00:00".
import {
  StudyTimerMyPeriod,
  StudyTimerNotifyAudience,
  StudyTimerNotifyTemplate,
  StudyTimerReplyReason,
  TimerRecordKind
} from './enums'

export type StudyTimerPeriodResponse = {
  from: string
  to: string
  days: number
  previousFrom: string
  previousTo: string
  timeZoneId: string
  /** Academy-local today ("2026-10-22T00:00:00"). */
  today: string
  countedDays: number
  completedDays: number
}

export type StudyTimerSubjectResponse = {
  id: number
  name: string
}

export type StudyTimerSubjectMinutesResponse = {
  subjectId: number
  minutes: number
}

export type StudyTimerRecordResponse = {
  id: number
  subjectId?: number | null
  kind: TimerRecordKind
  startedAt: string
  endedAt?: string | null
  isClosed: boolean
  isManuallyClosed?: boolean
  minutes: number
}

export type StudyTimerDayResponse = {
  studentUserId: number
  date: string
  studyMinutes: number
  breakMinutes: number
  unclosedCount: number
  bySubject: StudyTimerSubjectMinutesResponse[]
  records: StudyTimerRecordResponse[]
}

export type StudyTimerMessageReplyResponse = {
  reason: StudyTimerReplyReason
  text?: string | null
  repliedAt: string
}

export type StudyTimerMessageResponse = {
  id: number
  courseId: number
  courseName: string
  teacherName: string
  template: StudyTimerNotifyTemplate
  audience: StudyTimerNotifyAudience
  message?: string | null
  days?: number | null
  count?: number | null
  sentAt: string
  readAt?: string | null
  reply?: StudyTimerMessageReplyResponse | null
  canReply: boolean
}

// ---- the student's own screen (api/study-timer/me) ----
export type StudyTimerMyGoalCourseResponse = {
  courseId: number
  courseName: string
  dailyMinutes: number
  isOverride: boolean
}

export type StudyTimerMyGoalResponse = {
  dailyMinutes: number | null
  sourceCourseName?: string | null
  courses: StudyTimerMyGoalCourseResponse[]
  // Optional: older servers omit them.
  personalMinutes?: number | null
  teacherMinutes?: number | null
  isPersonal?: boolean
}

export type StudyTimerMyGoalUpdateRequest = { minutes: number }

export type StudyTimerMyUnclosedResponse = {
  id: number
  subjectId?: number | null
  date: string
  startedAt: string
  latestEndAt: string
}

export type StudyTimerMySummaryResponse = {
  period: StudyTimerPeriodResponse
  goal: StudyTimerMyGoalResponse
  subjects: StudyTimerSubjectResponse[]
  today: {
    date: string
    studyMinutes: number
    breakMinutes: number
    goalPercent: number | null
    remainingMinutes: number | null
  }
  studyMinutes: number
  breakMinutes: number
  previousStudyMinutes: number
  changeMinutes: number
  goalMinutes: number | null
  goalPercent: number | null
  goalReachedDays: number
  days: { date: string; minutes: number; goalMinutes: number | null }[]
  bySubject: StudyTimerSubjectMinutesResponse[]
  streak: { current: number; recordedDaysLast30: number }
  unclosed: StudyTimerMyUnclosedResponse[]
  unreadMessages: number
}

/** GET me/messages: the host paged shape plus the unread count of the whole inbox (for the badge). */
export type StudyTimerMessagesPage = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  items: StudyTimerMessageResponse[]
  unreadCount: number
}

export type StudyTimerMessagesStatus = 'all' | 'unread' | 'unanswered' | 'answered'

/** The student's inbox can also be narrowed to one of the student's classes. */
export type StudyTimerMyMessagesQuery = {
  search?: string
  status?: StudyTimerMessagesStatus
  sortColumnDirection?: 'asc' | 'desc'
  currentPage?: number
  pageSize?: number
  courseId?: number
}

export type StudyTimerMyReplyRequest = {
  reason: StudyTimerReplyReason
  text?: string
}

export type StudyTimerMyCloseRequest = {
  endedAt: string // UTC "YYYY-MM-DDTHH:mm:ss"
}

/** extraData of a StudyTimerGoalUpdated announcement (all optional: the push payload can be truncated). */
export type StudyTimerGoalNotice = {
  courseName?: string
  goalAction?: number
  minutes?: number
}

/** The part of an announcement push payload the study timer reads. */
export type StudyTimerAnnouncementPayload = {
  type?: string
  extraData?: string
  data?: { data?: string }
}

export type StudyTimerMyWindow = {
  period: StudyTimerMyPeriod
  from: string
  to: string
}
