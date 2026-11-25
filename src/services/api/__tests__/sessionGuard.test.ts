import { shouldLogoutOn401 } from '../sessionGuard'

describe('shouldLogoutOn401', () => {
  it('keeps the session when the 401 came from an older token', () => {
    expect(shouldLogoutOn401('Bearer old', 'new')).toBe(false)
  })

  it('logs out when the 401 came from the current token', () => {
    expect(shouldLogoutOn401('Bearer new', 'new')).toBe(true)
  })

  it('logs out when the header or the stored token is missing', () => {
    expect(shouldLogoutOn401(undefined, 'new')).toBe(true)
    expect(shouldLogoutOn401('', 'new')).toBe(true)
    expect(shouldLogoutOn401('Bearer old', null)).toBe(true)
  })
})
