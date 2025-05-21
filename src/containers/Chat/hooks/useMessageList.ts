import { MessageFilter, MessageResponse } from "@/utils/types";
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { MESSAGE_DEFAULT_FILTER } from "../configs/constants";
import { deleteMessage, getMessagesByConversation, updateLastTimeReadConversation, updateMessage } from "../apiClient/conversationService";
import { getErrorMessage, toast } from "@/utils/helpers";

const useMessageList = () => {
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [messageFilter, setMessageFilter] = useState<MessageFilter>(MESSAGE_DEFAULT_FILTER)
  const [isLoading, setLoading] = useState<boolean>(false)
  const { t } = useTranslation()

  const getMessageList = async (conversationId: number) => {
    setLoading(true)
    try {
      const filter = {
        ...messageFilter,
      }
      const res = await getMessagesByConversation(conversationId, filter)
      await updateLastTimeReadConversation(conversationId)
      setMessages([...res.data.items])
      setMessageFilter((prev) => ({ ...prev, totalItems: res.data.totalItems, totalPages: res.data.totalPages }))
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const handleLoadMore = async(conversationId: number) => {
    if (isLoading || messageFilter.currentPage === messageFilter.totalPages ) return

    const filter = {
      ...messageFilter,
      currentPage: (messageFilter?.currentPage || 1) + 1,
    }

    setLoading(true)
    try {
      const res = await getMessagesByConversation(conversationId, filter)
      await updateLastTimeReadConversation(conversationId)
      if(res.data.items.length){
        setMessages((prev) => {
          const data = [...prev, ...res.data.items]
          const dataFilter = new Set(data)
          return Array.from(dataFilter)
        })
        setMessageFilter((prev) => ({ ...prev, totalItems: res.data.totalItems, totalPages: res.data.totalPages, currentPage: res.data.page }))
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      return 
    }
    setLoading(false)
    return true
  }

  const resetMessages = () => {
    setMessageFilter(MESSAGE_DEFAULT_FILTER)
    setMessages([])
  }

  const handleDeleteMessage = async(conversationId: number, id: number, callback: any) => {
    if (isLoading) return
    try {
      await deleteMessage(conversationId, id)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      return 
    }
    callback()
  }

  const deleteMessageState = (data: MessageResponse) => {
    if(!data) return
    
    setMessages((prev) => {
      return prev.filter((message) => message.id !== data.id)
    })
  }

  const updateMessageState = (data: MessageResponse) => {
    if(!data) return
    
    setMessages((prev) => {
      return prev.map((message) => {
        if(message.id === data.id) return data
        return message
      })
    })
  }

  const handleUpdateMessage = async(conversationId: number, id: number, message: string,  callback: any) => {
    try {
      await updateMessage(conversationId, id, message)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      return 
    }
    setLoading(false)
    callback()
  }

  return {
    isLoading,
    messageFilter,
    messages,
    getMessageList,
    setMessages,
    resetMessages,
    handleLoadMore,
    handleUpdateMessage,
    handleDeleteMessage,
    deleteMessageState,
    updateMessageState
  }
}

export default useMessageList