// Pure rules for the exam note dialog (H2), same as web ExamNoteDialog.
import { MyDeadlineState } from '@/containers/MyWrongNote/configs/enums'
import { resolveDeadlineState } from '@/containers/MyWrongNote/configs/helpers'
import { NoteReviewStatus } from '@/utils/types/note'
import moment from 'moment'

type ReviewedNote = {
  reviewStatus?: number
  reviewedAt?: string | null
  studentEditedAt?: string | null
}

/** Open send-back: rejected and not rewritten since the review (server NoteService isEffectiveRejected). */
export const isEffectiveRejected = (note?: ReviewedNote | null): boolean =>
  note?.reviewStatus === NoteReviewStatus.Rejected &&
  !(
    note.studentEditedAt &&
    note.reviewedAt &&
    moment.utc(note.studentEditedAt).valueOf() > moment.utc(note.reviewedAt).valueOf()
  )

const isOverdue = (deadline: string | null | undefined, lateAllowed: boolean | null | undefined, nowMs?: number) =>
  !!deadline &&
  resolveDeadlineState(lateAllowed ? MyDeadlineState.LateAllowed : MyDeadlineState.Open, deadline, nowMs) ===
    MyDeadlineState.Overdue

/** RV-306 (web isWriteLocked): after the deadline only an open send-back can still be written; new notes and others are locked. */
export const isNoteWriteLocked = (
  deadline: string | null | undefined,
  lateAllowed: boolean | null | undefined,
  selectedNote: ReviewedNote | null | undefined,
  nowMs?: number
): boolean => isOverdue(deadline, lateAllowed, nowMs) && !isEffectiveRejected(selectedNote)

/** A new note cannot be started once the wrong-note deadline passed, unless late submission is allowed (server: asNewNote refused). */
export const isNewNoteLocked = (
  deadline: string | null | undefined,
  lateAllowed: boolean | null | undefined,
  nowMs?: number
): boolean => isOverdue(deadline, lateAllowed, nowMs)
