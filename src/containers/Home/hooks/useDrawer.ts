import { useCallback, useState } from "react";
import { getListNotificationByIdApi, getNoteByIdApi } from "../apiClients";
import { Notification } from "../configs/type";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { getErrorMessage, toast } from "@/utils/helpers";
import { useFocusEffect } from "@react-navigation/native";

const useDrawer = () => {
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);
  const { selectedAcademy } = useAuthStore()
  const [notification, setNotification] = useState<Notification | null>(null)
  const { t } = useTranslation()

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNotification(null)
  };

  const handleGetListNotification = async (data?: Notification) => {
    if (!data) return
    const isNoti = data?.type ?? false
    try {
      const res = isNoti ?
        await getListNotificationByIdApi(data.id) :
        await getNoteByIdApi(data.id);

      const item = isNoti ? res.data.data : res.data
      setNotification(
        isNoti ?
          res.data.data :
          {
            id: item.id,
            content: item.content,
            name: item.fullName,
            createdAt: item.createdAt ?? "",
            notificationTypes: []
          })
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    }
  }

  const handleOpenDialog = (data?: Notification) => {
    setOpenDialog(true);
    handleGetListNotification(data)
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setNotification(null)
        handleCloseDialog()
      };
    }, [])
  );

  return {
    isOpenDialog,
    notification,
    handleCloseDialog,
    handleOpenDialog,
    selectedAcademy
  };
};

export default useDrawer;
