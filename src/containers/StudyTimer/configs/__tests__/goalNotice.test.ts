import type { TFunction } from 'i18next'
import {
  goalNoticeText,
  parseGoalNotice,
  studyTimerAnnouncementChannel,
  timelineBlockLabel,
  showTimelineBlockLabel
} from '../helpers'
import { TimerRecordKind } from '../enums'
import { StudyTimerRecordResponse } from '../types'

// Echoes the key and its options so the assertions see which text and values were picked.
const t = ((key: string, opts?: Record<string, unknown>) =>
  opts ? `${key}|${JSON.stringify(opts)}` : key) as unknown as TFunction

const record = (over: Partial<StudyTimerRecordResponse>): StudyTimerRecordResponse =>
  ({
    id: 1,
    subjectId: 7,
    kind: TimerRecordKind.Study,
    startedAt: '2026-11-08T01:00:00Z',
    endedAt: '2026-11-08T02:00:00Z',
    minutes: 60,
    isClosed: true,
    isManuallyClosed: false,
    ...over
  }) as StudyTimerRecordResponse

describe('studyTimerAnnouncementChannel', () => {
  test('uses the trimmed upper-case academy domain and the user id (same as web / BE)', () => {
    expect(studyTimerAnnouncementChannel(' abc ', 42)).toBe('ANNOUNCEMENT_AABC_U42_CHANNEL')
  })
})

describe('parseGoalNotice', () => {
  test('reads extraData of a StudyTimerGoalUpdated announcement', () => {
    const payload = {
      type: 'StudyTimerGoalUpdated',
      extraData: JSON.stringify({ courseName: 'A반', goalAction: 0, minutes: 180 })
    }
    expect(parseGoalNotice(payload)).toEqual({ courseName: 'A반', goalAction: 0, minutes: 180 })
  })
  test('falls back to data.data when extraData was truncated', () => {
    const payload = {
      type: 'StudyTimerGoalUpdated',
      extraData: '',
      data: { data: JSON.stringify({ goalAction: 2, minutes: 240 }) }
    }
    expect(parseGoalNotice(payload)).toEqual({ goalAction: 2, minutes: 240 })
  })
  test('returns undefined for other announcement types', () => {
    expect(parseGoalNotice({ type: 'StudyTimerTeacherMessage', extraData: '{}' })).toBeUndefined()
  })
  test('returns an empty notice when the payload is not valid JSON', () => {
    expect(parseGoalNotice({ type: 'StudyTimerGoalUpdated', extraData: '{oops' })).toEqual({})
  })
})

describe('goalNoticeText', () => {
  test('personal goal set, with the course prefix', () => {
    expect(goalNoticeText({ courseName: 'A반', goalAction: 0, minutes: 180 }, t)).toMatch(
      /^\[A반\] studytimer_bell_goal_set\|\{"goal":".+"\}$/
    )
  })
  test('picks the key by goalAction', () => {
    expect(goalNoticeText({ goalAction: 0, minutes: 60 }, t)).toMatch(/^studytimer_bell_goal_set\|/)
    expect(goalNoticeText({ goalAction: 1, minutes: 60 }, t)).toMatch(/^studytimer_bell_goal_removed\|/)
    expect(goalNoticeText({ goalAction: 2, minutes: 60 }, t)).toMatch(/^studytimer_bell_goal_class\|/)
  })
  test('no course prefix when the course name is missing', () => {
    expect(goalNoticeText({ goalAction: 2, minutes: 60 }, t).startsWith('[')).toBe(false)
  })
  test('generic text when minutes are missing (truncated payload) or zero', () => {
    expect(goalNoticeText({}, t)).toBe('studytimer_bell_goal_generic')
    expect(goalNoticeText({ goalAction: 2, minutes: 0 }, t)).toBe('studytimer_bell_goal_generic')
  })
})

describe('timelineBlockLabel', () => {
  const subjects = [{ id: 7, name: '국어' }]
  test('study block shows the subject name', () => {
    expect(timelineBlockLabel(record({}), subjects, t)).toBe('국어')
  })
  test('closed break block shows the break label', () => {
    expect(
      timelineBlockLabel(record({ kind: TimerRecordKind.Break, subjectId: null }), subjects, t)
    ).toBe('studytimer_tl_break')
  })
  test('unclosed block has no in-bar label', () => {
    expect(timelineBlockLabel(record({ isClosed: false }), subjects, t)).toBe('')
  })
})

describe('showTimelineBlockLabel', () => {
  test('only blocks wider than 6% of the bar get text', () => {
    expect(showTimelineBlockLabel(19, 239)).toBe(true)
    expect(showTimelineBlockLabel(10, 239)).toBe(false)
    expect(showTimelineBlockLabel(5, 0)).toBe(false)
  })
})
