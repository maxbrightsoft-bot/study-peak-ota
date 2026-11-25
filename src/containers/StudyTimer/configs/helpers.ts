// Pure helpers (dates are calendar days as YYYY-MM-DD). Imports only moment, i18next types and relative paths.
import type { TFunction } from 'i18next'
import moment from 'moment'
import { announcementChannel } from '../../Announcements/configs/helpers'
import {
  REPLY_REASON_KEYS,
  STUDY_TIMER_DATE_FORMAT,
  STUDY_TIMER_GOAL_UPDATED_TYPE,
  STUDY_TIMER_MAX_CLOSE_HOURS,
  STUDY_TIMER_MAX_GOAL,
  STUDY_TIMER_MIN_GOAL,
  TEMPLATE_KEYS,
  TIMELINE_LABEL_MIN_SHARE
} from './constants'
import {
  StudyTimerGoalAction,
  StudyTimerMyPeriod,
  StudyTimerNotifyTemplate,
  TimerRecordKind
} from './enums'
import {
  StudyTimerAnnouncementPayload,
  StudyTimerGoalNotice,
  StudyTimerMessageReplyResponse,
  StudyTimerMessageResponse,
  StudyTimerMyGoalResponse,
  StudyTimerMyWindow,
  StudyTimerRecordResponse,
  StudyTimerSubjectResponse
} from './types'

const SERVER_UTC_FORMAT = 'YYYY-MM-DDTHH:mm:ss'

export const todayIso = (): string => moment().format(STUDY_TIMER_DATE_FORMAT)

/** Calendar day (YYYY-MM-DD) of a server date such as "2026-10-20T00:00:00". */
export const toLocalDateIso = (serverDate: string): string =>
  moment.utc(serverDate).format(STUDY_TIMER_DATE_FORMAT)

/** HH:mm in the device time zone of a server UTC time (maybe without "Z"). */
export const formatClock = (serverDate: string): string =>
  moment.utc(serverDate).local().format('HH:mm')

export const addDays = (iso: string, days: number): string =>
  moment(iso, STUDY_TIMER_DATE_FORMAT).add(days, 'days').format(STUDY_TIMER_DATE_FORMAT)

const diffDays = (from: string, to: string): number =>
  moment(to, STUDY_TIMER_DATE_FORMAT).diff(moment(from, STUDY_TIMER_DATE_FORMAT), 'days')

const monthStart = (iso: string): string =>
  moment(iso, STUDY_TIMER_DATE_FORMAT).startOf('month').format(STUDY_TIMER_DATE_FORMAT)

const monthEnd = (iso: string): string =>
  moment(iso, STUDY_TIMER_DATE_FORMAT).endOf('month').format(STUDY_TIMER_DATE_FORMAT)

const minIso = (a: string, b: string): string => (a < b ? a : b)

export const myWindowFor = (period: StudyTimerMyPeriod, anchor: string): StudyTimerMyWindow => {
  if (period === StudyTimerMyPeriod.Month) {
    return {
      period,
      from: monthStart(anchor),
      to: minIso(monthEnd(anchor), todayIso())
    }
  }
  return { period, from: addDays(anchor, -6), to: anchor }
}

export const shiftMyWindow = (w: StudyTimerMyWindow, dir: 1 | -1): StudyTimerMyWindow => {
  const today = todayIso()
  if (w.period === StudyTimerMyPeriod.Month) {
    const anchor = moment(w.from, STUDY_TIMER_DATE_FORMAT)
      .add(dir, 'months')
      .format(STUDY_TIMER_DATE_FORMAT)
    if (anchor > today) return w
    return myWindowFor(StudyTimerMyPeriod.Month, anchor)
  }
  const length = diffDays(w.from, w.to) + 1
  const to = addDays(w.to, dir * length)
  if (to > today) return w
  return { period: w.period, from: addDays(w.from, dir * length), to }
}

export const canShiftForward = (w: StudyTimerMyWindow): boolean => w.to < todayIso()

export const goalProgress = (
  goalMinutes: number | null,
  studyMinutes: number
): {
  percent: number | null
  ringFraction: number
  remaining: number | null
} => {
  if (goalMinutes === null || goalMinutes <= 0) {
    return { percent: null, ringFraction: 0, remaining: null }
  }
  return {
    percent: Math.round((studyMinutes / goalMinutes) * 100),
    ringFraction: Math.min(1, Math.max(0, studyMinutes / goalMinutes)),
    remaining: Math.max(0, goalMinutes - studyMinutes)
  }
}

/** startedAt < end <= min(startedAt + 6 h, now). startedAtUtc is a server UTC string (maybe without "Z"). */
export const validateEndTime = (startedAtUtc: string, endLocal: Date, now: Date): boolean => {
  const start = moment.utc(startedAtUtc)
  const end = moment(endLocal)
  const latest = moment.min(start.clone().add(STUDY_TIMER_MAX_CLOSE_HOURS, 'hours'), moment(now))
  return end.isAfter(start) && end.isSameOrBefore(latest)
}

