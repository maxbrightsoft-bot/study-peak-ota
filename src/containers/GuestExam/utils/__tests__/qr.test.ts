import { parseExamQr } from '../qr'

describe('parseExamQr', () => {
  it('reads the academy and the code from a take-exam link', () => {
    expect(parseExamQr('https://x.studypeak.com/take-exam?academy=EUM&code=aB3kZ')).toEqual({ domain: 'EUM', code: 'aB3kZ' })
  })

  it('reads the academy and the code from the new student path', () => {
    expect(parseExamQr('https://x.studypeak.com/student/take/exam?academy=EUM&code=aB3kZ')).toEqual({ domain: 'EUM', code: 'aB3kZ' })
  })

  it('reads academy and code from /student/take-exam', () => {
    expect(parseExamQr('https://x.studypeak.com/student/take-exam?academy=EUM&code=aB3kZ')).toEqual({ domain: 'EUM', code: 'aB3kZ' })
  })

  it('reads the domain from the path', () => {
    expect(parseExamQr('https://x.studypeak.com/student/take-exam/EUM?code=aB3kZ')).toEqual({ domain: 'EUM', code: 'aB3kZ' })
  })

  it('decodes the path domain and accepts a trailing slash after it', () => {
    expect(parseExamQr('https://x.studypeak.com/student/take-exam/sky%2Dkorean/?code=aB3kZ')).toEqual({ domain: 'sky-korean', code: 'aB3kZ' })
  })

  it('query academy wins over the path domain', () => {
    expect(parseExamQr('https://x.studypeak.com/student/take-exam/OTHER?academy=EUM&code=aB3kZ')).toEqual({ domain: 'EUM', code: 'aB3kZ' })
  })

  it('rejects deeper /student/take-exam paths', () => {
    expect(parseExamQr('https://x.studypeak.com/student/take-exam/aB3kZ/info?code=aB3kZ')).toBeNull()
  })

  it('keeps the case of the code', () => {
    expect(parseExamQr('https://x.studypeak.com/take-exam?academy=eum&code=AbCdE')?.code).toBe('AbCdE')
  })

  it('accepts the parameters in any order and URL-escaped values', () => {
    expect(parseExamQr('https://x.studypeak.com/take-exam?code=Xy9Kp&academy=seoul%20math')).toEqual({ domain: 'seoul math', code: 'Xy9Kp' })
  })

  it('treats a link without an academy as Study Space', () => {
    expect(parseExamQr('https://x.studypeak.com/take-exam?code=aB3kZ')).toEqual({ domain: '', code: 'aB3kZ' })
  })

  it('accepts a trailing slash on the path', () => {
    expect(parseExamQr('https://x.studypeak.com/take-exam/?academy=EUM&code=aB3kZ')).toEqual({ domain: 'EUM', code: 'aB3kZ' })
  })

  it('returns null for anything that is not a take-exam link with a 5-character code', () => {
    expect(parseExamQr('hello')).toBeNull()
    expect(parseExamQr('')).toBeNull()
    expect(parseExamQr('https://x.studypeak.com/login?academy=EUM&code=aB3kZ')).toBeNull()
    expect(parseExamQr('https://x.studypeak.com/take-exam?academy=EUM')).toBeNull()
    expect(parseExamQr('https://x.studypeak.com/take-exam?academy=EUM&code=aB3')).toBeNull()
    expect(parseExamQr('https://x.studypeak.com/take-exam?academy=EUM&code=aB3k!')).toBeNull()
  })
})
