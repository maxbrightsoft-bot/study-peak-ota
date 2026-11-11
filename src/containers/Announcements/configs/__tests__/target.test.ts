import { AnnouncementType } from '../enums'
import { announcementTarget, AnnouncementTargetOptions } from '../target'
import { AnnouncementResponse } from '../types'

const make = (type: string, extra: Record<string, unknown> | null, data = '', id = 1): AnnouncementResponse =>
  ({
    id,
    isRead: false,
    type,
    extraData: extra ? JSON.stringify(extra) : '',
    createdAt: '2026-11-08T01:00:00',
    resourceId: '',
    resource: '',
    data: { senderId: 2, senderFullName: 'Marcus', senderEmail: '', senderAvatar: '', senderRoles: [], data }
  }) as AnnouncementResponse

const on: AnnouncementTargetOptions = { isStudentUser: true, myWrongNote: true, studyTimer: true }

describe('announcementTarget', () => {
  test('a note item opens its note', () => {
    expect(announcementTarget(make(AnnouncementType.ReceivedNoteComment, null, '9|3||x'), on)).toEqual({
      kind: 'note',
      noteId: 9
    })
  })

  test('a note item without a note id goes nowhere', () => {
    expect(announcementTarget(make(AnnouncementType.ReceivedNewNote, null, ''), on)).toEqual({ kind: 'none' })
  })

  test('a wrong-note item opens My Wrong Note on that exam, attempt and question (SuperId)', () => {
    const a = make(AnnouncementType.WrongNoteRejected, {
      examSessionId: 2407,
      studentExamSessionId: 2585,
      questionId: 77
    })
    expect(announcementTarget(a, on)).toEqual({
      kind: 'myWrongNote',
      params: { examSessionId: 2407, studentExamSessionId: 2585, questionSuperId: 77 }
    })
  })

  test('a wrong-note item with no exam opens the My Wrong Note list', () => {
    expect(announcementTarget(make(AnnouncementType.WrongNoteReminder, {}), on)).toEqual({
      kind: 'myWrongNote',
      params: {}
    })
  })

  test('with My Wrong Note off, a wrong-note item opens the exam result list', () => {
    const a = make(AnnouncementType.WrongNoteRejected, { examSessionId: 2407 })
    expect(announcementTarget(a, { ...on, myWrongNote: false })).toEqual({ kind: 'examResultList' })
  })

  test('a study-timer message opens Study Timer on that message', () => {
    expect(announcementTarget(make(AnnouncementType.StudyTimerTeacherMessage, {}, '', 31), on)).toEqual({
      kind: 'studyTimer',
      params: { messageId: 31 }
    })
  })

  test('goal-updated and parent-report open Study Timer without a message', () => {
    expect(announcementTarget(make(AnnouncementType.StudyTimerGoalUpdated, {}), on)).toEqual({
      kind: 'studyTimer',
      params: {}
    })
    expect(announcementTarget(make(AnnouncementType.StudyTimerParentReport, {}), on)).toEqual({
      kind: 'studyTimer',
      params: {}
    })
  })

  test('with Study Timer off, a study-timer item goes nowhere', () => {
    expect(announcementTarget(make(AnnouncementType.StudyTimerTeacherMessage, {}), { ...on, studyTimer: false })).toEqual(
      { kind: 'none' }
    )
  })

  test('teacher-only types and non-student users go nowhere', () => {
    expect(announcementTarget(make(AnnouncementType.WrongNoteSubmitted, { examSessionId: 1 }), on)).toEqual({
      kind: 'none'
    })
    expect(announcementTarget(make(AnnouncementType.StudyTimerReplied, {}), on)).toEqual({ kind: 'none' })
    expect(
      announcementTarget(make(AnnouncementType.WrongNoteRejected, { examSessionId: 1 }), { ...on, isStudentUser: false })
    ).toEqual({ kind: 'none' })
  })

  test('Review Focus 2: an unknown type goes nowhere', () => {
    expect(announcementTarget(make('SomethingNew', null, '9|x'), on)).toEqual({ kind: 'none' })
  })

  test('with both features off, study-timer items open nothing and wrong-note items fall back to the exam result list', () => {
    const off: AnnouncementTargetOptions = { isStudentUser: true, myWrongNote: false, studyTimer: false }
    expect(announcementTarget(make(AnnouncementType.StudyTimerGoalUpdated, {}), off)).toEqual({ kind: 'none' })
    expect(announcementTarget(make(AnnouncementType.StudyTimerTeacherMessage, {}), off)).toEqual({ kind: 'none' })
    expect(announcementTarget(make(AnnouncementType.WrongNoteRejected, {}), off)).toEqual({ kind: 'examResultList' })
  })
})

describe('announcementTarget with data: null', () => {
  test('an unknown type without sender data goes nowhere for students and teachers', () => {
    const a = { ...make('ReceivedExamComment', { examSessionId: 5 }, '', 9), data: null } as unknown as AnnouncementResponse
    expect(announcementTarget(a, { isStudentUser: true, myWrongNote: false, studyTimer: false })).toEqual({ kind: 'none' })
    expect(announcementTarget(a, { isStudentUser: false, myWrongNote: false, studyTimer: false })).toEqual({ kind: 'none' })
  })
})