/** UTC "YYYY-MM-DDTHH:mm:ss" without "Z" (the close-run request body). */
export const toServerUtc = (d: Date): string => moment.utc(d).format(SERVER_UTC_FORMAT)

/** Prefill of the close dialog: min(start + 1 h, latestEndAt). */
export const defaultEndTime = (startedAtUtc: string, latestEndAtUtc: string): Date =>
  moment.min(moment.utc(startedAtUtc).add(1, 'hours'), moment.utc(latestEndAtUtc)).toDate()

const durationText = (minutes: number, t: TFunction): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return t('studytimer_duration_m', { m, defaultValue: '{{m}}m' })
  if (m === 0) return t('studytimer_duration_h', { h, defaultValue: '{{h}}h' })
  return t('studytimer_duration_hm', {
    h,
    m,
    defaultValue: '{{h}}h {{m}}m'
  })
}

/** The one duration format of the module: ko "1시간 36분", en "1h 36m", vi "1 giờ 36 phút". */
export const formatDuration = (minutes: number, t: TFunction): string =>
  durationText(Math.max(0, Math.round(minutes)), t)

/** A change in minutes with its sign: "+1h 7m", "−3h 9m"; 0 has no sign. */
export const formatSignedDuration = (minutes: number, t: TFunction): string => {
  const m = Math.round(minutes)
  const sign = m > 0 ? '+' : m < 0 ? '−' : ''
  return `${sign}${durationText(Math.abs(m), t)}`
}

/** Language-neutral short duration for narrow columns: "50m", "2h", "1h05". */
export const compactDuration = (minutes: number): string => {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

/**
 * "Answer: ..." text of a reply. Answers to a teacher's own message are free text (stored with reason Other),
 * so they show only the text; nudge replies show the reason, plus " — text" when there is one.
 */
export const formatStudyTimerReply = (
  template: StudyTimerNotifyTemplate,
  reply: StudyTimerMessageReplyResponse,
  t: TFunction
): string => {
  if (template === StudyTimerNotifyTemplate.TeacherMessage && reply.text) {
    return reply.text
  }
  const reason = t(`studytimer_reason_${REPLY_REASON_KEYS[reply.reason]}`, {
    defaultValue: ''
  })
  return reply.text ? `${reason} — ${reply.text}` : reason
}

/** Text of an inbox message: the teacher's own words, or the template rendered with days / count. */
export const formatStudyTimerMessageBody = (m: StudyTimerMessageResponse, t: TFunction): string => {
  if (m.template === StudyTimerNotifyTemplate.TeacherMessage) return m.message ?? ''
  const key = TEMPLATE_KEYS[m.template]
  if (m.template === StudyTimerNotifyTemplate.TimerLeftRunning && m.count)
    return t(`studytimer_tpl_${key}_n`, { n: m.count })
  if (m.template === StudyTimerNotifyTemplate.NoRecord && m.days)
    return t(`studytimer_tpl_${key}_days`, { days: m.days })
  return t(`studytimer_tpl_${key}_body`, { defaultValue: '' })
}

/** HTTP status of an axios-style error, if any. */
export const getErrorStatus = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } } | null)?.response?.status

/** The student's announcement channel: ANNOUNCEMENT_A{DOMAIN}_U{userId}_CHANNEL (shared with the bell). */
export const studyTimerAnnouncementChannel = (academyDomain: string, userId: number | string) =>
  announcementChannel(academyDomain, userId)

/**
 * The goal notice of a ReceivedAnnouncement push, or undefined for any other announcement type.
 * extraData can be emptied when the payload was truncated; data.data carries the same JSON then.
 */
