import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import useMessageList from "./useMessageList";
import { useTranslation } from "react-i18next";
import { ConversationsResponse, EventsMap, MessageRequest, MessageResponse, StudentsConversationResponse } from "@/utils/types";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";
import { IChatItemProps } from "../configs/types";
import { apiAddMessage, apiUploadImageFile, updateLastTimeReadConversation } from "../apiClient/conversationService";
import { pick } from '@react-native-documents/picker'
import { useFocusEffect } from "@react-navigation/native";
import { Keyboard } from "react-native";
import RNFS from 'react-native-fs';
import useSocketConversation from "./useSocketConversation";

interface Props {
  conversation?: ConversationsResponse;
  student?: StudentsConversationResponse
}
const useChatContainer = (props: Props) => {
  const { conversation, student } = props;
  const { t } = useTranslation()
  const { user, setLoadingWithoutOverlay } = useAuthStore()

  const isReceivedMessage = useRef(false)
  const roles = user?.roles || []
  const [isSending, setSending] = useState<boolean>(false)
  const [selectedConversation, setSelectedConversation] = useState<ConversationsResponse>();
  const [message, setMessage] = useState<MessageRequest>();
  const [isScrollToEnd, setScrollToEnd] = useState<boolean>(false)
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
    setLoadingWithoutOverlay(true);
    if (!selectedConversation?.id) return;
    setScrollToEnd(true)
    setSending(true)
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

      if (!isReceivedMessage.current) {
        setMessages((state: MessageResponse[]) => {
          const isExist = state.find(i => i.id == data?.id)
          if (isExist) return state
          setScrollToEnd(true)

          return [data, ...state]
        });
        isReceivedMessage.current = false
      }

    } catch (error) {
      setMessages((state: MessageResponse[]) => {
        return [...state.filter(i => i?.id !== 0)]
      })
      toast.error(getErrorMessage(t, error))
    }
    finally {
      setSending(false)
      setLoadingWithoutOverlay(false)
      handleChangeInput('')
    }

  };

  const handleUploadImage = async () => {
    try {
      const [result] = await pick({
        mode: 'open',
        allowVirtualFiles: true
      })

      setLoadingWithoutOverlay(true)
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
    finally {
      setLoadingWithoutOverlay(false);
    }
  }

  const saveBase64ToFile = async (base64Data: string, fileName = 'signature.png') => {
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const cleanedBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    await RNFS.writeFile(path, cleanedBase64, 'base64');
    return path;
  }

  const handleUploadImageCanvas = async (data: string, callback: any) => {
    try {
      setLoadingWithoutOverlay(true)
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
    setLoadingWithoutOverlay(false);
  }

  useEffect(() => {
    if (!selectedConversation?.id) return
    setLoadingWithoutOverlay(false)

  }, [selectedConversation?.id])

  const handleChangeInput = (text: string) => {
    setMessage({
      content: text,
    });
  };

  const handleNewMessageSent = async (data: string) => {
    if (!data) return
    const parsedData = JSON.parse(data)
    isReceivedMessage.current = !!parsedData.id

    setMessages((state: MessageResponse[]) => {
      const isExist = state.find(i => i.id == parsedData?.id)
      if (isExist) return state
      setScrollToEnd(true)


      return [parsedData, ...state]
    });
    selectedConversation?.id && await updateLastTimeReadConversation(selectedConversation.id)
  };

  const handleCompletedConversation = (data: string) => {
    if (!data) return
    const parsedData = JSON.parse(data)

    setSelectedConversation((prev) => prev?.id === parsedData.id ? parsedData : prev)
  };
  const handleLoadMoreMessages = async () => {
    if (selectedConversation?.id === undefined) return;

    return await handleLoadMore(selectedConversation?.id)
  }

  const conversationEvents: EventsMap = {
    "new-message-event": handleNewMessageSent,
    "completed-conversation-event": handleCompletedConversation,
    "delete-message-event": deleteMessageState,
    "update-message-event": updateMessageState,
  };

  useSocketConversation({
    conversationEvents,
    selectedConversation
  })

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
    messages,
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
      roles,
      ...selectedConversation
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
      isSending,
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
    isLoadingMessages: isLoadingMessages,
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
