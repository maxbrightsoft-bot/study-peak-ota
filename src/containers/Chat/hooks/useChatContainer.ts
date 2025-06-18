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
import RNFS from 'react-native-fs';

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

  const academyDomain: string | undefined = user?.academyDomain
  const roles = user?.roles || []

  const [selectedConversation, setSelectedConversation] = useState<ConversationsResponse>();
  const [message, setMessage] = useState<MessageRequest>();
  const [isScrollToEnd, setScrollToEnd] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [openSketchCanvasDialog, setOpenSketchCanvasDialog] = useState(false)

  const handleOpenSketchCanvasDialog = () => {
    setOpenSketchCanvasDialog(true)
  }

  const handleCloseSketchCanvasDialog = () => {
    setOpenSketchCanvasDialog(false)
  }

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

  const handleAddMessage = async (url?: string) => {
    setLoading(true);
    if (!selectedConversation?.id) return;
    setScrollToEnd(true)

    try {
      let res;
      if (url) {
        res = await apiAddMessage(selectedConversation?.id, {
          content: url,
          contentType: 1
        });

        const { data } = res?.data

        setMessages((state: MessageResponse[]) => {
          return [data, ...state]
        });
      }
      if (message?.content?.trim().length) {
        handleChangeInput('')

        Keyboard.dismiss()
        res = await apiAddMessage(selectedConversation?.id, {
          ...message,
        });
      }
      const { data } = res?.data

      const isExits = messages.some(i => i.id == data.id)
      if (isExits) return

      setMessages((state: MessageResponse[]) => {
        return [data, ...state]
      });

    } catch (error) {
      setMessages((state: MessageResponse[]) => {
        return [...state.filter(i => i?.id !== 0)]
      })
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
    handleChangeInput('')

  };

  const handleUploadImage = async () => {
    try {
      const [result] = await pick({
        mode: 'open',
        allowVirtualFiles: true
      })

      setLoading(true)
      const formData = new FormData();
      formData.append("upload", result as any);
      const res = await apiUploadImageFile(formData);
      await handleAddMessage(res?.data?.url)
    } catch (error) {
      setMessages((state: MessageResponse[]) => {
        return [...state.filter(i => i?.id !== 0)]
      })
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false);
  }

  const saveBase64ToFile = async (base64Data: string, fileName = 'signature.png') => {
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const cleanedBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    await RNFS.writeFile(path, cleanedBase64, 'base64');
    return path;
  }

  const handleUploadImageCanvas = async (data: string, callback: any) => {
    try {
      setLoading(true)
      const fileName = `signature_${new Date().getTime()}.png`
      // const filePath = await saveBase64ToFile(data, fileName);

      const formData = new FormData() as any;
      formData?.append('upload', {
        uri: data,
        type: 'image/png',
        name: fileName,
      });
      const res = await apiUploadImageFile(formData);
      await handleAddMessage(res?.data?.url)
      callback()
    } catch (error) {
      setMessages((state: MessageResponse[]) => {
        return [...state.filter(i => i?.id !== 0)]
      })
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!selectedConversation?.id) return
    setLoading(false)

  }, [selectedConversation?.id])

  const handleChangeInput = (text: string) => {
    setMessage({
      content: text,
    });
  };

  const handleNewMessageSent = async (data: MessageResponse) => {
    if (!data) return
    setScrollToEnd(true)
    const isExits = messages.some(i => i.id == data.id)
    if (isExits) return
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
    try {
      if (
        pusher &&
        academyDomain &&
        !!selectedConversation?.id
      ) {
        cleanupPusher()

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
    } catch (err) {
      console.error("Pusher subscription failed", err);
    }
  }

  useEffect(() => {
    const initPusher = async () => {
      await handleListenerEvent();
    };

    initPusher();
    return cleanupPusher;
  }, [selectedConversation?.id, academyDomain, pusher]);

  useEffect(() => {
    const getConversation = async () => {
      resetMessages()
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
      getMessageConversation()
      return () => {
        setScrollToEnd(false)
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
      isCompleted: selectedConversation?.isCompleted,
      handleUploadImageCanvas,
      openSketchCanvasDialog,
      handleOpenSketchCanvasDialog,
      handleCloseSketchCanvasDialog
    },
    isLoadingMessages: isLoadingMessages || loading,
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
