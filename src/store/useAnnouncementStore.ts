import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import useAuthStore from '@/store/useAuthStore'
import {
  DEFAULT_ANNOUNCEMENT_QUERY,
  getAnnouncementsApi,
  getUnreadAnnouncementCountApi,
  markAllAnnouncementsReadApi,
  markAnnouncementReadApi
} from '@/containers/Announcements/apiClients'
import { AnnouncementReadFilter } from '@/containers/Announcements/configs/enums'
import {
  applyDeleted,
  applyReceived,
  applyUpdated,
  markAllItemsRead,
  markItemRead
} from '@/containers/Announcements/configs/listState'
import { AnnouncementResponse } from '@/containers/Announcements/configs/types'

interface AnnouncementState {
  items: AnnouncementResponse[]
  page: number
  totalPages: number
  readFilter: AnnouncementReadFilter
  unread: number
  isLoading: boolean
  /** True once the list was fetched; realtime events only edit a loaded list. */
  isLoaded: boolean
  /** The last load() failed (the list shows a retry state instead of a spinner). */
  loadError: boolean
}

interface AnnouncementActions {
  load: (filter?: AnnouncementReadFilter) => Promise<void>
  loadMore: () => Promise<void>
  refreshUnread: () => Promise<void>
  /** Optimistic; never throws. On failure (usually already read elsewhere) the count is re-read from the server. */
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  onReceived: (a: AnnouncementResponse) => void
  onUpdated: (a: AnnouncementResponse) => void
  onDeleted: (a: AnnouncementResponse) => void
  reset: () => void
}

type AnnouncementStore = AnnouncementState & AnnouncementActions

const initialState: AnnouncementState = {
  items: [],
  page: 0,
  totalPages: 0,
  readFilter: AnnouncementReadFilter.All,
  unread: 0,
  isLoading: false,
  isLoaded: false,
  loadError: false
}

const hasAcademy = () => {
  const { user, selectedAcademy } = useAuthStore.getState()
  return !!(selectedAcademy?.domain || user?.academyDomain) && !!user?.id
}

const isReadParam = (filter: AnnouncementReadFilter): boolean | undefined =>
  filter === AnnouncementReadFilter.All ? undefined : filter === AnnouncementReadFilter.Read

// Bumped by load() and reset(): a response from an older request (other filter / academy) is dropped.
let listVersion = 0
// Bumped by reset() only (academy switch / logout): drops an unread count of the previous academy.
let sessionVersion = 0

const useAnnouncementStore = create<AnnouncementStore>()(
  immer((set, get) => ({
    ...initialState,

    load: async (filter) => {
      if (!hasAcademy()) return
      const readFilter = filter ?? get().readFilter
      const id = ++listVersion
      set((state) => {
        state.readFilter = readFilter
        state.isLoading = true
        state.loadError = false
      })
      try {
        const { data } = await getAnnouncementsApi({
          ...DEFAULT_ANNOUNCEMENT_QUERY,
          currentPage: 1,
          isRead: isReadParam(readFilter)
        })
        if (id !== listVersion) return
        set((state) => {
          state.items = data.items ?? []
          state.page = data.page || 1
          state.totalPages = data.totalPages ?? 0
          state.isLoaded = true
        })
      } catch (error) {
        if (id === listVersion)
          set((state) => {
            state.loadError = true
          })
        throw error
      } finally {
        if (id === listVersion)
          set((state) => {
            state.isLoading = false
          })
      }
    },

    loadMore: async () => {
      const { isLoading, page, totalPages, readFilter } = get()
      if (isLoading || page >= totalPages || !hasAcademy()) return
      const id = listVersion
      set((state) => {
        state.isLoading = true
      })
      try {
        const { data } = await getAnnouncementsApi({
          ...DEFAULT_ANNOUNCEMENT_QUERY,
          currentPage: page + 1,
          isRead: isReadParam(readFilter)
        })
        if (id !== listVersion) return
        set((state) => {
          const known = new Set(state.items.map((i) => i.id))
          state.items.push(...(data.items ?? []).filter((i) => !known.has(i.id)))
          state.page = data.page || page + 1
          state.totalPages = data.totalPages ?? state.totalPages
        })
      } finally {
        if (id === listVersion)
          set((state) => {
            state.isLoading = false
          })
      }
    },

    refreshUnread: async () => {
      if (!hasAcademy()) return
      const session = sessionVersion
      try {
        const { data } = await getUnreadAnnouncementCountApi()
        if (session !== sessionVersion) return
        set((state) => {
          state.unread = Math.max(0, Number(data) || 0)
        })
      } catch {
        // keep the previous count
      }
    },

    markRead: async (id) => {
      const target = get().items.find((i) => i.id === id)
      const wasUnread = !target || !target.isRead
      set((state) => {
        // Under Unread a read item leaves the list (the backend sends no push for your own reads).
        state.items =
          state.readFilter === AnnouncementReadFilter.Unread
            ? applyDeleted(state.items, id)
            : markItemRead(state.items, id)
        if (wasUnread) state.unread = Math.max(0, state.unread - 1)
      })
      try {
        await markAnnouncementReadApi(id)
      } catch {
        // Usually AnnouncementAlreadyRead: the Study Timer screen (or another device) read it first.
        // The item is read either way; take the count from the server.
        await get().refreshUnread()
      }
    },

    markAllRead: async () => {
      await markAllAnnouncementsReadApi()
      set((state) => {
        state.items = markAllItemsRead(state.items, state.readFilter)
        state.unread = 0
      })
    },

    onReceived: (a) => {
      if (get().isLoaded)
        set((state) => {
          state.items = applyReceived(state.items, a, state.readFilter)
        })
      void get().refreshUnread()
    },

    onUpdated: (a) => {
      if (get().isLoaded)
        set((state) => {
          state.items = applyUpdated(state.items, a, state.readFilter)
        })
      void get().refreshUnread()
    },

    onDeleted: (a) => {
      if (get().isLoaded)
        set((state) => {
          state.items = applyDeleted(state.items, a.id)
        })
      void get().refreshUnread()
    },

    reset: () => {
      listVersion++
      sessionVersion++
      set(() => ({ ...initialState }))
    }
  }))
)

export default useAnnouncementStore
