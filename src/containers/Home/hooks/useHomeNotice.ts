import { useCallback, useEffect, useState } from 'react'
import { getListNotificationApi } from '../apiClients'
import { OrderBy, SortBy } from '../configs/constants'
import { Notification } from '@/utils/types'
import { getDataStorage, setDataStorage } from '@/utils/storage'
import { useFocusEffect } from '@react-navigation/native'
import useAuthStore from '@/store/useAuthStore'
import moment from 'moment'

const LAST_READ_NOTICE_TIME_PREFIX = 'LAST_READ_NOTICE_TIME'

export const useHomeNotice = () => {
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const user = useAuthStore(state => state.user)

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
      const res = await getListNotificationApi({
        sortColumnDirection: OrderBy.DESC,
        sortColumnName: SortBy.CreatedAt,
        pageSize: 20,
        currentPage: 1
      })
      const items: Notification[] = res.data?.items ?? []

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

  // Tải lại khi thay đổi academy
  useEffect(() => {
    fetchNotices()
  }, [selectedAcademy?.id, selectedAcademy?.domain, user?.academyDomain, fetchNotices])

  // Tải lại khi quay lại màn Home
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
