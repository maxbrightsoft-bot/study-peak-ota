import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import useMessageList from "./useMessageList";
import { useTranslation } from "react-i18next";
import { ConversationsResponse, MessageRequest, MessageResponse, StudentsConversationResponse } from "@/utils/types";
import useAuthStore from "@/store/useAuthStore";
import { PusherChannel } from "@pusher/pusher-websocket-react-native";
import { getErrorMessage, toast } from "@/utils/helpers";
import { IChatItemProps } from "../configs/types";
import { COMPLETED_CONVERSATION_EVENT, DELETE_MESSAGE_EVENT, NEW_CONVERSATION_EVENT, NEW_MESSAGE_EVENT, UPDATE_MESSAGE_EVENT } from "../configs/constants";
import { apiAddMessage, apiUploadImageFile, updateLastTimeReadConversation } from "../apiClient/conversationService";
import { pick } from '@react-native-documents/picker'
import { useFocusEffect } from "@react-navigation/native";
import { Keyboard } from "react-native";

interface Props {
  conversation?: ConversationsResponse;
  student?: StudentsConversationResponse
}
const useChatContainer = (props: Props) => {
  const { conversation, student } = props;
  const { t } = useTranslation()
  const { user, pusher, subscribeChannel, unsubscribeChannelSafe } = useAuthStore()

  const channel = useRef<PusherChannel>();
  const channelName = useRef<string>();
  const loadingRef = useRef<boolean>(false);

  const academyDomain: string | undefined = user?.academyDomain
  const roles = user?.roles || []

  const [selectedConversation, setSelectedConversation] = useState<ConversationsResponse>();
  const [message, setMessage] = useState<MessageRequest>();
  const [isScrollToEnd, setScrollToEnd] = useState<boolean>(true)

  const {
    isLoading: isLoadingMessages,
    messages,
    messageFilter,
    getMessageList,
    resetMessages,
    setMessages,
    handleLoadMore,
    handleUpdateMessage,
    handleDeleteMessage,
    deleteMessageState,
    updateMessageState
  } = useMessageList();

  const handleToggleScrollToEnd = () => {
    setScrollToEnd((state: boolean) => !state)
  }

  const handleAddMessage = async ({ url }: { url?: string}) => {
    if (loadingRef.current) return; //when loading not add 2 message
    loadingRef.current = true;
    if (!selectedConversation?.id) return;
    setScrollToEnd(true)

    try {
      if (url) {
        await apiAddMessage(selectedConversation?.id, {
          content: url,
          contentType: 1
        });
      }
      if (message?.content?.trim().length) {
        await apiAddMessage(selectedConversation?.id, {
          ...message,
        });
      }

      handleChangeInput('')
    } catch (error) {
      setMessages((state: MessageResponse[]) => {
        return [...state.filter(i => i?.id !== 0)]
      })
      toast.error(getErrorMessage(t, error))
    }
    loadingRef.current = false;
  };

  const handleUploadImage = async () => {
    try {

      const [result] = await pick({
        mode: 'open',
        allowVirtualFiles: true
      })

      const formData = new FormData();
      formData.append("upload", result as any);
      const res = await apiUploadImageFile(formData);
      handleAddMessage({ url: res?.data?.url})
    } catch (error) {
      setMessages((state: MessageResponse[]) => {
        return [...state.filter(i => i?.id !== 0)]
      })
      toast.error(getErrorMessage(t, error))
    }
  }

  const handleChangeInput = (text: string) => {
    setMessage({
      content: text,
    });
  };

  const handleNewMessageSent = async (data: MessageResponse) => {
    if (!data) return
    setScrollToEnd(true)
    setMessages((state: MessageResponse[]) => {
      return [data, ...state]
    });
    selectedConversation?.id && await updateLastTimeReadConversation(selectedConversation.id)
  };

  const handleNewConversation = async (data: string) => {
    if (!data) return
    const item = JSON.parse(data)
    setScrollToEnd(true)
    setMessages((state: MessageResponse[]) => {
      return [item, ...state]
    });

    selectedConversation?.id && await updateLastTimeReadConversation(selectedConversation.id)
  };

  const handleCompletedConversation = (data: string) => {
    if (!data) return
    const parsedData = JSON.parse(data)
    if (parsedData.id) setSelectedConversation(JSON.parse(data))
  };

  const handleLoadMoreMessages = async () => {
    if (selectedConversation?.id === undefined) return;

    return await handleLoadMore(selectedConversation?.id)
  }

  const cleanupPusher = () => {
    if (!pusher) return
    if (channelName.current) {
      unsubscribeChannelSafe(pusher, channelName.current)
    }
  };

  const handleListenerEvent = async () => {
    if (
      pusher &&
      academyDomain &&
      !!selectedConversation?.id
    ) {
      channelName.current = `presence-conversation-channel-${selectedConversation.id}-${academyDomain.trim().toUpperCase()}`;
      const messageHandlers = {
        [NEW_MESSAGE_EVENT]: handleNewMessageSent,
        [COMPLETED_CONVERSATION_EVENT]: handleCompletedConversation,
        [NEW_CONVERSATION_EVENT]: handleNewConversation,
        [DELETE_MESSAGE_EVENT]: deleteMessageState,
        [UPDATE_MESSAGE_EVENT]: updateMessageState
      }
      channel.current = await subscribeChannel(pusher, channelName.current, Object.entries(messageHandlers).map(([eventName, handler]) => ({ eventName, handler })));
    }
  }

  useEffect(() => {
    handleListenerEvent()
    return cleanupPusher;
  }, [selectedConversation?.id, academyDomain, pusher]);

  useEffect(() => {
    const getConversation = async () => {
      resetMessages()
      setScrollToEnd(true)
      if (!conversation?.id) setSelectedConversation(undefined)
      else setSelectedConversation(conversation);
    };
    getConversation();
  }, [conversation?.id]);

  const getMessageConversation = async () => {
    if (selectedConversation?.id === undefined) return;

    await getMessageList(selectedConversation?.id);
  };

  const handleConversationChange = () => {
    resetMessages()
    setMessage({ content: "" })
    setScrollToEnd(true)
  }

  const messageList: IChatItemProps[] = useMemo(() => {
    const results = messages.map((i: MessageResponse) => {
      return {
        ...i,
        isMe: user?.id === i.sender?.id,
      };
    });
    return results
  }, [
    JSON.stringify(messages),
    user?.id,
  ]);

    useFocusEffect(
      useCallback(() => {
        return () => {
          setSelectedConversation(undefined)
        };
      }, [])
    );

  useEffect(() => {
    getMessageConversation();
  }, [JSON.stringify(selectedConversation)]);

  return {
    chatHeaderProps: {
      fullName: student?.fullName,
      examTitle: selectedConversation?.examTitle,
      courseId: selectedConversation?.courseId,
      score: selectedConversation?.score,
      totalScore: selectedConversation?.totalScore,
      questionOrder: selectedConversation?.question?.questionOrder,
      category: selectedConversation?.category,
      conversationId: selectedConversation?.id,
      isCompleted: selectedConversation?.isCompleted,
      durationExam: selectedConversation?.duration,
      createdAt: selectedConversation?.createdAt,
      teacherName: selectedConversation?.teacherName,
      roles
    },
    chatListProps: {
      isScrollToEnd,
      messages: messageList,
      onReTrySendMessage: handleAddMessage,
      roles,
      handleUpdateMessage,
      handleDeleteMessage,
      handleToggleScrollToEnd
    },
    inputProps: {
      text: message?.content || "",
      onChangeInput: handleChangeInput,
      onSubmit: handleAddMessage,
      handleUploadImage,
      isCompleted: selectedConversation?.isCompleted
    },
    isLoadingMessages,
    messageList,
    selectedConversation,
    messageFilter,
    handleLoadMoreMessages,
    getMessageList,
    setMessage,
    handleConversationChange,
    getMessageConversation,
  };
};

export default useChatContainer;
