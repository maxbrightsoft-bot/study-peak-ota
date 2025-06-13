import { useCallback, useEffect, useRef, useState } from "react"
import { EVENT_DELETED_STUDENT_NOTE, EVENT_DELETED_STUDENT_NOTIFICATION, EVENT_NEW_STUDENT_NOTE, EVENT_NEW_STUDENT_NOTIFICATION, EVENT_UPDATED_STUDENT_NOTE, EVENT_UPDATED_STUDENT_NOTIFICATION, OrderBy, SortBy, studentNoteEvents, studentNotificationEvents, TabList, TypeNotificationEnum } from "../configs/constants"
import { getListNoteApi, getListNotificationApi } from "../apiClients"
import { Notification } from "@/utils/types"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import moment from "moment"
import { PusherChannel } from "@pusher/pusher-websocket-react-native"
import { useTranslation } from "react-i18next"
import { NoteResponse } from "@/utils/types/note"
import { useFocusEffect } from "@react-navigation/native"

const filterDefault = {
  sortColumnDirection: OrderBy.DESC,
  sortColumnName: SortBy.CreatedAt,
  pageSize: 5,
  currentPage: 1,
}
const useNotice = (setNew: any) => {
  const { selectedAcademy, user, pusher, subscribeChannel, unsubscribeChannelSafe } = useAuthStore()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState(TabList[0].value)
  const [typeSelected, setTypeSelected] = useState(TabList[0].type)
  const [notifications, setNotifications] = useState<Array<Notification> | null>(null)
  const userId = user?.id
  const { t } = useTranslation()
  const channel = useRef<PusherChannel>()
  const notiChannel = useRef<PusherChannel>()
  const generalNotiChannel = useRef<PusherChannel>()
  const channelName = useRef<string>();
  const notificationChannelName = useRef<string>();
  const generalNotificationChannelName = useRef<string>();

  const handleGetListNotification = async (type: number[]) => {
    setLoading(true)
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
          notificationTypes: []
        }))
        notices = ([...notes, ...notices]).sort((a, b) => moment(a.createdAt).isBefore(moment(b.createdAt)) ? 1 : -1);
      }
      setNotifications(notices)
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const handleChangeTab = (newValue: number, type: number[]) => {
    setNew((state: any) => ({
      ...state,
      [selected]: undefined
    }))
    setSelected(newValue);
    setTypeSelected(type)
  };

  useFocusEffect(
    useCallback(() => {
      handleGetListNotification(typeSelected)
      return () => {
        handleChangeTab(TabList[0].value, TabList[0].type)
      };
    }, [])
  );

  const handleNoteReceived = (data: string) => {
    try {
      const receivedData: NoteResponse = JSON.parse(data)
      setNew((state: any) => ({
        ...state,
        [2]: true
      }))
      if (typeSelected.includes(TypeNotificationEnum.Student)) {
        setNotifications((state) => {
          const noteData = {
            id: receivedData.id,
            content: receivedData.content,
            name: receivedData.fullName,
            createdAt: receivedData.createdAt ?? "",
            notificationTypes: []
          }
          if (state === null) return [noteData]
          return [noteData, ...state]
        })
      }
    } catch (_error) {
    }
  }
  const handleNotificationReceived = (data: string) => {
    try {

      const receivedData: Notification = JSON.parse(data)
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
  const handleNoteUpdated = (data: string) => {
    try {
      const receivedData: NoteResponse = JSON.parse(data)

      if (typeSelected.includes(TypeNotificationEnum.Student)) {
        setNotifications((state) => {
          if (state === null) return []
          return state.map(i => {
            if (i.type === undefined && i.id === receivedData.id)
              return ({
                ...i,
                content: receivedData.content,
                name: receivedData.fullName
              })
            return i
          })
        })
      }
    } catch (_error) {
    }
  }
  const handleNotificationUpdated = (data: string) => {
    try {
      const receivedData: Notification = JSON.parse(data)
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
      const receivedData: Notification = JSON.parse(data)
      const type = (receivedData.type ?? 0) - 1
      if (type == selected) {
        handleGetListNotification(typeSelected)
      }
    } catch (_error) {
    }
  }
  useEffect(() => {
    handleGetListNotification(typeSelected)
  }, [JSON.stringify(typeSelected), selectedAcademy?.id])

  const handleListenerEvent = async () => {
    try {
      if (!selectedAcademy?.domain || !userId || !pusher) return
      cleanupPusher()

      channelName.current = `NOTES-${selectedAcademy.domain.trim().toUpperCase()}-${userId}-CHANNEL`
      notificationChannelName.current = `NOTIFICATIONS-${selectedAcademy.domain.trim().toUpperCase()}-${userId}-CHANNEL`
      generalNotificationChannelName.current = `NOTIFICATIONS-${selectedAcademy.domain.trim().toUpperCase()}-GENERAL-CHANNEL`

      const noteHandlers = {
        [EVENT_NEW_STUDENT_NOTE]: handleNoteReceived,
        [EVENT_UPDATED_STUDENT_NOTE]: handleNoteUpdated,
        [EVENT_DELETED_STUDENT_NOTE]: handleNoteDeleted,
      };

      const notificationHandlers = {
        [EVENT_NEW_STUDENT_NOTIFICATION]: handleNotificationReceived,
        [EVENT_UPDATED_STUDENT_NOTIFICATION]: handleNotificationUpdated,
        [EVENT_DELETED_STUDENT_NOTIFICATION]: handleNotificationDeleted,
      };

      channel.current = await subscribeChannel(pusher, channelName.current, Object.entries(noteHandlers).map(([eventName, handler]) => ({ eventName, handler })));

      notiChannel.current = await subscribeChannel(pusher, notificationChannelName.current, Object.entries(notificationHandlers).map(([eventName, handler]) => ({ eventName, handler })));

      generalNotiChannel.current = await subscribeChannel(pusher, generalNotificationChannelName.current, Object.entries(notificationHandlers).map(([eventName, handler]) => ({ eventName, handler })));
    } catch (err) {
      console.error("Pusher subscription failed", err);
    }
  }

  const cleanupPusher = () => {
    if (!pusher) return
    if (channelName.current) {
      unsubscribeChannelSafe(pusher, channelName.current)
    }
    if (notificationChannelName.current) {
      unsubscribeChannelSafe(pusher, notificationChannelName.current)
    }

    if (generalNotificationChannelName.current) {
      unsubscribeChannelSafe(pusher, generalNotificationChannelName.current)
    }
  }

  useEffect(() => {
    if (!pusher) return
    const initPusher = async () => {
      await handleListenerEvent();
    };

    initPusher()
    return cleanupPusher
  }, [userId, selectedAcademy?.domain, typeSelected, selected, pusher])

  return {
    t,
    isLoading,
    selected,
    notifications,
    handleChangeTab
  }
}

export default useNotice