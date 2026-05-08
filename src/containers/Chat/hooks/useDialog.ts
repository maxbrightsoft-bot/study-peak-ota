import { useState } from "react"
import { apiUploadImageFile, completeConversation } from "../apiClient/conversationService";
import { useTranslation } from "react-i18next";
import { MessageRequest } from "@/utils/types";
import { getErrorMessage, toast } from "@/utils/helpers";
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from "@/store/useAuthStore";

const useDialog = () => {
  const { t } = useTranslation()
  const { setLoading } = useAuthStore()
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>()
  const [selectedFile, setSelectedFile] = useState<MessageRequest | null>();

  const toggleDialog = (item?: any) => {
    item && setSelectedItem(item)
    setSelectedFile(null)
    setOpenDialog((state) => !state);
  };

  const toggleConfirmDialog = (item?: any) => {
    item && setSelectedItem(item)
    setOpenConfirmDialog((state) => !state);
  };


  const handleConfirm = async (conversationId: number) => {
    try {
      await completeConversation(conversationId)
      toggleDialog()
      toast.success(t("complete_conversation_successfully"))
    } catch (error) {
      toast.error(getErrorMessage(t, error, t("fail_to_complete_conversation")))
    }
  }

  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) return;

      setLoading(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("upload", {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      } as any);
      const res = await apiUploadImageFile(formData);
      setSelectedFile({ content: res?.data?.url })
      toast.success(t('upload_image_successfully'))
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }

  return {
    selectedItem,
    selectedFile,
    openDialog,
    toggleDialog,
    openConfirmDialog,
    toggleConfirmDialog,
    handleConfirm,
    handleUploadImage
  }
}

export default useDialog