jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => Promise.resolve('test-id')),
  getSystemName: jest.fn(() => 'iOS'),
  getSystemVersion: jest.fn(() => '18.7'),
  getVersion: jest.fn(() => '1.0.12'),
  getModel: jest.fn(() => 'iPhone'),
  getBuildNumber: jest.fn(() => '5'),
}))
jest.mock('@/hooks/useActivityTracking', () => ({ trackErrorStandalone: jest.fn() }))
jest.mock('@/services/api/apiClient', () => ({ api: {} }))
jest.mock('@/store/useAuthStore', () => ({}))

import { isTextualAnswerEmpty, hasAnyTextualAnswer, stripHtml } from '../index'

describe('textualAnswer helpers', () => {
  it('stripHtml is exported and functional', () => {
    expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World')
    expect(stripHtml('')).toBe('')
  })

  it('isTextualAnswerEmpty handles empty values', () => {
    expect(isTextualAnswerEmpty()).toBe(true)
    expect(isTextualAnswerEmpty('')).toBe(true)
    expect(isTextualAnswerEmpty('   ')).toBe(true)
    expect(isTextualAnswerEmpty('<p></p>')).toBe(true)
    expect(isTextualAnswerEmpty('<p><br></p>')).toBe(true)
    expect(isTextualAnswerEmpty('<br>')).toBe(true)
  })

  it('isTextualAnswerEmpty handles math and html correctly without error', () => {
    expect(isTextualAnswerEmpty('$x + 1$')).toBe(false)
    expect(isTextualAnswerEmpty('<span class="math-chip">...</span>')).toBe(false)
    expect(isTextualAnswerEmpty('<p>Answer 1</p>')).toBe(false)
  })

  it('hasAnyTextualAnswer detects answers', () => {
    expect(hasAnyTextualAnswer([])).toBe(false)
    expect(hasAnyTextualAnswer(['', '<p></p>'])).toBe(false)
    expect(hasAnyTextualAnswer(['', 'Valid answer'])).toBe(true)
  })
})
