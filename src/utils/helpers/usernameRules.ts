// Must match the backend rule exactly: trim + lowercase, then ^[a-z][a-z0-9_.]{3,29}$
const USERNAME_PATTERN = /^[a-z][a-z0-9_.]{3,29}$/

export const normalizeUsername = (s: string): string => (s ?? '').trim().toLowerCase()

export const isValidUsername = (s: string): boolean =>
  USERNAME_PATTERN.test(normalizeUsername(s))
