import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import useMessageList from "./useMessageList";
import { useTranslation } from "react-i18next";
import { ConversationsResponse, EventsMap, MessageRequest, MessageResponse, StudentsConversationResponse } from "@/utils/types";
import { ConversationType } from "@/utils/enums";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";
import { IChatItemProps } from "../configs/types";
import { apiAddMessage, apiUploadImageFile, updateLastTimeReadConversation } from "../apiClient/conversationService";
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from "@react-navigation/native";
import { Keyboard } from "react-native";
import RNFS from 'react-native-fs';
import useSocketConversation from "./useSocketConversation";
import { MathRichInputRef } from "@/components/Input/MathRichInput";

interface Props {
  conversation?: ConversationsResponse;
  student?: StudentsConversationResponse
}
const useChatContainer = (props: Props) => {
  const { conversation, student } = props;
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  const isDemoMode = useAuthStore(state => state.isDemoMode)
  const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
  const inputRef = useRef<MathRichInputRef>(null);
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
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }

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
      inputRef.current?.clear()
    }

  };

  const handleUploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setLoadingWithoutOverlay(true);
    try {
      let fileName = asset.fileName;
      if (!fileName || !fileName.includes('.')) {
        const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
        fileName = `photo_${Date.now()}.${ext}`;
      }
      const mimeType = asset.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');

      const formData = new FormData();
      formData.append("upload", {
        uri: asset.uri,
        type: mimeType,
        name: fileName,
      } as any);
      const res = await apiUploadImageFile(formData);
      await handleAddMessage(res?.data?.url);
    } catch (error) {
      setMessages((state: MessageResponse[]) => {
        return [...state.filter(i => i?.id !== 0)]
      });
      toast.error(getErrorMessage(t, error));
    } finally {
      setLoadingWithoutOverlay(false);
    }
  };

  const handlePickFromGallery = async () => {
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.6,
      });

      if (result.canceled || !result.assets?.length) return;

      for (const asset of result.assets) {
        await handleUploadAsset(asset);
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
  };

  const handleTakePhoto = async () => {
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }
    try {
      const currentPerm = await ImagePicker.getCameraPermissionsAsync();
      let isGranted = currentPerm.granted;
      if (!isGranted) {
        const requested = await ImagePicker.requestCameraPermissionsAsync();
        isGranted = requested.granted;
      }

      if (!isGranted) {
        toast.error(t('camera_permission_required'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
      });

      let asset = (!result.canceled && result.assets?.length) ? result.assets[0] : null;

      if (!asset) {
        const pending = await ImagePicker.getPendingResultAsync();
        if (pending && 'assets' in pending && pending.assets?.length && !pending.canceled) {
          asset = pending.assets[0];
        }
      }

      if (asset) {
        await handleUploadAsset(asset);
      }
    } catch (error) {
      console.log("[Chat handleTakePhoto] Error:", error);
      toast.error(getErrorMessage(t, error));
    }
  };

  const handleUploadImage = async () => {
    await handlePickFromGallery();
  };

  const saveBase64ToFile = async (base64Data: string, fileName = 'signature.png') => {
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const cleanedBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    await RNFS.writeFile(path, cleanedBase64, 'base64');
    return path;
  }

  const handleUploadImageCanvas = async (data: string, callback: any) => {
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }
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

  const handleNewMessageSent = async (data: any) => {
    if (!data) return
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      if (!parsedData?.id) return
      isReceivedMessage.current = true

      setMessages((state: MessageResponse[]) => {
        const isExist = state.find(i => i.id == parsedData?.id)
        if (isExist) return state
        setScrollToEnd(true)

        return [parsedData, ...state]
      });
      selectedConversation?.id && await updateLastTimeReadConversation(selectedConversation.id)
    } catch (e) {
      console.error('Error handling new message sent in chat container:', e)
    }
  };

  const handleCompletedConversation = (data: any) => {
    if (!data) return
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const convId = parsedData?.id ?? parsedData?.conversationId
      setSelectedConversation((prev) =>
        prev?.id === convId
          ? {
              ...prev,
              ...(typeof parsedData === 'object' ? parsedData : {}),
              isCompleted: true,
              completedAt: parsedData?.completedAt || prev?.completedAt,
            }
          : prev
      )
    } catch (e) {
      console.error('Error parsing completed conversation in chat container:', e)
    }
  };
  const activeConv = selectedConversation || conversation;

  const handleLoadMoreMessages = async () => {
    const convId = activeConv?.id;
    if (convId === undefined) return;

    return await handleLoadMore(convId)
  }

  const conversationEvents: EventsMap = {
    "new-message-event": handleNewMessageSent,
    "completed-conversation-event": handleCompletedConversation,
    "delete-message-event": deleteMessageState,
    "update-message-event": updateMessageState,
  };

  useSocketConversation({
    conversationEvents,
    selectedConversation: activeConv
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
    const convId = activeConv?.id;
    if (convId === undefined) return;

    await getMessageList(convId);
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
    console.log('results', results);
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
      };
    }, [])
  );

  useEffect(() => {
    if (!activeConv?.id) return
    handleConversationChange()
  }, [activeConv?.id])

  useEffect(() => {
    if (activeConv?.id) {
      getMessageConversation();
    }
  }, [activeConv?.id]);

  return {
    chatHeaderProps: {
      fullName: student?.fullName,
      roles,
      ...activeConv,
      teacherName: activeConv?.teacherName || (activeConv as any)?.mainTeacherCourseName || "",
      isOnlyConversationStudentWithTeacher:
        !activeConv?.studentExamSessionId &&
        !activeConv?.studentTextbookSessionId &&
        !activeConv?.courseId &&
        !activeConv?.examSessionId &&
        (!!activeConv?.teacherId || !!activeConv?.teacherName || !!(activeConv as any)?.mainTeacherCourseName || activeConv?.type === ConversationType.StaffStudent || activeConv?.type === ConversationType.TeacherStudent)
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
      inputRef,
      isSending,
      text: message?.content || "",
      onChangeInput: handleChangeInput,
      onSubmit: handleAddMessage,
      handleUploadImage,
      handleTakePhoto,
      handlePickFromGallery,
      isCompleted: activeConv?.isCompleted,
      handleUploadImageCanvas,
      openSketchCanvasDialog,
      handleOpenSketchCanvasDialog,
      handleCloseSketchCanvasDialog
    },
    isLoadingMessages: isLoadingMessages,
    messageList,
    selectedConversation: activeConv,
    messageFilter,
    handleLoadMoreMessages,
    getMessageList,
    setMessage,
    handleConversationChange,
    getMessageConversation,
  };
};

export default useChatContainer;
