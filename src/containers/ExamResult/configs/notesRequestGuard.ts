// Pure guard for the exam result notes list (G4): a response is applied only while its filter is still the current one.
import _ from 'lodash'
import type { NoteResponse, NoteSearchQuery } from '@/utils/types'

/** Key of a notes filter; null = nothing to load (no filter yet or no page). */
export const notesFilterKey = (filter?: NoteSearchQuery): string | null =>
  filter && filter.currentPage ? JSON.stringify(filter) : null

export type NotesRequest = { seq: number; key: string }

/** Apply a response only for the current filter and only if no newer notes request was started since. */
export const isCurrentNotesResponse = (
  request: NotesRequest,
  currentKey: string | null,
  latestSeq: number
): boolean => request.key === currentKey && request.seq === latestSeq

/** Whether a request for this filter is already running (then a refetch, e.g. on focus, can be skipped). */
export const isNotesRequestInFlight = (key: string, inFlight: NotesRequest | null): boolean =>
  !!inFlight && inFlight.key === key

/** RV-202: advance to the next page only when one exists and no request is running (each page fetched exactly once). */
export const canLoadMoreNotes = (
  currentPage: number | undefined,
  totalPages: number,
  inFlight: NotesRequest | null
): boolean => !!currentPage && currentPage < totalPages && !inFlight

/** RV-209: the filter changed in something other than the page (another attempt / exam, or cleared): drop the old list. */
export const isNewNotesQuery = (prev?: NoteSearchQuery, next?: NoteSearchQuery): boolean => {
  if (!prev || !next) return !!prev !== !!next
  return !_.isEqual(_.omit(prev, 'currentPage'), _.omit(next, 'currentPage'))
}

/** Page 1 replaces the list; later pages append without duplicates. */
export const mergeNotesPage = (
  prev: NoteResponse[],
  items: NoteResponse[],
  currentPage?: number
): NoteResponse[] => (currentPage && currentPage > 1 ? _.uniqBy([...prev, ...items], 'id') : items)
