import { updateInfoLogin } from "@/containers/StepLogin/apiClients/authService"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { UserInfo } from "../configs/types"
import { GRADE_OPTIONS } from "@/containers/StepLogin/configs/constants"

const useSetting = () => {
  const [openNoticeDialog, setOpenNoticeDialog] = useState<boolean>(false)
  const [openUpdateUserDialog, setOpenUpdateUserDialog] = useState<boolean>(false)
  const { setLoading, setUser, user, logout } = useAuthStore()
  const { t } = useTranslation()
  const [openSchedule, setOpenSchedule] = useState(false)

  const handleToggleSchedule = () => setOpenSchedule(prev => !prev)

  const handleOpenNoticeDialog = () => setOpenNoticeDialog(true)
  const handleCloseNoticeDialog = () => setOpenNoticeDialog(false)

  const handleOpenUpdateUserDialog = () => setOpenUpdateUserDialog(true)
  const handleCloseUpdateUserDialog = () => setOpenUpdateUserDialog(false)

  const handleUpdateInfo = async (values: UserInfo) => {
    setLoading(true)
    try {

      const res = await updateInfoLogin({ ...values, isMobile: true });
      setUser(res.data)
      toast.success(t('updated_user'))
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
    handleCloseUpdateUserDialog()
  }

  const subjectOptions = useMemo(() => {
    return [
      {
        label: t("liberal_arts"),
        value: t("liberal_arts"),
      },
      {
        label: t("science"),
        value: t("science"),
      },
    ];
  }, [t]);

  const gradeOptions = useMemo(() => {
    return [
      ...GRADE_OPTIONS.map((i) => ({
        ...i,
        label: typeof i.label === "string" ? t(i.label) : i.label,
      })),
    ];
  }, [t]);

  return {
    t,
    logout,
    user,
    gradeOptions,
    subjectOptions,
    handleUpdateInfo,
    openNoticeDialog,
    openSchedule,
    handleToggleSchedule,
    handleOpenNoticeDialog,
    handleCloseNoticeDialog,
    openUpdateUserDialog,
    handleOpenUpdateUserDialog,
    handleCloseUpdateUserDialog
  }
}

export default useSetting