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
  const channel2 = useRef('')
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef<string>("");
  const [selectedConversation, setSelectedConversation] = useState<ConversationsResponse>();
  const [conversations, setConversations] = useState<ConversationsResponse[]>([])
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>(CONVERSATION_DEFAULT_FILTER);
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const currentPageRef = useRef(1)
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

  const sortConversations = useCallback((list: ConversationsResponse[]) => {
    return [...list].sort((a, b) => {
      const aCompleted = Boolean(a.isCompleted);
      const bCompleted = Boolean(b.isCompleted);
      if (!aCompleted && bCompleted) return -1;
      if (aCompleted && !bCompleted) return 1;

      const timeA = new Date(a.lastMessage?.createdAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, []);

  const sortedConversations = useMemo(() => {
    return sortConversations(conversations);
  }, [conversations, sortConversations]);

  const getConversationList = useCallback(async (textSearch?: string, targetConversationId?: number, page?: number, append?: boolean) => {
    if (!append) setLoadingList(true)
    try {
      const res = await getListConversation({
        ...conversationFilter,
        currentPage: page ?? conversationFilter.currentPage,
        textSearch: textSearch !== undefined ? textSearch : searchRef.current
      })
      const items: ConversationsResponse[] = res.data.items || []
      const totalPages = res.data.totalPages || 1
      const currentP = page ?? conversationFilter.currentPage
      setHasMore(currentP < totalPages)
      if (append) {
        setConversations(prev => [...prev, ...items])
      } else {
        currentPageRef.current = 1
        setConversations(items)
      }
      if (targetConversationId) {
        const found = items.find(c => c.id === targetConversationId)
        if (found) {
          setSelectedConversation(found)
        }
      }
      return items
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      return []
    } finally {
      if (!append) setLoadingList(false)
    }
  }, [conversationFilter, setLoadingList, t])

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    const nextPage = currentPageRef.current + 1
    currentPageRef.current = nextPage
    try {
      const res = await getListConversation({
        ...conversationFilter,
        currentPage: nextPage,
        textSearch: searchRef.current
      })
      const items = res.data.items || []
      const totalPages = res.data.totalPages || 1
      setHasMore(nextPage < totalPages)
      setConversations(prev => [...prev, ...items])
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingMore(false)
  }, [hasMore, loadingMore, conversationFilter, t])

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

  const handleChangeUnreadMessagesConversationCount = useCallback((data: any) => {
    if (!data) return
    try {
      const conversationCount: any = typeof data === 'string' ? JSON.parse(data) : data
      setConversations((prev) => prev.map(i => 
        conversationCount.conversationId === i.id 
          ? { ...i, totalUnReadMessage: conversationCount.totalUnReadMessage } 
          : i
      ))
    } catch (e) {
      console.error('Error in handleChangeUnreadMessagesConversationCount:', e)
    }
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

  const handleNewMessageCount = useCallback((data: any) => {
    if (!data) return
    try {
      const payload: any = typeof data === 'string' ? JSON.parse(data) : data
      const convId = payload.conversationId || payload.id
      if (!convId) return

      const searchText = searchRef.current?.trim() || "";
      if (!checkSearchMatch(payload, searchText) || !checkTabMatch(payload, selectedTabRef.current)) return;

      setConversations((prev) => {
        const index = prev.findIndex((i) => i.id === convId)
        if (index < 0) return prev;
        
        const updatedConversations = [...prev];
        const [conversation] = updatedConversations.splice(index, 1);

        const lastMsg = payload.lastMessage || (payload.content ? {
          content: payload.content,
          createdAt: payload.createdAt,
          isStudent: payload.isStudent
        } : conversation.lastMessage)

        const updatedConversation = {
          ...conversation,
          lastMessage: lastMsg,
          totalUnReadMessage: payload.totalUnReadMessage ?? conversation.totalUnReadMessage,
          isCompleted: payload.isCompleted !== undefined ? payload.isCompleted : conversation.isCompleted,
        }
        return [updatedConversation, ...updatedConversations];
      })
    } catch (e) {
      console.error('Error in handleNewMessageCount:', e)
    }
  }, [checkSearchMatch, checkTabMatch])

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

  const handleCompletedConversation = useCallback((data: any) => {
    if (!data) return
    try {
      const item = typeof data === 'string' ? JSON.parse(data) : data
      const convId = item?.id ?? item?.conversationId
      if (!convId) return

      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id === convId) {
            return {
              ...conversation,
              ...(typeof item === 'object' ? item : {}),
              isCompleted: item.isCompleted ?? true,
              completedAt: item.completedAt || conversation.completedAt,
            }
          }
          return conversation
        })
      )
      setSelectedConversation((prev) =>
        prev?.id === convId
          ? {
              ...prev,
              ...(typeof item === 'object' ? item : {}),
              isCompleted: true,
              completedAt: item?.completedAt || prev?.completedAt,
            }
          : prev
      )
    } catch (e) {
      console.error('Error handling completed conversation in list:', e)
    }
  }, [])

  useEffect(() => {
    if (!user?.id || !user?.academyDomain) return
    getListCourseByStudent()
  }, [user?.id, user?.academyDomain, getListCourseByStudent])

  useEffect(() => {
    if (!academyDomain || !user?.id) return

    const socket = getSocket()
    if (!socket) return

    const normalizedDomain = academyDomain.trim().toUpperCase()
    channel2.current = `conversations-channel-${user.id}-${normalizedDomain}`

    const subscribeUserChannel = () => {
      console.log('[Socket] Subscribing userChannel:', channel2.current, 'socket.id:', socket.id, 'connected:', socket.connected)
      socket.emit('subscribe', channel2.current)
    }

    if (socket.connected) {
      subscribeUserChannel()
    }
    socket.on('connect', subscribeUserChannel)

    socket.on("completed-conversation-event", handleCompletedConversation)
    socket.on("unread-messages-count-event", handleChangeUnreadMessagesConversationCount)
    socket.on("new-message-conversations-event", handleNewMessageCount)
    socket.on("new-message-event", handleNewMessageCount)

    return () => {
      socket.off('connect', subscribeUserChannel)
      if (socket.connected) {
        socket.emit('unsubscribe', channel2.current)
      }
      socket.off("completed-conversation-event", handleCompletedConversation)
      socket.off("unread-messages-count-event", handleChangeUnreadMessagesConversationCount)
      socket.off("new-message-conversations-event", handleNewMessageCount)
      socket.off("new-message-event", handleNewMessageCount)
    }
  }, [academyDomain, user?.id, handleCompletedConversation, handleChangeUnreadMessagesConversationCount, handleNewMessageCount]);

  useFocusEffect(
    useCallback(() => {
      getConversationList()
      return () => {
        setSearch('')
        searchRef.current = ''
      };
    }, [])
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
    conversations: sortedConversations,
    search,
    hasMore,
    loadingMore,
    loadingList,
    onChangeSearch,
    handleCloseFilterModal,
    handleOpenFilterModal,
    handleChangeFilter,
    handleCompletedConversation,
    handleChangeSelectedConversation,
    setSelectedConversation,
    getConversationList,
    handleLoadMore,
    isVisibleCreateConversationDialog,
    handleCloseCreateConversationDialog,
    handleVisibleCreateConversationDialog,
    selectedTab,
    handleChangeTab,

  }), [
    t, user, courses, conversationFilter, selectedConversation, sortedConversations, search,
    hasMore, loadingMore,
    loadingList, onChangeSearch, handleCloseFilterModal, handleOpenFilterModal, handleChangeFilter,
    handleCompletedConversation, handleChangeSelectedConversation, getConversationList,
    handleLoadMore, isVisibleCreateConversationDialog, handleCloseCreateConversationDialog,
    handleVisibleCreateConversationDialog, selectedTab, handleChangeTab
  ])
}

export default useConversationList