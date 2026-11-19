import {
  canLoadMoreNotes,
  isNewNotesQuery,
  isCurrentNotesResponse,
  isNotesRequestInFlight,
  mergeNotesPage,
  notesFilterKey
} from '../notesRequestGuard'

const base = { currentPage: 1, pageSize: 10, examCode: 'EX1', studentExamSessionId: '2585' }

describe('notesFilterKey (G4)', () => {
  test('no filter / no page = nothing to load', () => {
    expect(notesFilterKey(undefined)).toBeNull()
    expect(notesFilterKey({ ...base, currentPage: 0 })).toBeNull()
  })
  test('another attempt of the same exam is another filter', () => {
    expect(notesFilterKey(base)).not.toBe(notesFilterKey({ ...base, studentExamSessionId: '2590' }))
  })
  test('same values give the same key', () => {
    expect(notesFilterKey(base)).toBe(notesFilterKey({ ...base }))
  })
})

describe('isCurrentNotesResponse (G4)', () => {
  const a = notesFilterKey(base) as string
  const b = notesFilterKey({ ...base, studentExamSessionId: '2590' }) as string
  test('the latest request for the current filter is applied', () => {
    expect(isCurrentNotesResponse({ seq: 2, key: a }, a, 2)).toBe(true)
  })
  test('a late response for attempt #2 is dropped once attempt #3 is shown', () => {
    expect(isCurrentNotesResponse({ seq: 1, key: a }, b, 2)).toBe(false)
  })
  test('an older request for the same filter cannot overwrite a newer one', () => {
    expect(isCurrentNotesResponse({ seq: 1, key: a }, a, 3)).toBe(false)
  })
  test('a response is dropped when the filter was cleared', () => {
    expect(isCurrentNotesResponse({ seq: 1, key: a }, null, 1)).toBe(false)
  })
})

describe('isNotesRequestInFlight (G4)', () => {
  const a = notesFilterKey(base) as string
  const b = notesFilterKey({ ...base, studentExamSessionId: '2590' }) as string
  test('skips only when the same filter is already loading', () => {
    expect(isNotesRequestInFlight(a, { seq: 1, key: a })).toBe(true)
    expect(isNotesRequestInFlight(b, { seq: 1, key: a })).toBe(false)
    expect(isNotesRequestInFlight(a, null)).toBe(false)
  })
})

describe('canLoadMoreNotes (RV-202)', () => {
  const a = notesFilterKey(base) as string
  test('advances only when more pages exist and nothing is loading', () => {
    expect(canLoadMoreNotes(1, 3, null)).toBe(true)
    expect(canLoadMoreNotes(1, 3, { seq: 1, key: a })).toBe(false) // second onEndReached while page 1 loads
    expect(canLoadMoreNotes(3, 3, null)).toBe(false)
    expect(canLoadMoreNotes(undefined, 3, null)).toBe(false)
  })
})

describe('isNewNotesQuery (RV-209)', () => {
  test('another attempt / exam / cleared filter is a new query', () => {
    expect(isNewNotesQuery(base, { ...base, studentExamSessionId: '2590' })).toBe(true)
    expect(isNewNotesQuery(base, { ...base, examCode: 'EX2' })).toBe(true)
    expect(isNewNotesQuery(base, undefined)).toBe(true)
    expect(isNewNotesQuery(undefined, base)).toBe(true)
  })
  test('only the page changed (load more) or nothing changed is the same query', () => {
    expect(isNewNotesQuery(base, { ...base, currentPage: 2 })).toBe(false)
    expect(isNewNotesQuery(base, { ...base })).toBe(false)
    expect(isNewNotesQuery(undefined, undefined)).toBe(false)
  })
})

describe('mergeNotesPage', () => {
  const n = (id: number) => ({ id }) as never
  test('page 1 replaces, later pages append without duplicates', () => {
    expect(mergeNotesPage([n(1), n(2)], [n(3)], 1)).toEqual([n(3)])
    expect(mergeNotesPage([n(1), n(2)], [n(2), n(3)], 2)).toEqual([n(1), n(2), n(3)])
  })
})
