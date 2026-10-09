import { getListNoteApi, getListNotificationApi } from '../apiClients'
import { OrderBy, SortBy } from '../configs/constants'
import { Notification, NoteResponse } from '@/utils/types'
import { getDataStorage, setDataStorage } from '@/utils/storage'
import { useFocusEffect } from '@react-navigation/native'
import useAuthStore from '@/store/useAuthStore'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

const LAST_READ_NOTICE_TIME_PREFIX = 'LAST_READ_NOTICE_TIME'

export const useHomeNotice = () => {
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const user = useAuthStore(state => state.user)
  const pusher = useAuthStore(state => state.pusher)
  const subscribeChannel = useAuthStore(state => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore(state => state.unsubscribeChannelSafe)

  const [recentNotice, setRecentNotice] = useState<Notification | undefined>(undefined)
  const [unreadNoticeCount, setUnreadNoticeCount] = useState<number>(0)
  const [openNoticeDialog, setOpenNoticeDialog] = useState<boolean>(false)

  const getNoticeStorageKey = useCallback(() => {
    const academyKey = selectedAcademy?.id || selectedAcademy?.domain || user?.academyDomain || 'default'
    return `${LAST_READ_NOTICE_TIME_PREFIX}_${user?.id || ''}_${academyKey}`
  }, [selectedAcademy?.id, selectedAcademy?.domain, user?.id, user?.academyDomain])

  const handleOpenNoticeDialog = async () => {
    setOpenNoticeDialog(true)
    setUnreadNoticeCount(0)
    await setDataStorage(getNoticeStorageKey(), moment().toISOString())
  }

  const fetchNotices = useCallback(async () => {
    const hasAcademy = !!(user?.academyDomain || selectedAcademy?.domain)
    if (!hasAcademy) {
      setRecentNotice(undefined)
      setUnreadNoticeCount(0)
      return
    }

    try {
      const [noticesRes, notesRes] = await Promise.allSettled([
        getListNotificationApi({
          sortColumnDirection: OrderBy.DESC,
          sortColumnName: SortBy.CreatedAt,
          pageSize: 20,
          currentPage: 1
        }),
        getListNoteApi({
          sortColumnDirection: OrderBy.DESC,
          sortColumnName: SortBy.CreatedAt,
          pageSize: 20,
          currentPage: 1
        })
      ])

      const notiItems: Notification[] =
        noticesRes.status === 'fulfilled' ? (noticesRes.value.data?.items ?? []) : []

      const noteRawItems: NoteResponse[] =
        notesRes.status === 'fulfilled' ? (notesRes.value.data?.items ?? []) : []

      const noteItems: Notification[] = noteRawItems.map(i => ({
        id: i.id,
        content: i.content,
        name: i.fullName,
        createdAt: i.createdAt ?? "",
        notificationTypes: [],
        isNote: true
      }))

      const items: Notification[] = [...notiItems, ...noteItems]

      if (items.length > 0) {
        // Luôn sắp xếp từ mới nhất đến cũ nhất theo thời gian createdAt
        items.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf())
        setRecentNotice(items[0])
        const lastReadTime = await getDataStorage(getNoticeStorageKey())
        let unread = 0
        if (lastReadTime) {
          unread = items.filter(n => moment(n.createdAt).isAfter(moment(lastReadTime))).length
        } else {
          unread = items.length
        }
        setUnreadNoticeCount(unread)
      } else {
        setRecentNotice(undefined)
        setUnreadNoticeCount(0)
      }
    } catch (_error) {
      setRecentNotice(undefined)
      setUnreadNoticeCount(0)
    }
  }, [getNoticeStorageKey, selectedAcademy?.domain, user?.academyDomain])

  const handleCloseNoticeDialog = () => {
    setOpenNoticeDialog(false)
    fetchNotices()
  }

  useEffect(() => {
    fetchNotices()
  }, [selectedAcademy?.id, selectedAcademy?.domain, user?.academyDomain, fetchNotices])

  useFocusEffect(
    useCallback(() => {
      fetchNotices()
    }, [fetchNotices])
  )

  useEffect(() => {
    const domain = (selectedAcademy?.domain || user?.academyDomain)?.trim()?.toUpperCase()
    const userId = user?.id
    if (!domain || !userId || !pusher) return

    const notesChannelName = `NOTES-${domain}-${userId}-CHANNEL`
    const notifyChannelName = `NOTIFICATIONS-${domain}-${userId}-CHANNEL`
    const generalNotifyChannelName = `NOTIFICATIONS-${domain}-GENERAL-CHANNEL`

    const getHandlers = () => [
      { eventName: 'new-student-notification-event', handler: () => fetchNotices() },
      { eventName: 'updated-student-notification-event', handler: () => fetchNotices() },
      { eventName: 'deleted-student-notification-event', handler: () => fetchNotices() },
      { eventName: 'new-student-note-event', handler: () => fetchNotices() },
      { eventName: 'updated-student-note-event', handler: () => fetchNotices() },
      { eventName: 'deleted-student-note-event', handler: () => fetchNotices() },
    ]

    subscribeChannel(pusher, notesChannelName, getHandlers)
    subscribeChannel(pusher, notifyChannelName, getHandlers)
    subscribeChannel(pusher, generalNotifyChannelName, getHandlers)

    return () => {
      unsubscribeChannelSafe(pusher, notesChannelName, getHandlers)
      unsubscribeChannelSafe(pusher, notifyChannelName, getHandlers)
      unsubscribeChannelSafe(pusher, generalNotifyChannelName, getHandlers)
    }
  }, [selectedAcademy?.domain, user?.academyDomain, user?.id, pusher, fetchNotices])

  return {
    recentNotice,
    unreadNoticeCount,
    openNoticeDialog,
    handleOpenNoticeDialog,
    handleCloseNoticeDialog,
    fetchNotices
  }
}

export default useHomeNotice
