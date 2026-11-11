import {
  getAnnouncementsApi,
  getUnreadAnnouncementCountApi,
  markAllAnnouncementsReadApi,
  markAnnouncementReadApi
} from '@/containers/Announcements/apiClients'
import { AnnouncementReadFilter } from '@/containers/Announcements/configs/enums'
import { AnnouncementPage, AnnouncementResponse } from '@/containers/Announcements/configs/types'
import useAnnouncementStore from '../useAnnouncementStore'

// jest-expo does not transform immer's ESM build; a shallow draft is enough for these setters
// (they assign fields or replace arrays; loadMore's push mutates a copied array below).
jest.mock('zustand/middleware/immer', () => ({
  immer:
    (initializer: (set: unknown, get: unknown, api: unknown) => unknown) =>
    (set: (fn: (s: object) => object) => void, get: unknown, api: unknown) =>
      initializer(
        (partial: unknown) =>
          set((state: object) => {
            if (typeof partial !== 'function') return { ...state, ...(partial as object) }
            const draft: Record<string, unknown> = { ...state }
            for (const [k, v] of Object.entries(draft)) if (Array.isArray(v)) draft[k] = [...v]
            const result: unknown = Reflect.apply(partial, undefined, [draft])
            return (result as object | undefined) ?? draft
          }),
        get,
        api
      )
}))

jest.mock('@/containers/Announcements/apiClients', () => ({
  getAnnouncementsApi: jest.fn(),
  getUnreadAnnouncementCountApi: jest.fn(),
  markAnnouncementReadApi: jest.fn(),
  markAllAnnouncementsReadApi: jest.fn(),
  DEFAULT_ANNOUNCEMENT_QUERY: {
    currentPage: 1,
    pageSize: 10,
    sortColumnName: 'CreatedAt',
    sortColumnDirection: 'DESC'
  }
}))

const mockAuth = { user: { id: 12, academyDomain: 'sample' } as { id: number; academyDomain?: string }, selectedAcademy: null }
jest.mock('@/store/useAuthStore', () => ({
  __esModule: true,
  default: { getState: () => mockAuth }
}))

const item = (id: number, isRead = false): AnnouncementResponse =>
  ({ id, isRead, type: 'WrongNoteReminder', extraData: '', createdAt: '', resourceId: '', resource: '' }) as AnnouncementResponse

const page = (items: AnnouncementResponse[], p = 1, totalPages = 2): { data: AnnouncementPage } => ({
  data: { page: p, limit: 10, totalItems: 20, totalPages, items }
})

const getList = getAnnouncementsApi as jest.Mock
const getUnread = getUnreadAnnouncementCountApi as jest.Mock
const markOne = markAnnouncementReadApi as jest.Mock
const markAll = markAllAnnouncementsReadApi as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.user = { id: 12, academyDomain: 'sample' }
  useAnnouncementStore.getState().reset()
  getUnread.mockResolvedValue({ data: 4 })
})