export const parseGoalNotice = (
  payload: StudyTimerAnnouncementPayload | null | undefined
): StudyTimerGoalNotice | undefined => {
  if (payload?.type !== STUDY_TIMER_GOAL_UPDATED_TYPE) return undefined
  const raw = payload.extraData || payload.data?.data
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as StudyTimerGoalNotice
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** Same texts as the web bell: "[course] your daily goal is now 3h" by goalAction; a generic line without minutes. */
export const goalNoticeText = (notice: StudyTimerGoalNotice, t: TFunction): string => {
  if (!notice.minutes || notice.minutes <= 0) return t('studytimer_bell_goal_generic')
  const goal = formatDuration(notice.minutes, t)
  const key =
    notice.goalAction === StudyTimerGoalAction.PersonalRemoved
      ? 'studytimer_bell_goal_removed'
      : notice.goalAction === StudyTimerGoalAction.ClassChanged
        ? 'studytimer_bell_goal_class'
        : 'studytimer_bell_goal_set'
  const prefix = notice.courseName ? `[${notice.courseName}] ` : ''
  return `${prefix}${t(key, { goal })}`
}

/** In-bar text of a timeline block: subject name, "Break", or nothing for an unclosed run. */
export const timelineBlockLabel = (
  record: StudyTimerRecordResponse,
  subjects: StudyTimerSubjectResponse[],
  t: TFunction
): string => {
  if (!record.isClosed) return ''
  if (record.kind !== TimerRecordKind.Study) return t('studytimer_tl_break')
  return subjects.find((s) => s.id === record.subjectId)?.name ?? ''
}

/** Whether a block is wide enough (share of the whole bar) to print its label. */
export const showTimelineBlockLabel = (minutes: number, totalMinutes: number): boolean =>
  totalMinutes > 0 && minutes / totalMinutes > TIMELINE_LABEL_MIN_SHARE

/** Whole minutes within 1..900, else null. Accepts the raw text of the input. */
export const parseGoalMinutes = (text: string): number | null => {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const minutes = Number(trimmed)
  return minutes >= STUDY_TIMER_MIN_GOAL && minutes <= STUDY_TIMER_MAX_GOAL ? minutes : null
}

/**
 * Which line the Today card shows. Older servers send no isPersonal: then the effective goal is the teacher's.
 * In the study space (no academy) only the personal goal exists: 'personal' or 'spaceNoGoal'.
 */
export const myGoalLabel = (
  goal: StudyTimerMyGoalResponse,
  isStudySpace = false
): 'personal' | 'teacher' | 'noClass' | 'noGoal' | 'spaceNoGoal' => {
  if (goal.isPersonal && goal.dailyMinutes !== null) return 'personal'
  if (isStudySpace) return 'spaceNoGoal'
  if (goal.dailyMinutes !== null) return 'teacher'
  return goal.courses.length === 0 ? 'noClass' : 'noGoal'
}

/** The set/change button needs the PUT me/goal endpoint; older servers send no isPersonal. */
export const canEditMyGoal = (goal: StudyTimerMyGoalResponse): boolean =>
  typeof goal.isPersonal === 'boolean'

export type MyGoalRow = {
  kind: 'teacher' | 'personal'
  minutes: number
  percent: number | null
  remaining: number | null
  reached: boolean
}

const positive = (n: number | null | undefined): n is number => typeof n === 'number' && n > 0

/** The student's own goal, if any (older servers: dailyMinutes when isPersonal). */
const personalGoalMinutes = (goal: StudyTimerMyGoalResponse): number | null => {
  const m = goal.personalMinutes ?? (goal.isPersonal ? goal.dailyMinutes : null)
  return positive(m) ? m : null
}

/** The teacher's goal, if any (older servers: dailyMinutes when not personal). */
const teacherGoalMinutes = (goal: StudyTimerMyGoalResponse): number | null => {
  const m = goal.teacherMinutes !== undefined ? goal.teacherMinutes : goal.isPersonal ? null : goal.dailyMinutes
  return positive(m) ? m : null
}

/** Rows of the Today card, each with its own progress. Study space: only the personal row. */
export const goalRows = (
  goal: StudyTimerMyGoalResponse,
  isStudySpace: boolean,
  studyMinutes: number
): MyGoalRow[] => {
  const build = (kind: MyGoalRow['kind'], minutes: number): MyGoalRow => {
    const { percent, remaining } = goalProgress(minutes, studyMinutes)
    return { kind, minutes, percent, remaining, reached: percent !== null && percent >= 100 }
  }
  const rows: MyGoalRow[] = []
  const teacher = isStudySpace ? null : teacherGoalMinutes(goal)
  const personal = personalGoalMinutes(goal)
  if (teacher !== null) rows.push(build('teacher', teacher))
  if (personal !== null) rows.push(build('personal', personal))
  return rows
}

/** Chart lines: teacher line from the days' goal (server), personal line only when it differs. */
export const periodGoalLines = (
  days: { goalMinutes: number | null }[],
  goal: StudyTimerMyGoalResponse
): { teacher: number | null; personal: number | null } => {
  const teacher = days.reduce<number | null>((acc, d) => (d.goalMinutes !== null ? d.goalMinutes : acc), null)
  const personal = personalGoalMinutes(goal)
  return { teacher, personal: personal !== null && personal !== teacher ? personal : null }
}

/** Ring target: the lower goal until today's study reaches it, then the higher one. One goal -> that goal. */
export const ringGoal = (
  teacherMinutes: number | null,
  personalMinutes: number | null,
  studyMinutes: number
): number | null => {
  if (teacherMinutes === null) return personalMinutes
  if (personalMinutes === null) return teacherMinutes
  const lower = Math.min(teacherMinutes, personalMinutes)
  const higher = Math.max(teacherMinutes, personalMinutes)
  return studyMinutes >= lower ? higher : lower
}
