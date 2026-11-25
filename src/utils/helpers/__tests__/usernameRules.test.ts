import { isValidUsername, normalizeUsername } from '../usernameRules'

describe('usernameRules', () => {
  test.each([
    ['minho', true],
    ['min', false],
    ['m234567890123456789012345678901', false], // 31
    ['m23456789012345678901234567890', true], // 30
    ['1minho', false],
    ['12345', false],
    ['min@ho', false],
    ['min-ho', false],
    ['min_ho.k', true],
    ['  Minho.K ', true],
  ])('isValidUsername(%j) === %s', (value, expected) => {
    expect(isValidUsername(value)).toBe(expected)
  })

  test('normalizeUsername trims and lowercases', () => {
    expect(normalizeUsername('  Minho.K ')).toBe('minho.k')
  })
})
