// The student's inbox (GET me/messages), paged by 20, newest first. Read / reply update one message in place.
// A message opened from a push (focusMessageId) that is not on page 1 is fetched and pinned at the top, then read.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { getErrorMessage, toast } from '@/utils/helpers'
import {
  getMyMessageApi,
  getMyMessagesApi,
  readMyMessageApi,
  replyMyMessageApi
} from '../apiClients'
import { STUDY_TIMER_MY_MESSAGES_PAGE_SIZE } from '../configs/constants'
import { getErrorStatus } from '../configs/helpers'
import {
  StudyTimerMessageResponse,
  StudyTimerMessagesPage,
  StudyTimerMyReplyRequest
} from '../configs/types'

const mergeUnique = (base: StudyTimerMessageResponse[], more: StudyTimerMessageResponse[]) => {
  const ids = new Set(base.map((m) => m.id))
  return [...base, ...more.filter((m) => !ids.has(m.id))]
}

const useStudyTimerMyMessages = (focusMessageId?: number, enabled = true, refreshKey = 0) => {
  const { t } = useTranslation()
  const tRef = useRef(t)
  tRef.current = t

  const [items, setItems] = useState<StudyTimerMessageResponse[]>([])
  const [pinned, setPinned] = useState<StudyTimerMessageResponse>()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const pageRef = useRef(1)
  const requestId = useRef(0)
  const loadingMoreRef = useRef(false)
  const readingRef = useRef<Set<number>>(new Set())
  const itemsRef = useRef<StudyTimerMessageResponse[]>([])
  itemsRef.current = items
  const pinnedRef = useRef<StudyTimerMessageResponse | undefined>(undefined)
  pinnedRef.current = pinned
  const handledFocusRef = useRef<number | undefined>(undefined)

  const applyPage = (data: StudyTimerMessagesPage) => {
    setUnreadCount(data.unreadCount ?? 0)
    setHasMore(data.page < data.totalPages)
  }

  const reload = useCallback(async () => {
    const id = ++requestId.current
    try {
      const res = await getMyMessagesApi({
        currentPage: 1,
        pageSize: STUDY_TIMER_MY_MESSAGES_PAGE_SIZE,
        sortColumnDirection: 'desc'
      })
      if (id !== requestId.current) return
      const data: StudyTimerMessagesPage = res.data
      pageRef.current = 1
      setItems(data.items)
      applyPage(data)
    } catch (error) {
      if (id !== requestId.current) return
      toast.error(getErrorMessage(tRef.current, error))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) reload()
  }, [enabled, reload, refreshKey])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    const id = requestId.current
    try {
      const next = pageRef.current + 1
      const res = await getMyMessagesApi({
        currentPage: next,
        pageSize: STUDY_TIMER_MY_MESSAGES_PAGE_SIZE,
        sortColumnDirection: 'desc'
      })
      if (id !== requestId.current) return
      const data: StudyTimerMessagesPage = res.data
      pageRef.current = next
      setItems((prev) => mergeUnique(prev, data.items))
      applyPage(data)
    } catch (error) {
      toast.error(getErrorMessage(tRef.current, error))
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [hasMore])

  const patch = useCallback((updated: StudyTimerMessageResponse) => {
    setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    setPinned((p) => (p?.id === updated.id ? updated : p))
  }, [])

  const find = (id: number) =>
    itemsRef.current.find((m) => m.id === id) ??
    (pinnedRef.current?.id === id ? pinnedRef.current : undefined)

  // Optimistic + idempotent: one request per message; rolled back if the server refuses.
  const markRead = useCallback(
    async (id: number) => {
      const message = find(id)
      if (!message || message.readAt || readingRef.current.has(id)) return
      readingRef.current.add(id)
      const stamp = moment.utc().format('YYYY-MM-DDTHH:mm:ss')
      patch({ ...message, readAt: stamp })
      setUnreadCount((n) => Math.max(0, n - 1))
      try {
        const res = await readMyMessageApi(id)
        if (res?.data?.id === id) patch(res.data)
      } catch (error) {
        patch(message)
        setUnreadCount((n) => n + 1)
        toast.error(getErrorMessage(tRef.current, error))
        // 404: the message is gone, this copy is stale
        if (getErrorStatus(error) === 404) await reload()
      } finally {
        readingRef.current.delete(id)
      }
    },
    [patch, reload]
  )

  const reply = useCallback(
    async (id: number, body: StudyTimerMyReplyRequest) => {
      const wasUnread = !!find(id) && !find(id)?.readAt
      try {
        const res = await replyMyMessageApi(id, body)
        if (res?.data?.id === id) {
          patch(res.data)
          if (wasUnread) setUnreadCount((n) => Math.max(0, n - 1))
        } else await reload()
        toast.success(tRef.current('studytimer_my_toast_replied'))
        return true
      } catch (error) {
        toast.error(getErrorMessage(tRef.current, error))
        // 420 StudyTimerAlreadyReplied (answered elsewhere) / 404: this copy is stale
        const status = getErrorStatus(error)
        if (status === 420 || status === 404) await reload()
        return false
      }
    },
    [patch, reload]
  )

  // Notification target: on page 1 -> read it; otherwise fetch, pin at the top, read it.
  useEffect(() => {
    if (!enabled || !focusMessageId || loading) return
    if (handledFocusRef.current === focusMessageId) return
    handledFocusRef.current = focusMessageId
    if (itemsRef.current.some((m) => m.id === focusMessageId)) {
      markRead(focusMessageId)
      return
    }
    ;(async () => {
      try {
        const res = await getMyMessageApi(focusMessageId)
        setPinned(res.data)
        pinnedRef.current = res.data
        markRead(focusMessageId)
      } catch (error) {
        const status = getErrorStatus(error)
        if (status === 404) toast.info(tRef.current('studytimer_my_message_missing'))
        else if (status !== 403) toast.error(getErrorMessage(tRef.current, error))
      }
    })()
  }, [enabled, focusMessageId, loading, markRead])

  const shownPinned = pinned && !items.some((m) => m.id === pinned.id) ? pinned : undefined

  return {
    items: shownPinned ? [shownPinned, ...items] : items,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    markRead,
    reply,
    reload
  }
}

export default useStudyTimerMyMessages
