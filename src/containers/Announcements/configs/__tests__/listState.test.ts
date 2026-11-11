import { AnnouncementReadFilter } from '../enums'
import { applyDeleted, applyReceived, applyUpdated, markAllItemsRead, markItemRead, matchesFilter } from '../listState'
import { AnnouncementResponse } from '../types'

const item = (id: number, isRead = false): AnnouncementResponse =>
  ({ id, isRead, type: 'WrongNoteReminder', extraData: '', createdAt: '', resourceId: '', resource: '' }) as AnnouncementResponse

const ids = (items: AnnouncementResponse[]) => items.map((i) => i.id)

describe('matchesFilter', () => {
  test('All matches everything, Unread only unread, Read only read', () => {
    expect(matchesFilter(item(1), AnnouncementReadFilter.All)).toBe(true)
    expect(matchesFilter(item(1), AnnouncementReadFilter.Unread)).toBe(true)
    expect(matchesFilter(item(1, true), AnnouncementReadFilter.Unread)).toBe(false)
    expect(matchesFilter(item(1), AnnouncementReadFilter.Read)).toBe(false)
  })
})

describe('applyReceived (Review Focus 4)', () => {
  test('prepends an unread item under All and Unread', () => {
    expect(ids(applyReceived([item(1)], item(2), AnnouncementReadFilter.All))).toEqual([2, 1])
    expect(ids(applyReceived([item(1)], item(2), AnnouncementReadFilter.Unread))).toEqual([2, 1])
  })

  test('does not insert an unread item under Read', () => {
    const items = [item(1, true)]
    expect(applyReceived(items, item(2), AnnouncementReadFilter.Read)).toBe(items)
  })

  test('does not duplicate an id already in the list', () => {
    expect(ids(applyReceived([item(2), item(1)], item(2), AnnouncementReadFilter.All))).toEqual([2, 1])
  })
})

describe('applyUpdated (Review Focus 4)', () => {
  test('replaces the item under All (and moves it to the top, like the web bell)', () => {
    const out = applyUpdated([item(3), item(2), item(1)], item(2, true), AnnouncementReadFilter.All)
    expect(ids(out)).toEqual([2, 3, 1])
    expect(out[0].isRead).toBe(true)
  })

  test('removes an item that became read while the filter is Unread', () => {
    expect(ids(applyUpdated([item(2), item(1)], item(2, true), AnnouncementReadFilter.Unread))).toEqual([1])
  })

  test('prepends an absent unread item under Unread, and ignores an absent one otherwise', () => {
    expect(ids(applyUpdated([item(1)], item(5), AnnouncementReadFilter.Unread))).toEqual([5, 1])
    expect(ids(applyUpdated([item(1)], item(5), AnnouncementReadFilter.All))).toEqual([1])
  })
})

describe('applyDeleted / markItemRead / markAllItemsRead', () => {
  test('applyDeleted drops the id', () => {
    expect(ids(applyDeleted([item(2), item(1)], 2))).toEqual([1])
  })

  test('markItemRead sets one item read', () => {
    expect(markItemRead([item(2), item(1)], 1).map((i) => i.isRead)).toEqual([false, true])
  })

  test('markAllItemsRead empties the Unread list and marks everything read otherwise', () => {
    expect(markAllItemsRead([item(2), item(1)], AnnouncementReadFilter.Unread)).toEqual([])
    expect(markAllItemsRead([item(2), item(1)], AnnouncementReadFilter.All).every((i) => i.isRead)).toBe(true)
  })
})

describe('M2 / M6: newer copies and truncated pushes', () => {
  const full = (id: number, isRead = false): AnnouncementResponse =>
    ({
      ...item(id, isRead),
      extraData: '{"examSessionId":2407}',
      data: { senderId: 2, senderFullName: 'Marcus', senderEmail: '', senderAvatar: 'a.png', senderRoles: [], data: '9|body' }
    }) as AnnouncementResponse
  const truncated = (id: number, isRead = false): AnnouncementResponse =>
    ({
      ...item(id, isRead),
      extraData: '',
      data: { senderId: 2, senderFullName: 'Marcus', senderEmail: '', senderAvatar: '', senderRoles: [], data: '' }
    }) as AnnouncementResponse

  test('applyReceived keeps the newer copy of a known id, first', () => {
    const out = applyReceived([item(3), full(2)], { ...full(2), count: 5 }, AnnouncementReadFilter.All)
    expect(ids(out)).toEqual([2, 3])
    expect(out[0].count).toBe(5)
  })

  test('applyUpdated moves the updated item to the top', () => {
    expect(ids(applyUpdated([item(3), item(2), item(1)], item(1, true), AnnouncementReadFilter.All))).toEqual([1, 3, 2])
  })

  test('applyUpdated keeps loaded extraData / data.data when the push was truncated', () => {
    const out = applyUpdated([full(2)], truncated(2, true), AnnouncementReadFilter.All)
    expect(out[0].isRead).toBe(true)
    expect(out[0].extraData).toBe('{"examSessionId":2407}')
    expect(out[0].data.data).toBe('9|body')
    expect(out[0].data.senderAvatar).toBe('a.png')
  })
})
