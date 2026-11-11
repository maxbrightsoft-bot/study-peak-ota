import { AnnouncementType } from '../enums'
import {
  announcementChannel,
  bellBadgeLabel,
  isNoteAnnouncementType,
  isStudyTimerAnnouncementType,
  isTeacherOnlyAnnouncementType,
  isWrongNoteAnnouncementType,
  noteIdOf,
  parseAnnouncementExtra,
  toAnnouncement
} from '../helpers'
import { AnnouncementResponse, WrongNoteAnnouncementExtraData } from '../types'

const announcement = (over: Partial<AnnouncementResponse> = {}): AnnouncementResponse =>
  ({
    id: 1,
    isRead: false,
    type: AnnouncementType.WrongNoteRejected,
    extraData: '',
    createdAt: '2026-11-08T01:00:00',
    resourceId: '',
    resource: '',
    data: {
      senderId: 2,
      senderFullName: 'Marcus',
      senderEmail: '',
      senderAvatar: '',
      senderRoles: [],
      data: ''
    },
    ...over
  }) as AnnouncementResponse

describe('announcementChannel', () => {
  test('uses the trimmed upper-case academy domain and the user id (same as web / BE)', () => {
    expect(announcementChannel(' sample ', 12)).toBe('ANNOUNCEMENT_ASAMPLE_U12_CHANNEL')
  })
})

describe('announcement type sets', () => {
  const all = Object.values(AnnouncementType)

  test('there are 22 types, each in exactly one of wrong-note / study-timer / note', () => {
    expect(all).toHaveLength(22)
    for (const type of all) {
      const hits = [isWrongNoteAnnouncementType, isStudyTimerAnnouncementType, isNoteAnnouncementType].filter(
        (fn) => fn(type)
      )
      expect([type, hits.length]).toEqual([type, 1])
    }
    expect(all.filter((x) => isWrongNoteAnnouncementType(x))).toHaveLength(10)
    expect(all.filter((x) => isStudyTimerAnnouncementType(x))).toHaveLength(8)
    expect(all.filter((x) => isNoteAnnouncementType(x))).toHaveLength(4)
  })

  test('teacher-only types are exactly submitted / resubmitted / edited-after-check / replied', () => {
    expect(all.filter((x) => isTeacherOnlyAnnouncementType(x)).sort()).toEqual(
      [
        AnnouncementType.WrongNoteSubmitted,
        AnnouncementType.WrongNoteResubmitted,
        AnnouncementType.WrongNoteEditedAfterCheck,
        AnnouncementType.StudyTimerReplied
      ].sort()
    )
  })

  test('unknown or missing types are in no set', () => {
    expect(isWrongNoteAnnouncementType('SomethingNew')).toBe(false)
    expect(isStudyTimerAnnouncementType(undefined)).toBe(false)
    expect(isNoteAnnouncementType('')).toBe(false)
  })
})

describe('parseAnnouncementExtra', () => {
  test('reads extraData JSON', () => {
    expect(
      parseAnnouncementExtra<WrongNoteAnnouncementExtraData>(announcement({ extraData: '{"examSessionId":5}' }))
    ).toEqual({ examSessionId: 5 })
  })

  test('falls back to data.data when extraData was emptied (truncated push)', () => {
    const a = announcement({ extraData: '' })
    a.data.data = '{"examSessionId":7}'
    expect(parseAnnouncementExtra<WrongNoteAnnouncementExtraData>(a)).toEqual({ examSessionId: 7 })
  })

  test('returns {} for invalid JSON, a non-object, or no payload', () => {
    expect(parseAnnouncementExtra(announcement({ extraData: 'not json' }))).toEqual({})
    expect(parseAnnouncementExtra(announcement({ extraData: '7' }))).toEqual({})
    expect(parseAnnouncementExtra(announcement())).toEqual({})
    expect(parseAnnouncementExtra(undefined)).toEqual({})
  })
})

describe('toAnnouncement', () => {
  test('accepts an object or a JSON string with a numeric id and a string type', () => {
    const a = announcement({ id: 9 })
    expect(toAnnouncement(a)).toBe(a)
    expect(toAnnouncement(JSON.stringify(a))).toEqual(a)
  })

  test('rejects anything else', () => {
    expect(toAnnouncement(null)).toBeUndefined()
    expect(toAnnouncement('{}')).toBeUndefined()
    expect(toAnnouncement('garbage')).toBeUndefined()
    expect(toAnnouncement({ id: 'x', type: 'A' })).toBeUndefined()
  })
})

describe('noteIdOf', () => {
  test('is the first |-segment of data.data when it is a positive integer', () => {
    const a = announcement()
    a.data.data = '42|hello|world'
    expect(noteIdOf(a)).toBe(42)
  })

  test('is undefined for a non-numeric segment or no data', () => {
    const a = announcement()
    a.data.data = 'abc|x'
    expect(noteIdOf(a)).toBeUndefined()
    expect(noteIdOf(announcement({ data: undefined as unknown as AnnouncementResponse['data'] }))).toBeUndefined()
  })
})

describe('bellBadgeLabel', () => {
  test('is hidden at 0 or less, the number up to 9, then 9+', () => {
    expect(bellBadgeLabel(0)).toBeUndefined()
    expect(bellBadgeLabel(-1)).toBeUndefined()
    expect(bellBadgeLabel(1)).toBe('1')
    expect(bellBadgeLabel(9)).toBe('9')
    expect(bellBadgeLabel(10)).toBe('9+')
  })
})

describe('noteIdOf: truncated note pushes (M2)', () => {
  test('falls back to resourceId for a Note resource when data.data is empty', () => {
    expect(noteIdOf(announcement({ resource: 'Note', resourceId: '42' }))).toBe(42)
  })

  test('does not use resourceId of a comment (it is the comment id)', () => {
    expect(noteIdOf(announcement({ resource: 'NoteComment', resourceId: '77' }))).toBeUndefined()
  })
})
