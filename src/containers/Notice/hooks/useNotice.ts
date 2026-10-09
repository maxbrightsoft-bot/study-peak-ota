import { getListNoteApi, getListNotificationApi } from "@/containers/Home/apiClients"
import { SortBy, TypeNotificationEnum } from "@/containers/Home/configs/constants"
import useAuthStore from "@/store/useAuthStore"
import { OrderBy } from "@/utils/enums"
import { getErrorMessage, parseEventData, toast } from "@/utils/helpers"
import { PusherChannel } from "@pusher/pusher-websocket-react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Notification, StudentNoteEvent, StudentNotificationEvent } from "../configs/types"
import { TabList } from "../configs/constants"
import { NoteResponse } from "@/utils/types"
import { setDataStorage } from "@/utils/storage"
import moment from "moment"

const useNotice = (setNew: any, open?: boolean) => {
  const { pusher, setLoading, user, selectedAcademy, subscribeChannel, unsubscribeChannelSafe } = useAuthStore()
  const userId = user?.id
  const [notifications, setNotifications] = useState<Array<Notification> | null>(null)
  const academyDomain = (selectedAcademy?.domain || user?.academyDomain)?.trim()?.toUpperCase()
  const { t } = useTranslation()
  const [selected, setSelected] = useState(TabList[0].value)
  const [typeSelected, setTypeSelected] = useState(TabList[0].type)
  const channel = useRef<PusherChannel | undefined>(undefined)
  const channelName = useRef<string | undefined>(undefined)
  const notifyChannel = useRef<PusherChannel | undefined>(undefined)
  const notifyChannelName = useRef<string | undefined>(undefined)
  const generalNotifyChannel = useRef<PusherChannel | undefined>(undefined)
  const generalNotifyChannelName = useRef<string | undefined>(undefined)
  const [openNoticeDetailDialog, setOpenNoticeDetailDialog] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const handleOpenDetailDialog = (notification: Notification) => {
    setSelectedNotification(notification)
    setOpenNoticeDetailDialog(true)
  }

  const handleCloseDetailDialog = () => {
    setSelectedNotification(null)
    setOpenNoticeDetailDialog(false)
  }

  const filterDefault = {
    sortColumnDirection: OrderBy.DESC,
    sortColumnName: SortBy.CreatedAt,
    pageSize: 5,
    currentPage: 1,
  }

  const handleChangeTab = (newValue: number, type: number[]) => {
    setNew((state: any) => ({
      ...state,
      [selected]: undefined
    }))
    setSelected(newValue);
    setTypeSelected(type)
    handleGetListNotification(type)
  };


  const handleGetListNotification = async (type: number[]) => {
    setLoading(true)
    setNotifications([])
    try {
      const res = await getListNotificationApi({ ...filterDefault, type });
      let notices: Notification[] = res.data?.items ?? []

      if (type.includes(TypeNotificationEnum.Student)) {
        const noteResult = await getListNoteApi({ ...filterDefault });
        const noteItems: NoteResponse[] = noteResult.data?.items ?? []
        const notes: Notification[] = noteItems.map(i => ({
          id: i.id,
          content: i.content,
          name: i.fullName,
          createdAt: i.createdAt ?? "",
          notificationTypes: [],
          isNote: true
        }))
        notices = ([...notes, ...notices]).sort((a, b) => moment(a.createdAt).isBefore(moment(b.createdAt)) ? 1 : -1);
      }

      setNotifications(notices)
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const handleNoteReceived = (data: any) => {
    try {
      const receivedData = parseEventData<NoteResponse>(data)
      if (!receivedData) return
      setNew((state: any) => ({
        ...state,
        [2]: true
      }))
      if (typeSelected.includes(TypeNotificationEnum.Student)) {
        setNotifications((state) => {
          const noteData: Notification = {
            id: receivedData.id,
            content: receivedData.content,
            name: receivedData.fullName,
            createdAt: receivedData.createdAt ?? "",
            notificationTypes: [],
            isNote: true
          }
          if (state === null) return [noteData]
          return [noteData, ...state]
        })
      }
    } catch (_error) {
    }
  }

  const handleNotificationReceived = (data: any) => {
    try {
      const receivedData = parseEventData<Notification>(data)
      if (!receivedData) return
      const type = (receivedData.type ?? 0) - 1
      setNew((state: any) => ({
        ...state,
        [type]: true
      }))
      if (type === selected) {
        setNotifications((state) => {
          if (state === null) return [receivedData]
          return [receivedData, ...state]
        })
      }
    } catch (_error) {
    }
  }

  const handleNoteUpdated = (data: any) => {
    try {
      const receivedData = parseEventData<NoteResponse>(data)
      if (!receivedData) return

      if (typeSelected.includes(TypeNotificationEnum.Student)) {
        setNotifications((state) => {
          if (state === null) return []
          return state.map(i => {
            if ((i.type === undefined || i.isNote) && i.id === receivedData.id)
              return ({
                ...i,
                content: receivedData.content,
                name: receivedData.fullName,
                isNote: true
              })
            return i
          })
        })
      }
    } catch (_error) {
    }
  }

  const handleNotificationUpdated = (data: any) => {
    try {
      const receivedData = parseEventData<Notification>(data)
      if (!receivedData) return
      const type = (receivedData.type ?? 0) - 1
      if (type === selected) {
        setNotifications((state) => {
          if (state === null) return []
          return state.map(i => {
            if (i.type !== undefined && i.id === receivedData.id)
              return receivedData
            return i
          })
        })
      }
    } catch (_error) {
    }
  }

  const handleNoteDeleted = () => {
    if (typeSelected.includes(TypeNotificationEnum.Student)) {
      handleGetListNotification(typeSelected)
    }
  }

  const handleNotificationDeleted = (data: any) => {
    try {
      const receivedData = parseEventData<Notification>(data)
      const type = ((receivedData?.type ?? 0) - 1)
      if (type == selected) {
        handleGetListNotification(typeSelected)
      }
    } catch (_error) {
    }
  }

  useEffect(() => {
    if (open && (userId || academyDomain)) {
      handleGetListNotification(typeSelected)
      const academyKey = selectedAcademy?.id || academyDomain || user?.academyDomain || 'default'
      setDataStorage(`LAST_READ_NOTICE_TIME_${userId || ''}_${academyKey}`, moment().toISOString())
    }
  }, [open])

  useEffect(() => {
    if (!userId || !academyDomain) return
    handleGetListNotification(typeSelected)
  }, [selectedAcademy?.id, academyDomain])

  useFocusEffect(
    useCallback(() => {
      if (!userId || !academyDomain) return
      handleGetListNotification(typeSelected)
    }, [selectedAcademy?.id, userId, academyDomain])
  );

  const noteHandlersRef = useRef<{ [event: string]: (data: any) => void }>({})
  const notificationHandlersRef = useRef<{ [event: string]: (data: any) => void }>({})

  noteHandlersRef.current = {
    [StudentNoteEvent.New]: handleNoteReceived,
    [StudentNoteEvent.Updated]: handleNoteUpdated,
    [StudentNoteEvent.Deleted]: handleNoteDeleted
  }

  notificationHandlersRef.current = {
    [StudentNotificationEvent.New]: handleNotificationReceived,
    [StudentNotificationEvent.Updated]: handleNotificationUpdated,
    [StudentNotificationEvent.Deleted]: handleNotificationDeleted
  }

  const handleListenerEvent = async () => {
    try {
      if (!pusher || !userId || !academyDomain) return;
      channelName.current = `NOTES-${academyDomain}-${userId}-CHANNEL`
      notifyChannelName.current = `NOTIFICATIONS-${academyDomain}-${userId}-CHANNEL`
      generalNotifyChannelName.current = `NOTIFICATIONS-${academyDomain}-GENERAL-CHANNEL`

      channel.current = await subscribeChannel(
        pusher,
        channelName.current,
        () => Object.entries(noteHandlersRef.current).map(([eventName, handler]) => ({
          eventName,
          handler
        }))
      )

      notifyChannel.current = await subscribeChannel(
        pusher,
        notifyChannelName.current,
        () => Object.entries(notificationHandlersRef.current).map(([eventName, handler]) => ({
          eventName,
          handler
        }))
      )

      generalNotifyChannel.current = await subscribeChannel(
        pusher,
        generalNotifyChannelName.current,
        () => Object.entries(notificationHandlersRef.current).map(([eventName, handler]) => ({
          eventName,
          handler
        }))
      )

    } catch (err) {
      console.error("Pusher subscription failed", err);
    }
  };

  const cleanupPusher = () => {

    if (channelName.current && pusher) {
      const channelNameText = channelName.current;
      unsubscribeChannelSafe(pusher, channelNameText);
    }

    if (notifyChannelName.current && pusher) {
      const channelNameText = notifyChannelName.current;
      unsubscribeChannelSafe(pusher, channelNameText);
    }

    if (generalNotifyChannelName.current && pusher) {
      const channelNameText = generalNotifyChannelName.current;
      unsubscribeChannelSafe(pusher, channelNameText);
    }

    channel.current = undefined;
    notifyChannel.current = undefined;
    generalNotifyChannel.current = undefined;
  };

  useEffect(() => {
    let isActive = true;

    const initPusher = async () => {
      if (!isActive) return;
      await handleListenerEvent();
    };

    initPusher();

    return () => {
      isActive = false;
      cleanupPusher()
    }
  }, [academyDomain, pusher, userId]);

  return { t, selected, handleChangeTab, selectedNotification, notifications, openNoticeDetailDialog, handleOpenDetailDialog, handleCloseDetailDialog }

}

export default useNotice