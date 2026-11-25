import { shouldShowAttemptNumber } from '../attempt'

describe('shouldShowAttemptNumber', () => {
  it('hides attempt number on the first attempt', () => {
    expect(shouldShowAttemptNumber(1)).toBe(false)
    expect(shouldShowAttemptNumber(0)).toBe(false)
    expect(shouldShowAttemptNumber(undefined)).toBe(false)
    expect(shouldShowAttemptNumber(2)).toBe(true)
  })
})
