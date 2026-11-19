import moment from 'moment'
import { isEffectiveRejected, isNewNoteLocked, isNoteWriteLocked } from '../noteDialog'

const NOW = moment.utc('2026-11-11T12:00:00').valueOf()

describe('isNewNoteLocked (web ExamNoteDialog: no Add note after the deadline)', () => {
  test('no deadline: open', () => {
    expect(isNewNoteLocked(null, false, NOW)).toBe(false)
    expect(isNewNoteLocked(undefined, undefined, NOW)).toBe(false)
  })
  test('deadline in the future: open', () => {
    expect(isNewNoteLocked('2026-11-11T13:00:00', false, NOW)).toBe(false)
  })
  test('deadline passed: locked unless late submission is allowed', () => {
    expect(isNewNoteLocked('2026-11-11T11:00:00', false, NOW)).toBe(true)
    expect(isNewNoteLocked('2026-11-11T11:00:00', true, NOW)).toBe(false)
  })
})

describe('isEffectiveRejected (server NoteService rule)', () => {
  test('rejected and not rewritten since the review', () => {
    expect(isEffectiveRejected({ reviewStatus: 2, reviewedAt: '2026-11-10T10:00:00', studentEditedAt: '2026-11-10T09:00:00' })).toBe(true)
    expect(isEffectiveRejected({ reviewStatus: 2, reviewedAt: '2026-11-10T10:00:00', studentEditedAt: null })).toBe(true)
  })
  test('rewritten after the review, or not rejected', () => {
    expect(isEffectiveRejected({ reviewStatus: 2, reviewedAt: '2026-11-10T10:00:00', studentEditedAt: '2026-11-10T11:00:00' })).toBe(false)
    expect(isEffectiveRejected({ reviewStatus: 1 })).toBe(false)
    expect(isEffectiveRejected(undefined)).toBe(false)
  })
})

describe('isNoteWriteLocked (RV-306, web isWriteLocked)', () => {
  const past = '2026-11-11T11:00:00'
  test('after the deadline only an open send-back stays writable', () => {
    expect(isNoteWriteLocked(past, false, { reviewStatus: 2, reviewedAt: '2026-11-10T10:00:00' }, NOW)).toBe(false)
    expect(isNoteWriteLocked(past, false, { reviewStatus: 1 }, NOW)).toBe(true) // approved
    expect(isNoteWriteLocked(past, false, { reviewStatus: 0 }, NOW)).toBe(true) // pending
    expect(isNoteWriteLocked(past, false, undefined, NOW)).toBe(true) // new note
  })
  test('before the deadline or with late allowance nothing is locked', () => {
    expect(isNoteWriteLocked('2026-11-11T13:00:00', false, { reviewStatus: 1 }, NOW)).toBe(false)
    expect(isNoteWriteLocked(past, true, undefined, NOW)).toBe(false)
    expect(isNoteWriteLocked(null, false, undefined, NOW)).toBe(false)
  })
})
