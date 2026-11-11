import type { TFunction } from 'i18next'
import { AnnouncementType } from '../enums'
import { AnnouncementResponse } from '../types'
import { announcementTimeAgo, announcementView } from '../view'

// Echoes the key and its options so the assertions see which text and values were picked.
const t = ((key: string, opts?: Record<string, unknown>) =>
  opts ? `${key}|${JSON.stringify(opts)}` : key) as unknown as TFunction

const keyOf = (s: string) => s.split('|')[0]

const make = (
  type: string,
  extra: Record<string, unknown> | null,
  over: Partial<AnnouncementResponse> = {},
  data = ''
): AnnouncementResponse =>
  ({
    id: 1,
    isRead: false,
    type,
    extraData: extra ? JSON.stringify(extra) : '',
    createdAt: '2026-11-08T01:00:00',
    resourceId: '',
    resource: '',
    data: {
      senderId: 2,
      senderFullName: 'Marcus',
      senderEmail: '',
      senderAvatar: 'a.png',
      senderRoles: ['Teacher'],
      data
    },
    ...over
  }) as AnnouncementResponse

describe('announcementView: notes', () => {
  test.each([
    [AnnouncementType.ReceivedNewNote, '9|hi|there', 'hi|there', 'sent_a_memo'],
    [AnnouncementType.ReceivedNoteMention, '9|hi', 'hi', 'mentioned_you_in_a_memo'],
    [AnnouncementType.ReceivedNoteComment, '9|3||nice|one', 'nice|one', 'sent_you_a_comment'],
    [AnnouncementType.ReceivedNoteCommentMention, '9|3|1|yo', 'yo', 'mentioned_you_in_a_comment']
  ])('%s takes its content from data.data', (type, data, content, action) => {
    const v = announcementView(make(type, null, {}, data), t, true)
    expect(v.content).toBe(content)
    expect(v.action).toBe(action)
    expect(keyOf(v.name)).toBe('teacher_n')
  })
})

describe('announcementView: wrong notes', () => {
  const exam = { examTitle: 'My exam', attemptNumber: 3, attemptCount: 3 }

  test.each([
    [AnnouncementType.WrongNoteRejected, { ...exam, questionNumber: '2' }, 'wrong_note_bell_rejected'],
    [AnnouncementType.WrongNoteRejected, exam, 'wrong_note_bell_rejected_no_q'],
    [AnnouncementType.WrongNoteApproved, { ...exam, questionOrder: 0 }, 'wrong_note_bell_approved'],
    [AnnouncementType.WrongNoteApproved, exam, 'wrong_note_bell_approved_no_q'],
    [AnnouncementType.WrongNoteReminder, exam, 'wrong_note_bell_reminder'],
    [AnnouncementType.WrongNoteDeadlineChanged, { ...exam, deadlineAt: '2026-11-08T11:29:00' }, 'wrong_note_bell_deadline_changed'],
    [AnnouncementType.WrongNoteDeadlineChanged, exam, 'wrong_note_bell_deadline_changed_no_date'],
    [AnnouncementType.WrongNoteLateAllowed, { ...exam, lateAllowed: false }, 'wrong_note_bell_late_revoked'],
    [AnnouncementType.WrongNoteLateAllowed, exam, 'wrong_note_bell_late_allowed'],
    [AnnouncementType.WrongNoteDeadlineSoon, exam, 'wrong_note_bell_deadline_soon'],
    [AnnouncementType.WrongNoteResultSentToParents, exam, 'wrong_note_bell_result_sent_to_parents'],
    [AnnouncementType.WrongNoteSubmitted, exam, 'wrong_note_bell_teacher_submitted_single'],
    [AnnouncementType.WrongNoteResubmitted, exam, 'wrong_note_bell_teacher_resubmitted_single'],
    [AnnouncementType.WrongNoteEditedAfterCheck, exam, 'wrong_note_bell_teacher_edited_after_check_single']
  ])('%s → %s', (type, extra, key) => {
    expect(keyOf(announcementView(make(type, extra), t, true).content)).toBe(key)
  })

  test('the exam label carries the attempt badge, and a single attempt has none', () => {
    expect(announcementView(make(AnnouncementType.WrongNoteReminder, exam), t, true).content).toContain(
      '"exam":"My exam #3/3"'
    )
    expect(
      announcementView(make(AnnouncementType.WrongNoteReminder, { ...exam, attemptCount: 1 }), t, true).content
    ).toContain('"exam":"My exam"')
  })

  test('the question label is questionNumber, else questionOrder + 1', () => {
    expect(
      announcementView(make(AnnouncementType.WrongNoteRejected, { ...exam, questionOrder: 4 }), t, true).content
    ).toContain('"q":"5"')
  })

  test('grouped teacher items pick the grouped / per-question key by count and groupKey', () => {
    const grouped = make(AnnouncementType.WrongNoteSubmitted, exam, { count: 3 })
    expect(keyOf(announcementView(grouped, t, false).content)).toBe('wrong_note_bell_teacher_submitted_grouped')
    const withQ = make(AnnouncementType.WrongNoteSubmitted, { ...exam, questionNumber: '2' }, { count: 3 })
    expect(keyOf(announcementView(withQ, t, false).content)).toBe(
      'wrong_note_bell_teacher_submitted_grouped_with_q'
    )
    const perQuestion = make(
      AnnouncementType.WrongNoteResubmitted,
      { ...exam, questionNumber: '2' },
      { count: 3, groupKey: 'a:b:c:d' }
    )
    expect(keyOf(announcementView(perQuestion, t, false).content)).toBe(
      'wrong_note_bell_teacher_resubmitted_question_grouped'
    )
  })

  test('Review Focus 1: an empty payload still picks the no-question text and does not throw', () => {
    const v = announcementView(make(AnnouncementType.WrongNoteRejected, null), t, true)
    expect(keyOf(v.content)).toBe('wrong_note_bell_rejected_no_q')
  })
})

