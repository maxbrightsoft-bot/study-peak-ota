// Where tapping a bell item goes on mobile. Mirrors the web student bell (TouchStudy.Student layouts/Header.tsx
// getStudentNotificationLink): notes open the note, wrong notes open My Wrong Note on that exam, study-timer items
// open "My study time" on that message.
import { AnnouncementType } from './enums'
import {
  isNoteAnnouncementType,
  isStudyTimerAnnouncementType,
  isTeacherOnlyAnnouncementType,
  isWrongNoteAnnouncementType,
  noteIdOf,
  parseAnnouncementExtra
} from './helpers'
import { AnnouncementResponse, WrongNoteAnnouncementExtraData } from './types'

export type MyWrongNoteTargetParams = {
  examSessionId?: number
  studentExamSessionId?: number
  questionSuperId?: number
}

export type AnnouncementTarget =
  | { kind: 'note'; noteId: number }
  | { kind: 'myWrongNote'; params: MyWrongNoteTargetParams }
  | { kind: 'examResultList' }
  | { kind: 'studyTimer'; params: { messageId?: number } }
  | { kind: 'none' }

export type AnnouncementTargetOptions = {
  isStudentUser: boolean
  /** FEATURE_MYWRONGNOTE */
  myWrongNote: boolean
  /** FEATURE_STUDYTIMER */
  studyTimer: boolean
}

const NONE: AnnouncementTarget = { kind: 'none' }

const positive = (value?: number | null): number | undefined =>
  typeof value === 'number' && value > 0 ? value : undefined

export const announcementTarget = (a: AnnouncementResponse, opts: AnnouncementTargetOptions): AnnouncementTarget => {
  // Teacher-only items: mobile has no teacher wrong-note / study-timer screen.
  if (!opts.isStudentUser || isTeacherOnlyAnnouncementType(a.type)) return NONE

  if (isNoteAnnouncementType(a.type)) {
    const noteId = noteIdOf(a)
    return noteId ? { kind: 'note', noteId } : NONE
  }

  if (isWrongNoteAnnouncementType(a.type)) {
    if (!opts.myWrongNote) return { kind: 'examResultList' }
    const extra = parseAnnouncementExtra<WrongNoteAnnouncementExtraData>(a)
    const params: MyWrongNoteTargetParams = {}
    const examSessionId = positive(extra.examSessionId)
    if (examSessionId) {
      params.examSessionId = examSessionId
      const studentExamSessionId = positive(extra.studentExamSessionId)
      const questionSuperId = positive(extra.questionId)
      if (studentExamSessionId) params.studentExamSessionId = studentExamSessionId
      if (questionSuperId) params.questionSuperId = questionSuperId
    }
    return { kind: 'myWrongNote', params }
  }

  if (isStudyTimerAnnouncementType(a.type)) {
    if (!opts.studyTimer) return NONE
    const withoutMessage =
      a.type === AnnouncementType.StudyTimerParentReport || a.type === AnnouncementType.StudyTimerGoalUpdated
    return { kind: 'studyTimer', params: withoutMessage ? {} : { messageId: a.id } }
  }

  return NONE
}