describe('useAnnouncementStore', () => {
  test('load() stores the first page and asks the server for that read filter', async () => {
    getList.mockResolvedValue(page([item(2), item(1)]))
    await useAnnouncementStore.getState().load(AnnouncementReadFilter.Unread)
    const s = useAnnouncementStore.getState()
    expect(s.items.map((i) => i.id)).toEqual([2, 1])
    expect(s.totalPages).toBe(2)
    expect(s.isLoaded).toBe(true)
    expect(s.readFilter).toBe(AnnouncementReadFilter.Unread)
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ currentPage: 1, pageSize: 10, isRead: false }))
  })

  test('loadMore() appends page 2 and stops at the last page', async () => {
    getList.mockResolvedValueOnce(page([item(2)])).mockResolvedValueOnce(page([item(1)], 2, 2))
    await useAnnouncementStore.getState().load()
    await useAnnouncementStore.getState().loadMore()
    expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ currentPage: 2 }))
    expect(useAnnouncementStore.getState().items.map((i) => i.id)).toEqual([2, 1])
    await useAnnouncementStore.getState().loadMore()
    expect(getList).toHaveBeenCalledTimes(2)
  })

  test('markRead() sets the item read and lowers the unread count', async () => {
    getList.mockResolvedValue(page([item(5)]))
    await useAnnouncementStore.getState().load()
    await useAnnouncementStore.getState().refreshUnread()
    markOne.mockResolvedValue({})
    await useAnnouncementStore.getState().markRead(5)
    expect(useAnnouncementStore.getState().items[0].isRead).toBe(true)
    expect(useAnnouncementStore.getState().unread).toBe(3)
  })

  test('M1: markRead() that loses the race (already read elsewhere) keeps the item read and re-reads the count', async () => {
    getList.mockResolvedValue(page([item(5)]))
    await useAnnouncementStore.getState().load()
    await useAnnouncementStore.getState().refreshUnread()
    markOne.mockRejectedValue(new Error('AnnouncementAlreadyRead'))
    getUnread.mockResolvedValue({ data: 2 })
    await expect(useAnnouncementStore.getState().markRead(5)).resolves.toBeUndefined()
    expect(useAnnouncementStore.getState().items[0].isRead).toBe(true)
    expect(useAnnouncementStore.getState().unread).toBe(2)
  })

  test('I4: under the Unread filter, markRead() takes the item out of the list', async () => {
    getList.mockResolvedValue(page([item(6), item(5)]))
    await useAnnouncementStore.getState().load(AnnouncementReadFilter.Unread)
    markOne.mockResolvedValue({})
    await useAnnouncementStore.getState().markRead(5)
    expect(useAnnouncementStore.getState().items.map((i) => i.id)).toEqual([6])
  })

  test('markAllRead() sets unread to 0', async () => {
    getList.mockResolvedValue(page([item(5)]))
    await useAnnouncementStore.getState().load()
    markAll.mockResolvedValue({})
    await useAnnouncementStore.getState().markAllRead()
    expect(useAnnouncementStore.getState().unread).toBe(0)
    expect(useAnnouncementStore.getState().items[0].isRead).toBe(true)
  })

  test('Review Focus 3: onReceived before the list was loaded only refreshes the count', async () => {
    useAnnouncementStore.getState().onReceived(item(9))
    await Promise.resolve()
    expect(useAnnouncementStore.getState().items).toEqual([])
    expect(getUnread).toHaveBeenCalled()
  })

  test('onReceived / onUpdated / onDeleted change a loaded list', async () => {
    getList.mockResolvedValue(page([item(1)]))
    await useAnnouncementStore.getState().load()
    useAnnouncementStore.getState().onReceived(item(2))
    useAnnouncementStore.getState().onUpdated(item(1, true))
    // The updated item moves to the top (M6).
    expect(useAnnouncementStore.getState().items.map((i) => [i.id, i.isRead])).toEqual([
      [1, true],
      [2, false]
    ])
    useAnnouncementStore.getState().onDeleted(item(2))
    expect(useAnnouncementStore.getState().items.map((i) => i.id)).toEqual([1])
  })

  test('requests are skipped without an academy', async () => {
    mockAuth.user = { id: 12 }
    await useAnnouncementStore.getState().load()
    await useAnnouncementStore.getState().refreshUnread()
    expect(getList).not.toHaveBeenCalled()
    expect(getUnread).not.toHaveBeenCalled()
  })

  test('M3: an unread count still in flight when the academy changes (reset) is dropped', async () => {
    let resolveOld: (v: { data: number }) => void = () => {}
    getUnread.mockReturnValueOnce(new Promise((r) => (resolveOld = r)))
    const pending = useAnnouncementStore.getState().refreshUnread()
    useAnnouncementStore.getState().reset()
    resolveOld({ data: 31 })
    await pending
    expect(useAnnouncementStore.getState().unread).toBe(0)
  })

  test('M4: a failed load ends loading with an error, and the next good load clears it', async () => {
    getList.mockRejectedValueOnce(new Error('offline'))
    await expect(useAnnouncementStore.getState().load()).rejects.toThrow('offline')
    expect(useAnnouncementStore.getState()).toEqual(expect.objectContaining({ isLoading: false, loadError: true }))
    getList.mockResolvedValue(page([item(1)]))
    await useAnnouncementStore.getState().load()
    expect(useAnnouncementStore.getState().loadError).toBe(false)
  })

  test('Review Focus 5: reset() clears the list and the count', async () => {
    getList.mockResolvedValue(page([item(1)]))
    await useAnnouncementStore.getState().load()
    await useAnnouncementStore.getState().refreshUnread()
    useAnnouncementStore.getState().reset()
    const s = useAnnouncementStore.getState()
    expect([s.unread, s.items, s.isLoaded]).toEqual([0, [], false])
  })
})
