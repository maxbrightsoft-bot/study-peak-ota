import { isLatestResponse, isRequestPending, isSameResultRequest, resultRequestKey } from '../requestGuard'

const args = {
  examCode: 'EX1',
  studentExamSessionId: '2585',
  chapterId: undefined,
  textbookId: undefined,
  date: undefined
}

test('same args are the same request', () => {
  expect(isSameResultRequest(args, { ...args })).toBe(true)
})
test('a response for a previous attempt is not current', () => {
  expect(isSameResultRequest({ ...args, studentExamSessionId: '2578' }, args)).toBe(false)
})
test('a response for another exam is not current', () => {
  expect(isSameResultRequest({ ...args, examCode: 'EX2' }, args)).toBe(false)
})
test('textbook params are compared too', () => {
  const tb = { ...args, examCode: '', studentExamSessionId: '', chapterId: 7, textbookId: 3, date: '2026-11-10' }
  expect(isSameResultRequest(tb, { ...tb })).toBe(true)
  expect(isSameResultRequest(tb, { ...tb, chapterId: 8 })).toBe(false)
  expect(isSameResultRequest(tb, { ...tb, textbookId: undefined })).toBe(false)
  expect(isSameResultRequest(tb, { ...tb, date: '2026-11-11' })).toBe(false)
})
test('nothing in flight is never the same request', () => {
  expect(isSameResultRequest(null, args)).toBe(false)
})

describe('request sequence (RV-104)', () => {
  const a = args
  const b = { ...args, studentExamSessionId: '2578' }
  const latest = (pairs: [typeof args, number][]) => {
    const map: Record<string, number> = {}
    pairs.forEach(([x, seq]) => { map[resultRequestKey(x)] = seq })
    return map
  }

  test('the latest request for the current args is applied', () => {
    expect(isLatestResponse({ seq: 1, args: a }, a, latest([[a, 1]]))).toBe(true)
  })
  test('A -> B -> A: the first A response cannot overwrite the second', () => {
    const seqs = latest([[a, 3], [b, 2]])
    expect(isLatestResponse({ seq: 1, args: a }, a, seqs)).toBe(false)
    expect(isLatestResponse({ seq: 3, args: a }, a, seqs)).toBe(true)
    expect(isLatestResponse({ seq: 2, args: b }, a, seqs)).toBe(false) // not the current args
  })
  test('a request is pending only while the latest one for those args is in flight', () => {
    const seqs = latest([[a, 3], [b, 2]])
    expect(isRequestPending(a, seqs, new Set([3]))).toBe(true)
    expect(isRequestPending(a, seqs, new Set([1]))).toBe(false) // only an older A is running
    expect(isRequestPending(b, seqs, new Set())).toBe(false)
    expect(isRequestPending({ ...args, examCode: 'EX9' }, seqs, new Set([1, 2, 3]))).toBe(false)
  })
  test('the key does not confuse undefined with other values', () => {
    expect(resultRequestKey(a)).toBe(resultRequestKey({ ...a }))
    expect(resultRequestKey(a)).not.toBe(resultRequestKey({ ...a, chapterId: 0 }))
  })
})
