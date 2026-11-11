// Text of one bell item. Port of the web convertAnnouncementData (TouchStudy.Core Announcements/configs/fns.ts):
// same keys and params, so mobile and web read the same.
import type { TFunction } from 'i18next'
import moment from 'moment'
import { Role } from '@/utils/enums'
import { stripHtml } from '@/utils/helpers/html'
import { AnnouncementType } from './enums'
import { isStudyTimerAnnouncementType, isWrongNoteAnnouncementType, parseAnnouncementExtra } from './helpers'
import { AnnouncementResponse, StudyTimerAnnouncementExtraData, WrongNoteAnnouncementExtraData } from './types'

// Same as StudyTimer configs (REPLY_REASON_KEYS, formatDuration); the StudyTimer module is not on this branch.
const REPLY_REASON_KEYS = ['acknowledged', 'sick', 'school_event', 'other_academy', 'family', 'forgot_timer', 'other']

const formatDuration = (minutes: number, t: TFunction): string => {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return t('studytimer_duration_m', { m, defaultValue: '{{m}}m' })
  if (m === 0) return t('studytimer_duration_h', { h, defaultValue: '{{h}}h' })
  return t('studytimer_duration_hm', { h, m, defaultValue: '{{h}}h {{m}}m' })
}

export type AnnouncementView = {
  name: string
  avatar?: string
  content: string
  action: string
}

type SenderFlags = { isAdmin: boolean; isTeacher: boolean; isStudent: boolean }

const formatSenderName = (
  t: TFunction,
  isStudentUser: boolean,
  { isAdmin, isTeacher, isStudent }: SenderFlags,
  senderFullName?: string
): string => {
  if (isAdmin) return isStudentUser ? t('admin') : t('admin_n', { admin: senderFullName })
  if (isTeacher) return t('teacher_n', { teacher: senderFullName })
  if (isStudent) return `${t('student')} ${senderFullName ?? ''}`
  return senderFullName || ''
}

const wrongNoteQuestionLabel = (extra: Partial<WrongNoteAnnouncementExtraData>): string | undefined => {
  if (extra.questionNumber) return extra.questionNumber
  if (typeof extra.questionOrder === 'number' && extra.questionOrder >= 0) return `${extra.questionOrder + 1}`
  return undefined
}

const wrongNoteExamLabel = (extra: Partial<WrongNoteAnnouncementExtraData>): string => {
  const baseTitle = extra.examTitle || ''
  // A single attempt needs no badge (same as the web list).
  const attempt = extra.attemptNumber && extra.attemptNumber > 0 ? extra.attemptNumber : 0
  const attemptBadge =
    extra.attemptCount === 1
      ? ''
      : attempt && extra.attemptCount && extra.attemptCount > 0
        ? `#${attempt}/${extra.attemptCount}`
        : attempt
          ? `#${attempt}`
          : ''
  if (!attemptBadge) return baseTitle
  return baseTitle ? `${baseTitle} ${attemptBadge}` : attemptBadge
}

const replyReasonLabel = (t: TFunction, extra: Partial<StudyTimerAnnouncementExtraData>): string => {
  const key = REPLY_REASON_KEYS[extra.replyReason ?? 0] ?? REPLY_REASON_KEYS[0]
  const reason = t(`studytimer_reason_${key}`)
  if (!extra.message) return reason
  return extra.replyReason === 6 ? extra.message : `${reason} · ${extra.message}`
}

const wrongNoteContent = (
  a: AnnouncementResponse,
  extra: Partial<WrongNoteAnnouncementExtraData>,
  t: TFunction,
  senderFullName: string
): string => {
  const exam = wrongNoteExamLabel(extra)
  const rawQ = wrongNoteQuestionLabel(extra)
  const count = Math.max(1, a.count ?? extra.count ?? 1)
  switch (a.type) {
    case AnnouncementType.WrongNoteRejected:
      return rawQ ? t('wrong_note_bell_rejected', { exam, q: rawQ }) : t('wrong_note_bell_rejected_no_q', { exam })
    case AnnouncementType.WrongNoteApproved:
      return rawQ ? t('wrong_note_bell_approved', { exam, q: rawQ }) : t('wrong_note_bell_approved_no_q', { exam })
    case AnnouncementType.WrongNoteReminder:
      return t('wrong_note_bell_reminder', { exam })
    case AnnouncementType.WrongNoteDeadlineChanged:
    case AnnouncementType.WrongNoteLateAllowed:
    case AnnouncementType.WrongNoteDeadlineSoon:
    case AnnouncementType.WrongNoteResultSentToParents: {
      const deadline = extra.deadlineAt ? moment.utc(extra.deadlineAt).local().format('YYYY-MM-DD HH:mm') : ''
      const params = { exam, deadline, count, n: count }
      if (a.type === AnnouncementType.WrongNoteDeadlineChanged)
        return deadline
          ? t('wrong_note_bell_deadline_changed', params)
          : t('wrong_note_bell_deadline_changed_no_date', params)
      if (a.type === AnnouncementType.WrongNoteLateAllowed)
        return extra.lateAllowed === false
          ? t('wrong_note_bell_late_revoked', params)
          : t('wrong_note_bell_late_allowed', params)
      if (a.type === AnnouncementType.WrongNoteDeadlineSoon) return t('wrong_note_bell_deadline_soon', params)
      return t('wrong_note_bell_result_sent_to_parents', params)
    }
    default: {
      // Submitted / Resubmitted / EditedAfterCheck (teacher side).
      const base =
        a.type === AnnouncementType.WrongNoteResubmitted
          ? 'wrong_note_bell_teacher_resubmitted'
          : a.type === AnnouncementType.WrongNoteEditedAfterCheck
            ? 'wrong_note_bell_teacher_edited_after_check'
            : 'wrong_note_bell_teacher_submitted'
      const isPerQuestionGroup = (a.groupKey?.split(':').length ?? 0) >= 4
      const params = { exam, q: rawQ ?? '1', student: senderFullName, count, n: count }
      const suffix =
        count > 1 ? (rawQ && isPerQuestionGroup ? 'question_grouped' : rawQ ? 'grouped_with_q' : 'grouped') : 'single'
      return t(`${base}_${suffix}`, params)
    }
  }
}

