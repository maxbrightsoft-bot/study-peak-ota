import { useCallback, useState } from 'react'
import { getListNotificationApi, getListNoteApi } from '../apiClients'
import { OrderBy, SortBy } from '../configs/constants'
import { Notification } from '@/utils/types'
import { getDataStorage, setDataStorage } from '@/utils/storage'
import { useFocusEffect } from '@react-navigation/native'
import moment from 'moment'

const LAST_READ_NOTICE_TIME = 'LAST_READ_NOTICE_TIME'

export const useHomeNotice = () => {
  const [recentNotice, setRecentNotice] = useState<Notification | undefined>(undefined)
  const [unreadNoticeCount, setUnreadNoticeCount] = useState<number>(0)
  const [openNoticeDialog, setOpenNoticeDialog] = useState<boolean>(false)

  const handleOpenNoticeDialog = async () => {
    setOpenNoticeDialog(true)
    setUnreadNoticeCount(0)
    await setDataStorage(LAST_READ_NOTICE_TIME, moment().toISOString())
  }

  const fetchNotices = useCallback(async () => {
    try {
      const res = await getListNotificationApi({
        sortColumnDirection: OrderBy.DESC,
        sortColumnName: SortBy.CreatedAt,
        pageSize: 10,
        currentPage: 1
      })
      let items: Notification[] = res.data?.items ?? []

      try {
        const noteRes = await getListNoteApi({
          sortColumnDirection: OrderBy.DESC,
          sortColumnName: SortBy.CreatedAt,
          pageSize: 5,
          currentPage: 1
        })
        const notes = noteRes.data?.items ?? []
        if (notes.length) {
          const mappedNotes = notes.map((i: any) => ({
            id: i.id,
            content: i.content,
            name: i.fullName || i.title || i.content,
            createdAt: i.createdAt ?? '',
            notificationTypes: []
          }))
          items = [...items, ...mappedNotes]
        }
      } catch (_noteErr) {
      }

      if (items.length > 0) {
        // Luôn sắp xếp từ mới nhất đến cũ nhất theo thời gian createdAt
        items.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf())
        setRecentNotice(items[0])
        const lastReadTime = await getDataStorage(LAST_READ_NOTICE_TIME)
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
  }, [])

  const handleCloseNoticeDialog = () => {
    setOpenNoticeDialog(false)
    fetchNotices()
  }

  useFocusEffect(
    useCallback(() => {
      fetchNotices()
    }, [fetchNotices])
  )

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
