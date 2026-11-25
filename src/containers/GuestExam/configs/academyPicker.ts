import { GuestAcademy } from './types'

/** Pure helpers for the academy picker (avatar initial, domain caption, retry delay, paging rules). */

/** First grapheme of the name, uppercased; undefined when the name is empty. */
export const getAvatarInitial = (name: string) => {
  const first = Array.from(name.trim())[0]
  return first ? first.toUpperCase() : undefined
}

/** Show the domain caption only when it adds information beyond the name. */
export const shouldShowDomain = (name: string, domain: string) =>
  !!domain.trim() && domain.trim().toLowerCase() !== name.trim().toLowerCase()

/** The first load (open) and a retry run at once; typing waits for the debounce. */
export const getAcademySearchDelay = (immediate: boolean, debounceMs: number) => (immediate ? 0 : debounceMs)

/** The pinned "My study space" row: always for an empty query, otherwise only when its label matches. */
export const shouldShowStudySpace = (label: string, query: string) => {
  const q = query.trim().toLowerCase()
  return !q || label.toLowerCase().includes(q)
}

/** Append a page, keeping order, dropping learning-space rows and domains already loaded. */
export const mergeAcademyPages = (current: GuestAcademy[], incoming: GuestAcademy[]): GuestAcademy[] => {
  const seen = new Set(current.map(item => item.domain.trim().toLowerCase()))
  const merged = [...current]
  incoming.forEach(item => {
    const key = item.domain.trim().toLowerCase()
    if (item.isLearningSpace || seen.has(key)) return
    seen.add(key)
    merged.push(item)
  })
  return merged
}

/** A response is used only if no newer query/reload started after its request. */
export const isCurrentRequest = (requestId: number, latestRequestId: number) => requestId === latestRequestId

/** More can be requested when the server said so and nothing is loading or failed. */
export const canLoadMoreAcademies = (state: {
  hasMore: boolean
  isLoading: boolean
  isLoadingMore: boolean
  hasError: boolean
}) => state.hasMore && !state.isLoading && !state.isLoadingMore && !state.hasError

export type AcademyPickerView = 'loading' | 'error' | 'empty' | 'list'

type AcademyPickerViewInput = {
  query: string
  isLoading: boolean
  hasError: boolean
  itemCount: number
  studySpaceVisible: boolean
}

/** "empty" only for a non-empty query with no items and no pinned row; an empty query always lists. */
export const getAcademyPickerView = ({
  query,
  isLoading,
  hasError,
  itemCount,
  studySpaceVisible
}: AcademyPickerViewInput): AcademyPickerView => {
  if (itemCount) return 'list'
  if (isLoading) return 'loading'
  if (hasError) return 'error'
  return query.trim() && !studySpaceVisible ? 'empty' : 'list'
}