describe('announcementView: study timer', () => {
  test.each([
    [AnnouncementType.StudyTimerNoRecord, { days: 3 }, 'studytimer_tpl_no_record_days'],
    [AnnouncementType.StudyTimerNoRecord, {}, 'studytimer_tpl_no_record_body'],
    [AnnouncementType.StudyTimerBelowGoal, {}, 'studytimer_tpl_below_goal_body'],
    [AnnouncementType.StudyTimerSharpDrop, {}, 'studytimer_tpl_sharp_drop_body'],
    [AnnouncementType.StudyTimerTimerLeftRunning, { count: 2 }, 'studytimer_tpl_timer_left_running_n'],
    [AnnouncementType.StudyTimerTimerLeftRunning, {}, 'studytimer_tpl_timer_left_running_body'],
    [AnnouncementType.StudyTimerParentReport, {}, 'studytimer_tpl_parent_report_body'],
    [AnnouncementType.StudyTimerTeacherMessage, {}, 'studytimer_tpl_teacher_message_title'],
    [AnnouncementType.StudyTimerGoalUpdated, { goalAction: 0, minutes: 60 }, 'studytimer_bell_goal_set'],
    [AnnouncementType.StudyTimerGoalUpdated, { goalAction: 1, minutes: 60 }, 'studytimer_bell_goal_removed'],
    [AnnouncementType.StudyTimerGoalUpdated, { goalAction: 2, minutes: 60 }, 'studytimer_bell_goal_class'],
    [AnnouncementType.StudyTimerReplied, { courseName: 'A', replyReason: 1 }, 'studytimer_bell_replied'],
    [AnnouncementType.StudyTimerReplied, { replyReason: 1 }, 'studytimer_bell_replied_no_course']
  ])('%s → %s', (type, extra, key) => {
    const content = announcementView(make(type, extra), t, true).content
    expect(keyOf(content.replace(/^\[[^\]]*\] /, ''))).toBe(key)
  })

  test('the course name prefixes the text and a teacher message shows the message itself', () => {
    const v = announcementView(
      make(AnnouncementType.StudyTimerTeacherMessage, { courseName: 'A', message: 'please start the timer' }),
      t,
      true
    )
    expect(v.content).toBe('[A] please start the timer')
  })
})

describe('announcementView: sender naming', () => {
  test('an admin sending a wrong-note item is shown as the teacher', () => {
    const v = announcementView(
      make(AnnouncementType.WrongNoteReminder, {}, {
        data: { senderId: 2, senderFullName: 'Boss', senderEmail: '', senderAvatar: 'b.png', senderRoles: ['Admin'], data: '' }
      }),
      t,
      true
    )
    expect(keyOf(v.name)).toBe('teacher_n')
  })

  test('an admin sending a note to a student is "admin" with no avatar', () => {
    const v = announcementView(
      make(AnnouncementType.ReceivedNewNote, null, {
        data: { senderId: 2, senderFullName: 'Boss', senderEmail: '', senderAvatar: 'b.png', senderRoles: ['Admin'], data: '9|x' }
      }),
      t,
      true
    )
    expect(v.name).toBe('admin')
    expect(v.avatar).toBeUndefined()
  })
})

describe('announcementView: Review Focus 2', () => {
  test('an unknown type keeps the sender and has empty content', () => {
    const v = announcementView(make('SomethingNew', null, {}, '{"x":1}'), t, true)
    expect(v.content).toBe('')
    expect(v.action).toBe('')
    expect(keyOf(v.name)).toBe('teacher_n')
  })
})