const studyTimerTemplateBody = (
  a: AnnouncementResponse,
  extra: Partial<StudyTimerAnnouncementExtraData>,
  t: TFunction
): string => {
  switch (a.type) {
    case AnnouncementType.StudyTimerNoRecord:
      return extra.days ? t('studytimer_tpl_no_record_days', { days: extra.days }) : t('studytimer_tpl_no_record_body')
    case AnnouncementType.StudyTimerBelowGoal:
      return t('studytimer_tpl_below_goal_body')
    case AnnouncementType.StudyTimerSharpDrop:
      return t('studytimer_tpl_sharp_drop_body')
    case AnnouncementType.StudyTimerTimerLeftRunning:
      return extra.count
        ? t('studytimer_tpl_timer_left_running_n', { n: extra.count })
        : t('studytimer_tpl_timer_left_running_body')
    case AnnouncementType.StudyTimerParentReport:
      return t('studytimer_tpl_parent_report_body')
    case AnnouncementType.StudyTimerGoalUpdated: {
      const goal = formatDuration(extra.minutes ?? 0, t)
      return extra.goalAction === 1
        ? t('studytimer_bell_goal_removed', { goal })
        : extra.goalAction === 2
          ? t('studytimer_bell_goal_class', { goal })
          : t('studytimer_bell_goal_set', { goal })
    }
    default:
      return extra.message || t('studytimer_tpl_teacher_message_title')
  }
}

/** The rich-text body of a note / comment item: "noteId|html" or "noteId|commentId|parentCommentId|html". */
export const noteItemHtml = (a: AnnouncementResponse): string => {
  const parts = a.data?.data?.split('|') ?? []
  const isComment =
    a.type === AnnouncementType.ReceivedNoteComment || a.type === AnnouncementType.ReceivedNoteCommentMention
  return (isComment ? parts.slice(3) : parts.slice(1)).join('|')
}

// Zero-width characters some editors insert; they make a body look non-empty.
const INVISIBLE_CHARS = /[​-‍⁠﻿]/g
// Attachment badge from the web editor: <a class="attached-file …">📎 <span …name>…</span><span …size>…</span></a>
const ATTACHMENT_SIZE = /<span\b[^>]*class="[^"]*\battached-file-size\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi
const ATTACHMENT_BADGE = /<a\b[^>]*class="[^"]*\battached-file\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi

/**
 * One-line bell preview of a note / comment body (port of the web toAnnouncementPreviewHtml, as plain text):
 * attachments read "📎 name" (no size), an image-only body reads `imageLabel`, invisible-only bodies are empty.
 */
export const notePreviewText = (html: string, imageLabel: string): string => {
  const withoutSizes = html.replace(ATTACHMENT_SIZE, '').replace(ATTACHMENT_BADGE, ' $1 ')
  const text = stripHtml(withoutSizes).replace(INVISIBLE_CHARS, '').replace(/\s+/g, ' ').trim()
  if (text) return text
  return /<img\b/i.test(html) ? imageLabel : ''
}

const noteContent = (a: AnnouncementResponse, t: TFunction): { content: string; action: string } => {
  const content = notePreviewText(noteItemHtml(a), t('announcement_preview_image'))
  switch (a.type) {
    case AnnouncementType.ReceivedNewNote:
      return { content, action: t('sent_a_memo') }
    case AnnouncementType.ReceivedNoteMention:
      return { content, action: t('mentioned_you_in_a_memo') }
    case AnnouncementType.ReceivedNoteComment:
      return { content, action: t('sent_you_a_comment') }
    case AnnouncementType.ReceivedNoteCommentMention:
      return { content, action: t('mentioned_you_in_a_comment') }
    default:
      // Unknown type (newer backend): sender only, never raw payload.
      return { content: '', action: '' }
  }
}

const DATE_TIME_MIN_PREFIX = '0001-01-01'

