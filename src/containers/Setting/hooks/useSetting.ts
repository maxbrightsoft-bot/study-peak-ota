import { updateInfoLogin } from "@/containers/StepLogin/apiClients/authService"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { UserInfo } from "../configs/types"
import { GRADE_OPTIONS } from "@/containers/StepLogin/configs/constants"
import { getDataStorage } from "@/utils/storage"
import { APPLE_USER_KEY } from "@/utils/constants"
import { removeAccountApi } from "../apiClients"

const useSetting = () => {
  const [openNoticeDialog, setOpenNoticeDialog] = useState<boolean>(false)
  const [openUpdateUserDialog, setOpenUpdateUserDialog] = useState<boolean>(false)
  const { setLoading, setUser, user, logout } = useAuthStore()
  const { t } = useTranslation()
  const [openSchedule, setOpenSchedule] = useState(false)
  const [openConfirmRemoveAccount, setOpenConfirmRemoveAccount] = useState(false)

  const handleToggleConfirmRemoveAccount = () => setOpenConfirmRemoveAccount(prev => !prev)

  const handleToggleSchedule = () => setOpenSchedule(prev => !prev)

  const handleOpenNoticeDialog = () => setOpenNoticeDialog(true)
  const handleCloseNoticeDialog = () => setOpenNoticeDialog(false)

  const handleOpenUpdateUserDialog = () => setOpenUpdateUserDialog(true)
  const handleCloseUpdateUserDialog = () => setOpenUpdateUserDialog(false)

  const handleUpdateInfo = async (values: UserInfo) => {
    setLoading(true)
    try {
      const isAppleLogin = !!(await getDataStorage(APPLE_USER_KEY))

      const res = await updateInfoLogin({ ...values, isAppleLogin });
      
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

  const handleRemoveAccount = async () => {
    try {
      setLoading(true)
      await removeAccountApi()
      logout()
      toast.success(t('removed_account'))
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
      handleToggleConfirmRemoveAccount()
    }
  }

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
    handleCloseUpdateUserDialog,
    handleRemoveAccount,
    openConfirmRemoveAccount,
    handleToggleConfirmRemoveAccount
  }
}

export default useSetting