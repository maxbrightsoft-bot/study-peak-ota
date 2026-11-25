import { canUnlink, getAccountLinkErrorMessage, isLinked, isValidCode } from '../linkRules'

jest.mock('@/utils/helpers', () => ({ getErrorMessage: () => 'generic' }))

const t = ((key: string) => key) as unknown as Parameters<typeof getAccountLinkErrorMessage>[0]

describe('isLinked / canUnlink', () => {
  it('knows which providers are linked', () => {
    const links = { links: [{ provider: 'Google' as const }], hasPassword: false }
    expect(isLinked(links, 'Google')).toBe(true)
    expect(isLinked(links, 'Apple')).toBe(false)
    expect(isLinked(undefined, 'Google')).toBe(false)
  })

  it('refuses to unlink the last way to sign in', () => {
    expect(canUnlink({ links: [{ provider: 'Google' }], hasPassword: false }, 'Google')).toBe(false)
  })

  it('allows unlink when a password or the other provider remains', () => {
    expect(canUnlink({ links: [{ provider: 'Google' }], hasPassword: true }, 'Google')).toBe(true)
    expect(canUnlink({ links: [{ provider: 'Google' }, { provider: 'Apple' }], hasPassword: false }, 'Apple')).toBe(true)
  })

  it('refuses when the provider is not linked or nothing is loaded', () => {
    expect(canUnlink({ links: [], hasPassword: true }, 'Apple')).toBe(false)
    expect(canUnlink(undefined, 'Google')).toBe(false)
  })
})

describe('isValidCode', () => {
  it('needs exactly 6 digits', () => {
    expect(isValidCode('123456')).toBe(true)
    expect(isValidCode('12345')).toBe(false)
    expect(isValidCode('12345a')).toBe(false)
  })
})

describe('getAccountLinkErrorMessage', () => {
  it('shows the backend title for 400/403/404/409', () => {
    expect(getAccountLinkErrorMessage(t, { response: { status: 409, data: { title: 'Already%20linked' } } })).toBe('Already linked')
    expect(getAccountLinkErrorMessage(t, { response: { status: 400, data: { title: 'Wrong code' } } })).toBe('Wrong code')
  })

  it('shows the title for 429 and a friendly text without one', () => {
    expect(getAccountLinkErrorMessage(t, { response: { status: 429, data: { title: 'Slow down' } } })).toBe('Slow down')
    expect(getAccountLinkErrorMessage(t, { response: { status: 429 } })).toBe('too_many_code_requests')
  })

  it('falls back to getErrorMessage', () => {
    expect(getAccountLinkErrorMessage(t, { response: { status: 500 } })).toBe('generic')
  })
})
