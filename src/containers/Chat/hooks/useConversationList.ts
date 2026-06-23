import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getListConversation } from "../apiClient/studentStatusService";
import { CONVERSATION_DEFAULT_FILTER, TabList } from "../configs/constants";
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
  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const academyDomain = user?.academyDomain
  const channel1 = useRef('')
  const channel2 = useRef('')
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef<string>("");
  const [selectedConversation, setSelectedConversation] = useState<ConversationsResponse>();
  const [conversations, setConversations] = useState<ConversationsResponse[]>([])
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>(CONVERSATION_DEFAULT_FILTER);
  const [courses, setCourses] = useState<Array<Course>>()
  const [isVisibleCreateConversationDialog, setVisibleCreateConversationDialog] = useState(false)
  const { t } = useTranslation()
  const inputSearch = useRef<any>(null);
  const socket = getSocket()

  const [selectedTab, setSelectedTab] = useState<string>(TabList[0].value)
  const selectedTabRef = useRef<string>(TabList[0].value)

  const handleChangeTab = useCallback((newValue: string) => {
    setSelectedTab(newValue)
    selectedTabRef.current = newValue
  }, [])

  const onChangeSearch = useCallback((value: string) => {
    setSearch(value);
    searchRef.current = value;
  }, []);

  const getConversationList = useCallback(async (textSearch?: string) => {
    setLoading(true)
    try {
      const res = await getListConversation({ ...conversationFilter, textSearch: textSearch || searchRef.current })
      setConversations(res.data.items || [])

    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }, [conversationFilter, setLoading, t])

  useEffect(() => {
    if (inputSearch.current) {
      clearTimeout(inputSearch.current);
    }

    inputSearch.current = setTimeout(() => {
      getConversationList(search);
    }, 500);

    return () => {
      if (inputSearch.current) {
        clearTimeout(inputSearch.current);
      }
    };
  }, [search, getConversationList]);

  const handleCloseFilterModal = useCallback(() => {
    setOpenFilterModal(false)
  }, [])

  const handleOpenFilterModal = useCallback(() => {
    setOpenFilterModal(true)
  }, [])

  const handleChangeSelectedConversation = useCallback((val: ConversationsResponse) => {
    setSelectedConversation(val)
    setConversations(prev => prev.map(i => i.id === val.id ? { ...i, totalUnReadMessage: 0 } : i))
  }, [])

  const handleVisibleCreateConversationDialog = useCallback(() => {
    setVisibleCreateConversationDialog(true)
  }, [])

  const handleCloseCreateConversationDialog = useCallback(() => {
    setVisibleCreateConversationDialog(false)
  }, [])

  const handleChangeFilter = useCallback((filter: ConversationFilter) => {
    setConversationFilter((state: ConversationFilter) => ({
      ...state,
      ...filter
    }))
  }, [])

  const handleChangeUnreadMessagesConversationCount = useCallback((data: string) => {
    const conversationCount: any = JSON.parse(data)
    setConversations((prev) => prev.map(i => 
      conversationCount.conversationId === i.id 
        ? { ...i, totalUnReadMessage: conversationCount.totalUnReadMessage } 
        : i
    ))
  }, [])

  const checkSearchMatch = useCallback((item: any, searchText: string) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();

    const matchTeacher = item.teacherName?.toLowerCase().includes(searchLower);
    const matchTextbook = item.textbookName?.toLowerCase().includes(searchLower);
    const matchExam = item.examTitle?.toLowerCase().includes(searchLower);

    if (matchTeacher || matchTextbook || matchExam) return true;

    const searchNum = parseInt(searchText, 10);
    if (!isNaN(searchNum) && item.question?.questionOrder !== undefined) {
      if (item.question.questionOrder + 1 === searchNum) {
        return true;
      }
    }

    return false;
  }, []);

  const checkTabMatch = useCallback((item: any, selectedTab: string) => {
    if (selectedTab === 'all') return true;

    const isCompleted = item.isCompleted;
    const totalUnReadMessage = item.totalUnReadMessage || 0;

    if (selectedTab === 'new') {
      return !isCompleted && totalUnReadMessage > 0;
    }
    if (selectedTab === 'unanswered') {
      return !isCompleted && totalUnReadMessage === 0;
    }
    if (selectedTab === 'completed') {
      return isCompleted;
    }
    return true;
  }, []);

  const handleNewMessageCount = useCallback((data: string) => {
    const conversationCount: any = JSON.parse(data)
    const searchText = searchRef.current?.trim() || "";
    if (!checkSearchMatch(conversationCount, searchText) || !checkTabMatch(conversationCount, selectedTabRef.current)) return;

    setConversations((prev) => {
      const index = prev.findIndex((i) => i.id === conversationCount.conversationId)
      if (index < 0) return prev;
      
        const updatedConversations = [...prev];
        const [conversation] = updatedConversations.splice(index, 1);

        const updatedConversation = {
          ...conversation,
          lastMessage: conversationCount.lastMessage || conversation.lastMessage,
          totalUnReadMessage: conversationCount.totalUnReadMessage || 0,
          isCompleted: conversationCount.isCompleted,
        }
        return [updatedConversation, ...updatedConversations];
    })
  }, [checkSearchMatch])

  const getListCourseByStudent = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getListCourseByStudentApi({ studentId: user?.id || 0 })
      setCourses(res.data.items || [])

    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }, [user?.id, setLoading, t])

  const handleCompletedConversation = useCallback((data: string) => {
    if (!data) return
    const item = JSON.parse(data)
    setConversations((prev) => prev.map((conversation) => {
      if (conversation.id === item.id) return {...conversation, isCompleted: item.isCompleted, completedAt: item.completedAt}
      return conversation
    }))
  }, [])

  useEffect(() => {
    if (!user?.id || !user?.academyDomain) return
    getListCourseByStudent()
  }, [user?.id, user?.academyDomain, getListCourseByStudent])

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
  }, [selectedConversation?.id, academyDomain, user?.id, socket, handleCompletedConversation, handleChangeUnreadMessagesConversationCount, handleNewMessageCount]);

  useFocusEffect(
    useCallback(() => {
      getConversationList()
      return () => {
        setSelectedConversation(undefined)
        setSearch('')
        searchRef.current = ''
      };
    }, [getConversationList])
  );

  useEffect(() => {
    getConversationList()
  }, [conversationFilter.currentPage, conversationFilter.pageSize, selectedAcademy?.id, getConversationList])

  return useMemo(() => ({
    t,
    user,
    courses,
    conversationFilter,
    selectedConversation,
    conversations,
    search,
    onChangeSearch,
    handleCloseFilterModal,
    handleOpenFilterModal,
    handleChangeFilter,
    handleCompletedConversation,
    handleChangeSelectedConversation,
    setSelectedConversation,
    getConversationList,
    isVisibleCreateConversationDialog,
    handleCloseCreateConversationDialog,
    handleVisibleCreateConversationDialog,
    selectedTab,
    handleChangeTab,

  }), [
    t, user, courses, conversationFilter, selectedConversation, conversations, search,
    onChangeSearch, handleCloseFilterModal, handleOpenFilterModal, handleChangeFilter,
    handleCompletedConversation, handleChangeSelectedConversation, getConversationList,
    isVisibleCreateConversationDialog, handleCloseCreateConversationDialog, handleVisibleCreateConversationDialog,
    selectedTab, handleChangeTab
  ])
}

export default useConversationList