/**
 * "3 hours ago" / "one day ago" for a bell item: port of the web timAgo(date, t, true), floored like the web bell.
 * Grouped items show their later updatedAt (they are re-bumped); for others updatedAt moves when marked read.
 */
export const announcementTimeAgo = (a: AnnouncementResponse, t: TFunction, now: Date = new Date()): string => {
  const raw =
    a.groupKey && a.updatedAt && moment.utc(a.updatedAt).isAfter(moment.utc(a.createdAt)) ? a.updatedAt : a.createdAt
  if (!raw || raw.startsWith(DATE_TIME_MIN_PREFIX)) return ''
  const time = moment.utc(raw)
  const ref = moment(now)
  const years = ref.diff(time, 'years')
  if (years >= 1) return years >= 2 ? t('n_years_ago', { year: years }) : t('one_year_ago')
  const months = ref.diff(time, 'months')
  if (months >= 1) return months >= 2 ? t('n_months_ago', { month: months }) : t('one_month_ago')
  const days = ref.diff(time, 'days')
  if (days >= 1) return days >= 2 ? t('n_days_ago', { day: days }) : t('one_day_ago')
  const hours = ref.diff(time, 'hours')
  if (hours >= 1) return hours >= 2 ? t('n_hours_ago', { hour: hours }) : t('one_hour_ago')
  const mins = ref.diff(time, 'minutes')
  if (mins >= 1) return mins >= 2 ? t('n_mins_ago', { min: mins }) : t('one_min_ago')
  return ref.diff(time, 'seconds') > 10 ? t('less_than_a_min') : t('just_now')
}

export const announcementView = (a: AnnouncementResponse, t: TFunction, isStudentUser: boolean): AnnouncementView => {
  const data = a.data
  const roles = data?.senderRoles ?? []
  const isAdminRole = roles.includes(Role.Admin) || roles.includes(Role.AcademyAdminTeacher)
  const isWrongNote = isWrongNoteAnnouncementType(a.type)
  const isStudyTimer = isStudyTimerAnnouncementType(a.type)
  // Wrong-note and study-timer items come from the teacher: show their name even when they also hold an admin role.
  const isTeacherItem = isWrongNote || isStudyTimer
  const isAdmin = isAdminRole && !isTeacherItem
  const isTeacher = (roles.includes(Role.Teacher) || (isTeacherItem && isAdminRole)) && !isAdmin
  const isStudent = roles.includes(Role.Student) && !isAdmin && !isTeacher
  const adminAvatarHidden = isAdmin && isStudentUser

  // Items written by a student (to the teacher): the student is the sender.
  const fromStudent =
    a.type === AnnouncementType.WrongNoteSubmitted ||
    a.type === AnnouncementType.WrongNoteResubmitted ||
    a.type === AnnouncementType.WrongNoteEditedAfterCheck ||
    a.type === AnnouncementType.StudyTimerReplied
  const teacherItemFlags: SenderFlags = fromStudent
    ? { isAdmin, isTeacher, isStudent: isStudent || (!isAdmin && !isTeacher) }
    : { isAdmin, isTeacher: isTeacher || (!isAdmin && !isStudent), isStudent }

  if (isWrongNote) {
    const extra = parseAnnouncementExtra<WrongNoteAnnouncementExtraData>(a)
    const senderFullName = data?.senderFullName || extra.senderFullName || ''
    return {
      name: formatSenderName(t, isStudentUser, teacherItemFlags, senderFullName),
      avatar: fromStudent ? data?.senderAvatar || extra.senderAvatar : adminAvatarHidden ? undefined : data?.senderAvatar || extra.senderAvatar,
      content: wrongNoteContent(a, extra, t, senderFullName),
      action: ''
    }
  }

  if (isStudyTimer) {
    const extra = parseAnnouncementExtra<StudyTimerAnnouncementExtraData>(a)
    if (a.type === AnnouncementType.StudyTimerReplied) {
      const student = data?.senderFullName || extra.studentName || t('studytimer_student_fallback')
      const reason = replyReasonLabel(t, extra)
      return {
        name: formatSenderName(t, isStudentUser, teacherItemFlags, student),
        avatar: data?.senderAvatar,
        content: extra.courseName
          ? t('studytimer_bell_replied', { course: extra.courseName, student, reason })
          : t('studytimer_bell_replied_no_course', { student, reason }),
        action: ''
      }
    }
    const coursePrefix = extra.courseName ? `[${extra.courseName}] ` : ''
    return {
      name: formatSenderName(t, isStudentUser, teacherItemFlags, data?.senderFullName || extra.teacherName || ''),
      avatar: adminAvatarHidden ? undefined : data?.senderAvatar,
      content: `${coursePrefix}${studyTimerTemplateBody(a, extra, t)}`,
      action: ''
    }
  }

  return {
    name: formatSenderName(t, isStudentUser, { isAdmin, isTeacher, isStudent }, data?.senderFullName),
    avatar: adminAvatarHidden ? undefined : data?.senderAvatar,
    ...noteContent(a, t)
  }
}
