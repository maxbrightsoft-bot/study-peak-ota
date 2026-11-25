import {
  canLoadMoreAcademies,
  getAcademyPickerView,
  getAcademySearchDelay,
  getAvatarInitial,
  isCurrentRequest,
  mergeAcademyPages,
  shouldShowDomain,
  shouldShowStudySpace
} from '../academyPicker'
import { GuestAcademy } from '../types'

describe('getAvatarInitial', () => {
  it('uppercases the first character', () => {
    expect(getAvatarInitial(' touch')).toBe('T')
  })

  it('keeps a whole Korean syllable and a surrogate pair', () => {
    expect(getAvatarInitial('학원')).toBe('학')
    expect(getAvatarInitial('😀 Club')).toBe('😀')
  })

  it('returns undefined for an empty name', () => {
    expect(getAvatarInitial('   ')).toBeUndefined()
  })
})

describe('shouldShowDomain', () => {
  it('hides an empty domain or one equal to the name', () => {
    expect(shouldShowDomain('Touch', '')).toBe(false)
    expect(shouldShowDomain('Touch', 'touch')).toBe(false)
  })

  it('shows a different domain', () => {
    expect(shouldShowDomain('Touch Academy', 'touch')).toBe(true)
  })
})

describe('getAcademySearchDelay', () => {
  it('skips the debounce when immediate only', () => {
    expect(getAcademySearchDelay(true, 300)).toBe(0)
    expect(getAcademySearchDelay(false, 300)).toBe(300)
  })
})

const academy = (domain: string, name = domain): GuestAcademy => ({ name, domain, isLearningSpace: false })

describe('shouldShowStudySpace', () => {
  it('always shows for an empty or blank query', () => {
    expect(shouldShowStudySpace('My study space', '')).toBe(true)
    expect(shouldShowStudySpace('My study space', '   ')).toBe(true)
  })

  it('shows only when the label matches a non-empty query', () => {
    expect(shouldShowStudySpace('My study space', ' STUDY ')).toBe(true)
    expect(shouldShowStudySpace('My study space', 'seoul')).toBe(false)
  })
})

describe('mergeAcademyPages', () => {
  it('appends in order without duplicate domains', () => {
    const merged = mergeAcademyPages([academy('a'), academy('b')], [academy('B'), academy('c')])
    expect(merged.map(item => item.domain)).toEqual(['a', 'b', 'c'])
  })

  it('drops learning-space rows and de-duplicates inside one page', () => {
    const space = { name: 'Study Space', domain: '', isLearningSpace: true }
    expect(mergeAcademyPages([], [space, academy('a'), academy('a')])).toEqual([academy('a')])
  })
})

describe('isCurrentRequest', () => {
  it('rejects a response from an older request', () => {
    expect(isCurrentRequest(3, 3)).toBe(true)
    expect(isCurrentRequest(2, 3)).toBe(false)
  })
})

describe('canLoadMoreAcademies', () => {
  const base = { hasMore: true, isLoading: false, isLoadingMore: false, hasError: false }

  it('allows another page only when idle and the server has more', () => {
    expect(canLoadMoreAcademies(base)).toBe(true)
    expect(canLoadMoreAcademies({ ...base, hasMore: false })).toBe(false)
    expect(canLoadMoreAcademies({ ...base, isLoading: true })).toBe(false)
    expect(canLoadMoreAcademies({ ...base, isLoadingMore: true })).toBe(false)
    expect(canLoadMoreAcademies({ ...base, hasError: true })).toBe(false)
  })
})

describe('getAcademyPickerView', () => {
  const base = { query: '', isLoading: false, hasError: false, itemCount: 0, studySpaceVisible: true }

  it('lists as soon as there are items, even while a query is typed', () => {
    expect(getAcademyPickerView({ ...base, itemCount: 2, isLoading: true })).toBe('list')
  })

  it('is loading or error without items', () => {
    expect(getAcademyPickerView({ ...base, isLoading: true })).toBe('loading')
    expect(getAcademyPickerView({ ...base, hasError: true })).toBe('error')
  })

  it('is empty only for a non-empty query with no items and no pinned row', () => {
    expect(getAcademyPickerView({ ...base, query: 'zzz', studySpaceVisible: false })).toBe('empty')
    expect(getAcademyPickerView({ ...base, query: 'zzz', studySpaceVisible: true })).toBe('list')
    expect(getAcademyPickerView({ ...base, studySpaceVisible: false })).toBe('list')
  })
})
