import { updateInfoLogin } from "@/containers/StepLogin/apiClients/authService"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { UserInfo } from "../configs/types"
import { GRADE_OPTIONS } from "@/containers/StepLogin/configs/constants"
import { getDataStorage } from "@/utils/storage"
import { APPLE_USER_KEY } from "@/utils/constants"
import { removeAccountApi, agreeConsentApi } from "../apiClients"
import { useLanguage } from "@/hooks/useLanguage"
import { POLICY_VERSION } from "../configs/policyContent"

const useSetting = () => {
  const [openNoticeDialog, setOpenNoticeDialog] = useState<boolean>(false)
  const [openUpdateUserDialog, setOpenUpdateUserDialog] = useState<boolean>(false)
  const setLoading = useAuthStore(state => state.setLoading)
  const setUser = useAuthStore(state => state.setUser)
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const { t } = useTranslation()
  const [openSchedule, setOpenSchedule] = useState(false)
  const [openConfirmRemoveAccount, setOpenConfirmRemoveAccount] = useState(false)
  const [openLanguageDialog, setOpenLanguageDialog] = useState(false)
  const { changeLanguage } = useLanguage()

  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false)
  const [openTermsOfService, setOpenTermsOfService] = useState(false)
  const [privacyPolicyAgreed, setPrivacyPolicyAgreed] = useState(false)
  const [termsOfServiceAgreed, setTermsOfServiceAgreed] = useState(false)

  const handleTogglePrivacyPolicy = () => setOpenPrivacyPolicy(prev => !prev)
  const handleToggleTermsOfService = () => setOpenTermsOfService(prev => !prev)

  const handleToggleLanguageDialog = () => setOpenLanguageDialog(prev => !prev)

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
        label: t("none"),
        value: '',
      },
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
      toast.success(t('removed_account_success'))
      handleToggleConfirmRemoveAccount()
      setTimeout(() => logout(), 1000)
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
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
    handleToggleConfirmRemoveAccount,
    openLanguageDialog,
    handleToggleLanguageDialog,
    changeLanguage,
    openPrivacyPolicy,
    openTermsOfService,
    privacyPolicyAgreed,
    termsOfServiceAgreed,
    handleTogglePrivacyPolicy,
    handleToggleTermsOfService,
  }
}

export default useSetting
