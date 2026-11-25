import { formatGuestElapsed, getGuestErrorMessage, isTeacherNotJoinedError, isValidGuestPhone, sanitizeGuestCode, withStudySpaceFirst, writeCodeAt } from '../helpers'

jest.mock('@/utils/helpers', () => ({ getErrorMessage: () => 'generic' }))

const t = ((key: string, options?: Record<string, string>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as Parameters<typeof getGuestErrorMessage>[0]

describe('sanitizeGuestCode', () => {
  it('keeps the case and drops anything that cannot be in a code', () => {
    expect(sanitizeGuestCode(' aB-3 kZ9 ')).toBe('aB3kZ')
  })
})

describe('writeCodeAt', () => {
  it('replaces one box in place and keeps the boxes after it', () => {
    expect(writeCodeAt('aB3kZ', 1, 'x')).toEqual({ code: 'ax3kZ', focusIndex: 2 })
  })

  it('fills forward from the box on paste and keeps the case', () => {
    expect(writeCodeAt('a', 1, 'Bc')).toEqual({ code: 'aBc', focusIndex: 3 })
    expect(writeCodeAt('', 0, 'aB3kZ9')).toEqual({ code: 'aB3kZ', focusIndex: 4 })
  })

  it('never leaves a gap when a later box is used on a short code', () => {
    expect(writeCodeAt('ab', 4, 'c')).toEqual({ code: 'abc', focusIndex: 3 })
  })
})

describe('isValidGuestPhone', () => {
  it('accepts 10 or 11 digits with single -, . or space separators', () => {
    expect(isValidGuestPhone('010-1234-5678')).toBe(true)
    expect(isValidGuestPhone('010 1234 5678')).toBe(true)
    expect(isValidGuestPhone('010.123.4567')).toBe(true)
    expect(isValidGuestPhone('01012345678')).toBe(true)
  })

  it('rejects blanks, wrong lengths and other characters', () => {
    expect(isValidGuestPhone('')).toBe(false)
    expect(isValidGuestPhone('010-1234')).toBe(false)
    expect(isValidGuestPhone('010--1234-5678')).toBe(false)
    expect(isValidGuestPhone('+82 10 1234 5678')).toBe(false)
    expect(isValidGuestPhone('010123456789')).toBe(false)
  })
})

describe('getGuestErrorMessage', () => {
  it('maps 429 to the friendly wait message and BE codes to copy', () => {
    expect(getGuestErrorMessage(t, { response: { status: 429, data: 'Too many requests.' } })).toBe('guest_too_many_requests')
    expect(getGuestErrorMessage(t, { response: { status: 404, data: { message: 'InvalidExamCode' } } })).toBe('guest_code_invalid')
    expect(getGuestErrorMessage(t, { response: { status: 400, data: { message: 'ConsentRequired' } } })).toBe('guest_consent_required')
    expect(getGuestErrorMessage(t, { response: { status: 401 } })).toBe('guest_session_ended')
    expect(getGuestErrorMessage(t, { response: { status: 500 } })).toBe('generic')
  })
})

describe('formatGuestElapsed', () => {
  it('shows minutes and zero-padded seconds', () => {
    expect(formatGuestElapsed(t, 2172)).toBe('mins_mins_seconds_seconds:{"mins":"36","seconds":"12"}')
    expect(formatGuestElapsed(t, 65)).toBe('mins_mins_seconds_seconds:{"mins":"1","seconds":"05"}')
  })
})

describe('isTeacherNotJoinedError', () => {
  it('matches the server message in the response body', () => {
    expect(isTeacherNotJoinedError({ response: { status: 500, data: { message: 'Teacher has not joined' } } })).toBe(true)
    expect(isTeacherNotJoinedError({ response: { status: 500, data: 'Teacher has not joined' } })).toBe(true)
  })

  it('ignores other errors', () => {
    expect(isTeacherNotJoinedError({ response: { status: 500, data: { message: 'Exam not found' } } })).toBe(false)
    expect(isTeacherNotJoinedError(new Error('network'))).toBe(false)
    expect(isTeacherNotJoinedError(undefined)).toBe(false)
  })
})

describe('withStudySpaceFirst', () => {
  const studySpace = { name: 'My study space', domain: '', isLearningSpace: true }
  const a = { name: 'A', domain: 'a', isLearningSpace: false }
  const b = { name: 'B', domain: 'b', isLearningSpace: false }

  it('returns only the study space for an empty list', () => {
    expect(withStudySpaceFirst([], studySpace)).toEqual([studySpace])
  })

  it('drops a server learning-space row and puts the study space first', () => {
    const server = { name: 'Study Space', domain: '', isLearningSpace: true }
    expect(withStudySpaceFirst([a, server, b], studySpace)).toEqual([studySpace, a, b])
  })

  it('keeps the academies in their order', () => {
    expect(withStudySpaceFirst([b, a], studySpace)).toEqual([studySpace, b, a])
  })
})