describe('announcementTimeAgo (web timAgo with day precision)', () => {
  const now = new Date('2026-11-09T06:34:00Z')
  const at = (createdAt: string, over: Partial<AnnouncementResponse> = {}) =>
    announcementTimeAgo(make(AnnouncementType.WrongNoteReminder, {}, { createdAt, ...over }), t, now)

  test('floors whole days like the web bell: 1 day 19 hours is one day', () => {
    expect(at('2026-11-07T11:30:00')).toBe('one_day_ago')
    expect(at('2026-11-06T06:00:00')).toBe('n_days_ago|{"day":3}')
  })

  test('under a day shows hours, then minutes, then just now', () => {
    expect(at('2026-11-09T03:00:00')).toBe('n_hours_ago|{"hour":3}')
    expect(at('2026-11-09T05:30:00')).toBe('one_hour_ago')
    expect(at('2026-11-09T06:30:00')).toBe('n_mins_ago|{"min":4}')
    expect(at('2026-11-09T06:33:40')).toBe('less_than_a_min')
    expect(at('2026-11-09T06:33:55')).toBe('just_now')
  })

  test('months and years', () => {
    expect(at('2026-09-01T00:00:00')).toBe('n_months_ago|{"month":2}')
    expect(at('2025-10-01T00:00:00')).toBe('one_year_ago')
  })

  test('a grouped item shows its later updatedAt; others keep createdAt', () => {
    expect(at('2026-11-06T06:00:00', { groupKey: 'g', updatedAt: '2026-11-09T03:00:00' })).toBe('n_hours_ago|{"hour":3}')
    expect(at('2026-11-06T06:00:00', { updatedAt: '2026-11-09T03:00:00' })).toBe('n_days_ago|{"day":3}')
  })

  test('the .NET min date shows nothing', () => {
    expect(at('0001-01-01T00:00:00')).toBe('')
  })
})

describe('announcementView: rich-text notes (I2)', () => {
  test('note and comment HTML is shown as plain text', () => {
    const note = announcementView(make(AnnouncementType.ReceivedNewNote, null, {}, '9|<p>Please review <b>Q3</b></p>'), t, true)
    expect(note.content).toBe('Please review Q3')
    const comment = announcementView(
      make(AnnouncementType.ReceivedNoteComment, null, {}, '9|3||<p>nice&nbsp;one</p>'),
      t,
      true
    )
    expect(comment.content).toBe('nice one')
  })
})

describe('announcementView: image / file-only notes', () => {
  const badge = (name: string) =>
    `<a href="https://x.y/f.pdf" download="${name}" data-filename="${name}" data-filesize="12 KB" class="attached-file mceNonEditable" contenteditable="false" style="color: #1e293b;"><span class="attached-file-icon">📎</span> <span class="attached-file-name">${name}</span><span class="attached-file-size">12 KB</span></a>`
  const memo = (html: string) => announcementView(make(AnnouncementType.ReceivedNewNote, null, {}, `9|${html}`), t, true)

  test.each([
    ['one image', '<p><img src="https://cdn.x/a.png"></p>', 'announcement_preview_image'],
    ['several images, relative src', '<p><img src="../uploads/a.png"><img src="b.png"></p>', 'announcement_preview_image'],
    ['text wins over an image', '<p>Look <img src="https://cdn.x/a.png"></p>', 'Look'],
    ['one file', `<p>${badge('report.pdf')}</p>`, '📎 report.pdf'],
    ['several files', `<p>${badge('a.pdf')}${badge('b.docx')}</p>`, '📎 a.pdf 📎 b.docx'],
    ['text then file', `<p>See${badge('a.pdf')}</p>`, 'See 📎 a.pdf'],
    ['image and file', `<p><img src="https://cdn.x/a.png">${badge('a.pdf')}</p>`, '📎 a.pdf'],
    ['zero-width only', '<p>​‌⁠&#8203;</p>', ''],
    ['empty paragraph', '<p><br></p>', '']
  ])('%s', (_, html, content) => {
    const v = memo(html)
    expect(v.content).toBe(content)
    expect(v.action).toBe('sent_a_memo')
  })

  test('comments use the same preview', () => {
    const v = announcementView(
      make(AnnouncementType.ReceivedNoteComment, null, {}, '9|3||<p><img src="a.png"></p>'),
      t,
      true
    )
    expect(v.content).toBe('announcement_preview_image')
  })
})

describe('announcementView fallback (bell items from a newer backend)', () => {
  test('an unknown type with data: null (e.g. ReceivedExamComment) does not throw and shows no raw payload', () => {
    const a = make('ReceivedExamComment', { examSessionId: 5 }, { data: null as unknown as AnnouncementResponse['data'], resource: 'ExamComment', resourceId: '9' })
    for (const isStudentUser of [false, true]) {
      const view = announcementView(a, t, isStudentUser)
      expect(view.content).toBe('')
      expect(view.action).toBe('')
      expect(JSON.stringify(view)).not.toContain('examSessionId')
    }
  })

  test('an unknown type with sender data shows the sender only', () => {
    const view = announcementView(make('SomethingNewer', { x: 1 }, {}, '{"x":1}'), t, false)
    expect(view.content).toBe('')
    expect(view.name).toContain('Marcus')
  })
})
