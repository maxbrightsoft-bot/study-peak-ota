// How a loaded bell list changes on realtime events and read actions (same rules as the web bell).
import { AnnouncementReadFilter } from './enums'
import { AnnouncementResponse } from './types'

type Items = AnnouncementResponse[]

export const matchesFilter = (a: AnnouncementResponse, filter: AnnouncementReadFilter): boolean =>
  filter === AnnouncementReadFilter.All || (filter === AnnouncementReadFilter.Unread ? !a.isRead : a.isRead)

/** A new item goes first; a newer copy of a known id replaces it (web: uniqBy([a, ...state])). */
export const applyReceived = (items: Items, a: AnnouncementResponse, filter: AnnouncementReadFilter): Items =>
  matchesFilter(a, filter) ? [a, ...items.filter((i) => i.id !== a.id)] : items

/**
 * An oversized push arrives truncated (empty extraData / data.data): keep what the loaded item already has,
 * so its text and tap target survive. Everything else comes from the newer copy.
 */
const mergeUpdate = (existing: AnnouncementResponse, a: AnnouncementResponse): AnnouncementResponse => ({
  ...existing,
  ...a,
  extraData: a.extraData || existing.extraData,
  isResolved: a.isResolved !== undefined ? a.isResolved : existing.isResolved,
  data: {
    ...existing.data,
    ...a.data,
    data: a.data?.data || existing.data?.data,
    senderAvatar: a.data?.senderAvatar || existing.data?.senderAvatar
  }
})

/** The updated item moves to the top (grouped items are re-bumped), or leaves when it no longer matches. */
export const applyUpdated = (items: Items, a: AnnouncementResponse, filter: AnnouncementReadFilter): Items => {
  const existing = items.find((i) => i.id === a.id)
  if (!existing) {
    return filter === AnnouncementReadFilter.Unread && !a.isRead ? [a, ...items] : items
  }
  const rest = items.filter((i) => i.id !== a.id)
  const merged = mergeUpdate(existing, a)
  return matchesFilter(merged, filter) ? [merged, ...rest] : rest
}

export const applyDeleted = (items: Items, id: number): Items => items.filter((i) => i.id !== id)

export const markItemRead = (items: Items, id: number): Items =>
  items.map((i) => (i.id === id ? { ...i, isRead: true } : i))

export const markAllItemsRead = (items: Items, filter: AnnouncementReadFilter): Items =>
  filter === AnnouncementReadFilter.Unread ? [] : items.map((i) => ({ ...i, isRead: true }))
