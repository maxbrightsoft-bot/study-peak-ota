import {
  getGuestResultErrorMessage,
  getSelectableSelectedIds,
  getSelectedGuestNames,
  isGuestResultSelectable,
  toggleGuestResult
} from '../helpers'

jest.mock('@/utils/helpers', () => ({ getErrorMessage: () => 'generic' }))

const t = ((key: string) => key) as unknown as Parameters<typeof getGuestResultErrorMessage>[0]

const row = (id: number, guestName: string, matchesOtherStudents = false) => ({
  guestStudentExamSessionId: id,
  guestName,
  examTitle: 'e',
  takenAt: '',
  earned: 0,
  total: 0,
  isProvisional: false,
  matchesOtherStudents
})

describe('selection', () => {
  it('toggles an id in and out', () => {
    expect(toggleGuestResult([1], 2)).toEqual([1, 2])
    expect(toggleGuestResult([1, 2], 1)).toEqual([2])
  })

  it('allows a row while not sending and blocks it while sending', () => {
    expect(isGuestResultSelectable(row(1, 'A'))).toBe(true)
    expect(isGuestResultSelectable(row(1, 'A'), false)).toBe(true)
    expect(isGuestResultSelectable(row(1, 'A'), true)).toBe(false)
  })

  it('blocks a row that also matches other students, even when not sending', () => {
    expect(isGuestResultSelectable(row(2, 'B', true))).toBe(false)
    expect(isGuestResultSelectable(row(2, 'B', true), false)).toBe(false)
    expect(isGuestResultSelectable(row(3, 'C', false))).toBe(true)
  })

  it('keeps only selected ids that are still selectable rows', () => {
    const results = [row(1, 'A'), row(2, 'B', true), row(3, 'C')]
    expect(getSelectableSelectedIds(results, [3, 2, 1, 99])).toEqual([3, 1])
    expect(getSelectableSelectedIds(undefined, [1])).toEqual([])
  })
})

describe('getGuestResultErrorMessage', () => {
  it('maps 429 to the friendly message', () => {
    expect(getGuestResultErrorMessage(t, { response: { status: 429 } })).toBe('guest_too_many_requests')
  })

  it('shows the backend title for 404 and 409', () => {
    expect(
      getGuestResultErrorMessage(t, {
        response: { status: 409, data: { title: 'Already%20combined' } }
      })
    ).toBe('Already combined')
    expect(
      getGuestResultErrorMessage(t, {
        response: { status: 404, data: { title: 'Not found' } }
      })
    ).toBe('Not found')
  })

  it('keeps a title that is not URI encoded', () => {
    expect(
      getGuestResultErrorMessage(t, {
        response: { status: 409, data: { title: '100% done' } }
      })
    ).toBe('100% done')
  })

  it('falls back to the generic message otherwise', () => {
    expect(getGuestResultErrorMessage(t, { response: { status: 500 } })).toBe('generic')
  })
})

describe('getSelectedGuestNames', () => {
  it('lists distinct names of the selected rows in list order', () => {
    const results = [row(1, 'Minji'), row(2, 'Minho'), row(3, 'Minji'), row(4, 'Other')]
    expect(getSelectedGuestNames(results, [3, 2, 1])).toEqual(['Minji', 'Minho'])
  })

  it('ignores selected rows that match other students', () => {
    const results = [row(1, 'Minji'), row(2, 'Sibling', true)]
    expect(getSelectedGuestNames(results, [1, 2])).toEqual(['Minji'])
  })

  it('skips unselected rows, blank names and an undefined list', () => {
    expect(getSelectedGuestNames([row(1, '  '), row(2, 'A')], [1])).toEqual([])
    expect(getSelectedGuestNames(undefined, [1])).toEqual([])
  })
})
