import { GUEST_CODE_LENGTH } from '../configs/constants'

export type ExamQrPayload = {
  /** Academy domain; empty means Study Space (no academy). */
  domain: string
  /** Exam code, case kept as printed. */
  code: string
}

// Group 2 is an optional academy domain segment (`/student/take-exam/<domain>`).
const TAKE_EXAM_PATH = /\/(take-exam|student\/take\/exam|student\/take-exam)(\/[^/?#]+)?\/?$/
const CODE_PATTERN = new RegExp(`^[A-Za-z0-9]{${GUEST_CODE_LENGTH}}$`)

const decodePart = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

/**
 * Reads a teacher's exam QR: `…/student/take-exam?academy=X&code=Y`, `…/student/take-exam/X?code=Y` (the `academy` query
 * wins over the path domain), or the legacy `…/student/take/exam?…` / `…/take-exam?…`. Parsed by hand: React Native's
 * URL / URLSearchParams polyfills are incomplete. Returns null for anything else.
 */
export const parseExamQr = (data: string): ExamQrPayload | null => {
  const raw = (data || '').trim()
  const queryStart = raw.indexOf('?')
  if (queryStart < 0) return null

  const path = raw.slice(0, queryStart)
  const pathMatch = TAKE_EXAM_PATH.exec(path)
  if (!pathMatch) return null
  const pathDomain = pathMatch[2] ? decodePart(pathMatch[2].slice(1)).trim() : ''

  const query = raw.slice(queryStart + 1).split('#')[0]
  const params: Record<string, string> = {}
  query.split('&').forEach(pair => {
    if (!pair) return
    const separator = pair.indexOf('=')
    const key = decodePart(separator < 0 ? pair : pair.slice(0, separator))
    const value = separator < 0 ? '' : decodePart(pair.slice(separator + 1))
    if (!(key in params)) params[key] = value
  })

  const code = (params.code || '').trim()
  if (!CODE_PATTERN.test(code)) return null

  return { domain: (params.academy || '').trim() || pathDomain, code }
}
