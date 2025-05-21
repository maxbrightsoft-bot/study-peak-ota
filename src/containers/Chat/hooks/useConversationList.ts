import { useEffect, useRef, useState } from "react"
import { getListConversation } from "../apiClient/studentStatusService";
import { CONVERSATION_DEFAULT_FILTER, NEW_MESSAGE_CONVERSATIONS_EVENT, UNREAD_MESSAGE_COUNT_EVENT } from "../configs/constants";
import _ from "lodash"
import { getListCourseByStudentApi } from "../apiClient/examService";
import { Course } from "../configs/types";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { getErrorMessage, toast } from "@/utils/helpers";
import { ConversationFilter, ConversationsResponse } from "@/utils/types";
import { PusherChannel } from "@pusher/pusher-websocket-react-native";

const useConversationList = () => {
  const { user, setLoading, pusher, subscribeChannel, unsubscribeChannelSafe } = useAuthStore()
  const academyDomain = user?.academyDomain
  const channelName2 = useRef<string>();
  const channel2 = useRef<PusherChannel>();
  const [selectedConversation, setSelectedConversation] = useState<ConversationsResponse>();
  const [conversations, setConversations] = useState<ConversationsResponse[]>([])
  const [textSearch, setTextSearch] = useState("");
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>(CONVERSATION_DEFAULT_FILTER);
  const [courses, setCourses] = useState<Array<Course>>()
  const [isVisibleCreateConversationDialog, setVisibleCreateConversationDialog] = useState(false)
  const { t } = useTranslation()
  const inputSearch = useRef<any>(null);

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
    inputSearch.current = setTimeout(() => {
      getConversationList(value)
    }, 800);
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

  const cleanupPusher = () => {
    if (!pusher) return
    if (channelName2.current)
      unsubscribeChannelSafe(pusher, channelName2.current)

  };

  useEffect(() => {
    if (!user?.id || !user?.academyDomain) return
    getListCourseByStudent()
  }, [user?.id, user?.academyDomain])

  const handleListenerEvent = async () => {
    if (
      !pusher ||
      !academyDomain ||
      !selectedConversation?.id
    ) return
    channelName2.current = `conversations-channel-${user.id}-${academyDomain.trim().toUpperCase()}`;

    const messageHandlers = {
      [UNREAD_MESSAGE_COUNT_EVENT]: handleChangeUnreadMessagesConversationCount,
      [NEW_MESSAGE_CONVERSATIONS_EVENT]: handleNewMessageCount
    };

    channel2.current = await subscribeChannel(pusher, channelName2.current, Object.entries(messageHandlers).map(([eventName, handler]) => ({ eventName, handler })));
  }

  useEffect(() => {
    handleListenerEvent()

    return cleanupPusher;
  }, [selectedConversation?.id, user?.id, academyDomain, pusher]);

  useEffect(() => {
    getConversationList()
  }, [JSON.stringify(conversationFilter)])

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