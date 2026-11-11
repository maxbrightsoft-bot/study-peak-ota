import { AnnouncementType } from './enums'
import { AnnouncementResponse } from './types'

const ANNOUNCEMENT_CHANNEL = 'ANNOUNCEMENT_A{academy}_U{userId}_CHANNEL'

const WRONG_NOTE_TYPES: string[] = [
  AnnouncementType.WrongNoteRejected,
  AnnouncementType.WrongNoteApproved,
  AnnouncementType.WrongNoteReminder,
  AnnouncementType.WrongNoteResubmitted,
  AnnouncementType.WrongNoteEditedAfterCheck,
  AnnouncementType.WrongNoteSubmitted,
  AnnouncementType.WrongNoteDeadlineChanged,
  AnnouncementType.WrongNoteLateAllowed,
  AnnouncementType.WrongNoteDeadlineSoon,
  AnnouncementType.WrongNoteResultSentToParents
]

const STUDY_TIMER_TYPES: string[] = [
  AnnouncementType.StudyTimerNoRecord,
  AnnouncementType.StudyTimerBelowGoal,
  AnnouncementType.StudyTimerSharpDrop,
  AnnouncementType.StudyTimerTimerLeftRunning,
  AnnouncementType.StudyTimerTeacherMessage,
  AnnouncementType.StudyTimerParentReport,
  AnnouncementType.StudyTimerReplied,
  AnnouncementType.StudyTimerGoalUpdated
]

const NOTE_TYPES: string[] = [
  AnnouncementType.ReceivedNewNote,
  AnnouncementType.ReceivedNoteComment,
  AnnouncementType.ReceivedNoteMention,
  AnnouncementType.ReceivedNoteCommentMention
]

/** Sent to teachers; mobile has no teacher screen to open for them. */
const TEACHER_ONLY_TYPES: string[] = [
  AnnouncementType.WrongNoteSubmitted,
  AnnouncementType.WrongNoteResubmitted,
  AnnouncementType.WrongNoteEditedAfterCheck,
  AnnouncementType.StudyTimerReplied
]

export const isWrongNoteAnnouncementType = (type?: string): boolean => !!type && WRONG_NOTE_TYPES.includes(type)
export const isStudyTimerAnnouncementType = (type?: string): boolean => !!type && STUDY_TIMER_TYPES.includes(type)
export const isNoteAnnouncementType = (type?: string): boolean => !!type && NOTE_TYPES.includes(type)
export const isTeacherOnlyAnnouncementType = (type?: string): boolean => !!type && TEACHER_ONLY_TYPES.includes(type)

/** extraData JSON; data.data carries the same JSON when a push payload was truncated. {} when absent or invalid. */
export const parseAnnouncementExtra = <T extends object>(a?: AnnouncementResponse): Partial<T> => {
  const raw = a?.extraData || a?.data?.data
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Partial<T>) : {}
  } catch {
    return {}
  }
}

/** A Pusher payload (object or JSON string) as an announcement, or undefined when it is not one. */
export const toAnnouncement = (payload: unknown): AnnouncementResponse | undefined => {
  let value = payload
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return undefined
    }
  }
  if (!value || typeof value !== 'object') return undefined
  const candidate = value as Partial<AnnouncementResponse>
  return typeof candidate.id === 'number' && typeof candidate.type === 'string'
    ? (candidate as AnnouncementResponse)
    : undefined
}

const positiveInt = (value?: string): number | undefined => {
  const id = Number(value)
  return value && Number.isInteger(id) && id > 0 ? id : undefined
}

/**
 * The note id of a note / comment / mention item: the first "|" segment of data.data. A truncated push has
 * no data.data; then a Note resource's resourceId is the note id (a NoteComment's is the comment id).
 */
export const noteIdOf = (a: AnnouncementResponse): number | undefined =>
  positiveInt(a.data?.data?.split('|')[0]) ?? (a.resource === 'Note' ? positiveInt(a.resourceId) : undefined)

/** Bell badge text: hidden at 0, the count up to 9, then "9+". */
export const bellBadgeLabel = (unread: number): string | undefined =>
  unread > 0 ? (unread > 9 ? '9+' : `${unread}`) : undefined

export const announcementChannel = (academyDomain: string, userId: number | string): string =>
  ANNOUNCEMENT_CHANNEL.replace('{academy}', academyDomain.trim().toUpperCase()).replace('{userId}', `${userId}`)
