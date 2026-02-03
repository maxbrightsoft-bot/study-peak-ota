import { useCallback, useEffect, useRef, useState } from "react"
import { getListConversation } from "../apiClient/studentStatusService";
import { CONVERSATION_DEFAULT_FILTER } from "../configs/constants";
import _ from "lodash"
import { getListCourseByStudentApi } from "../apiClient/examService";
import { Course } from "../configs/types";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { getErrorMessage, toast } from "@/utils/helpers";
import { ConversationFilter, ConversationsResponse } from "@/utils/types";
import { useFocusEffect } from "@react-navigation/native";
import { getSocket } from "@/services";

const useConversationList = () => {
  const { user, setLoading, selectedAcademy } = useAuthStore()
  const academyDomain = user?.academyDomain
  const channel1 = useRef('')
  const channel2 = useRef('')
  const [selectedConversation, setSelectedConversation] = useState<ConversationsResponse>();
  const [conversations, setConversations] = useState<ConversationsResponse[]>([])
  const [textSearch, setTextSearch] = useState("");
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>(CONVERSATION_DEFAULT_FILTER);
  const [courses, setCourses] = useState<Array<Course>>()
  const [isVisibleCreateConversationDialog, setVisibleCreateConversationDialog] = useState(false)
  const { t } = useTranslation()
  const inputSearch = useRef<any>(null);
  const socket = getSocket()

  const handleChangeSelectedConversation = (val: ConversationsResponse) => {
    setSelectedConversation(val)
    setConversations(conversations.map(i => ({ ...i, totalUnReadMessage: i.id === val.id ? 0 : i.totalUnReadMessage })))
  }

  const handleVisibleCreateConversationDialog = () => {
    setVisibleCreateConversationDialog(true)
  }

  const handleCloseCreateConversationDialog = () => {
    setVisibleCreateConversationDialog(false)
  }

  const handleChangeFilter = (filter: ConversationFilter) => {
    setConversationFilter((state: ConversationFilter) => ({
      ...state,
      ...filter
    }))
  }

  const getConversationList = async (textSearch?: string) => {
    setLoading(true)
    try {
      const res = await getListConversation({ ...conversationFilter, textSearch })
      setConversations(res.data.items || [])

    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const handleChangeUnreadMessagesConversationCount = (data: string) => {
    const conversationCount: any = JSON.parse(data)
    setConversations((conversations) => conversations.map(i => ({ ...i, totalUnReadMessage: conversationCount.conversationId === i.id ? conversationCount.totalUnReadMessage : i.totalUnReadMessage })))
  }

  const handleNewMessageCount = (data: string) => {
    const conversationCount: any = JSON.parse(data)
    setConversations((conversations) => conversations.map(i => ({ ...i, totalUnReadMessage: conversationCount.conversationId === i.id ? conversationCount.totalUnReadMessage : i.totalUnReadMessage })))
  }

  const handleChangeTextSearch = (value: string) => {
    setTextSearch(value);

    if (!!inputSearch.current) {
      clearTimeout(inputSearch.current);
    }
    inputSearch.current = setTimeout(async() => {
      await getConversationList(value)
    }, 500);
  };

  const getListCourseByStudent = async () => {
    setLoading(true)
    try {
      const res = await getListCourseByStudentApi({ studentId: user?.id || 0 })
      setCourses(res.data.items || [])

    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const handleCompletedConversation = (data: string) => {
    if (!data) return
    const item = JSON.parse(data)
    setConversations((prev) => prev.map((conversation) => {
      if (conversation.id === item.id) return item
      return conversation
    }))
  }

  useEffect(() => {
    if (!user?.id || !user?.academyDomain) return
    getListCourseByStudent()
  }, [user?.id, user?.academyDomain])

  useEffect(() => {
    if (
      academyDomain && socket
    ) {
      channel1.current = `presence-conversation-channel-${selectedConversation?.id}-${academyDomain.trim().toUpperCase()}`
      channel2.current = `conversations-channel-${user.id}-${academyDomain.trim().toUpperCase()}`
      socket.emit('subscribe', channel1.current);
      socket.emit('subscribe', channel2.current);
      socket.on("completed-conversation-event", handleCompletedConversation);
      socket.on("unread-messages-count-event", handleChangeUnreadMessagesConversationCount);
      socket.on("new-message-conversations-event", handleNewMessageCount);
    }
    return () => {
      socket?.emit('unsubscribe', channel1.current);
      socket?.emit('unsubscribe', channel2.current);
      socket?.off("completed-conversation-event", handleCompletedConversation);
      socket?.off("unread-messages-count-event", handleChangeUnreadMessagesConversationCount);
      socket?.off("new-message-conversations-event", handleNewMessageCount);
    };
  }, [selectedConversation?.id, academyDomain, user?.id, socket?.id]);

  useFocusEffect(
    useCallback(() => {
      getConversationList()
      return () => {
        setSelectedConversation(undefined)
        setTextSearch('')
      };
    }, [])
  );

  useEffect(() => {
    getConversationList()
  }, [JSON.stringify(conversationFilter), selectedAcademy?.id])

  return {
    t,
    user,
    courses,
    conversationFilter,
    selectedConversation,
    conversations,
    handleChangeFilter,
    handleCompletedConversation,
    textSearch,
    handleChangeSelectedConversation,
    handleChangeTextSearch,
    setSelectedConversation,
    getConversationList,
    isVisibleCreateConversationDialog,
    handleCloseCreateConversationDialog,
    handleVisibleCreateConversationDialog,

  }
}

export default useConversationList