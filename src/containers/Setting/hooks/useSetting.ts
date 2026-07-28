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
import { ensureDemoDatabase, isDemoMode, setDemoMode } from "@/demoData/mockInterceptor"
import { getInfoMock } from "@/demoData/containers/Login/authApi"
import { ACCESS_TOKEN, ACADEMY_DOMAIN, LEARNING_SPACE } from "@/utils/constants"
import { setDataStorage, removeDataStorage } from "@/utils/storage"
import { Routes } from "@/navigators/RouteName"
import { reset } from "@/navigators/NavigationHelpers"

export const DEMO_MODE_STORAGE_KEY = 'DEMO_MODE'
export const DEMO_SESSION_BACKUP_STORAGE_KEY = 'DEMO_SESSION_BACKUP'
const DEMO_ACADEMY = { id: 1, domain: 'demo-academy', name: 'Demo Academy', image: '' }

export type DemoSessionBackup = {
  accessToken: string | null
  academyDomain: string | null
  learningSpace: string | null
  user: ReturnType<typeof useAuthStore.getState>['user']
  academies: ReturnType<typeof useAuthStore.getState>['academies']
  selectedAcademy: ReturnType<typeof useAuthStore.getState>['selectedAcademy']
  hasEnteredSelectAcademy: boolean
}

const restoreStorageValue = async (key: string, value: string | null) => {
  if (value) {
    await setDataStorage(key, value)
    return
  }

  await removeDataStorage(key)
}

const getCurrentSessionBackup = async (): Promise<DemoSessionBackup> => {
  const currentStore = useAuthStore.getState()

  return {
    accessToken: await getDataStorage(ACCESS_TOKEN),
    academyDomain: await getDataStorage(ACADEMY_DOMAIN),
    learningSpace: await getDataStorage(LEARNING_SPACE),
    user: currentStore.user,
    academies: currentStore.academies,
    selectedAcademy: currentStore.selectedAcademy,
    hasEnteredSelectAcademy: currentStore.hasEnteredSelectAcademy,
  }
}

const saveCurrentSessionBackup = async () => {
  const backup = await getCurrentSessionBackup()
  await setDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY, JSON.stringify(backup))
}

const activateDemoSession = async (demoUser: any) => {
  setDemoMode(true)
  await setDataStorage(ACCESS_TOKEN, 'demo-token-123')
  await setDataStorage(DEMO_MODE_STORAGE_KEY, 'true')
  await setDataStorage(ACADEMY_DOMAIN, DEMO_ACADEMY.domain)
  await removeDataStorage(LEARNING_SPACE)

  const currentStore = useAuthStore.getState()
  currentStore.setIsDemoMode(true)
  currentStore.setAcademies([DEMO_ACADEMY as any])
  currentStore.setSelectAcademy(DEMO_ACADEMY as any)
  currentStore.setUser({ ...demoUser, academyDomain: DEMO_ACADEMY.domain, isLearningSpace: false } as any)
  currentStore.setRedirectUrl(Routes.Auth.Home)
  currentStore.setHasEnteredSelectAcademy(true)
}

export const restorePreviousSession = async (backup: DemoSessionBackup) => {
  await restoreStorageValue(ACCESS_TOKEN, backup.accessToken)
  await restoreStorageValue(ACADEMY_DOMAIN, backup.academyDomain)
  await restoreStorageValue(LEARNING_SPACE, backup.learningSpace)

  const currentStore = useAuthStore.getState()
  currentStore.setIsDemoMode(false)
  currentStore.setUser(backup.user)
  currentStore.setAcademies(backup.academies || [])
  currentStore.setSelectAcademy(backup.selectedAcademy)
  currentStore.setHasEnteredSelectAcademy(backup.hasEnteredSelectAcademy)
}

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
  const [openDemoDialog, setOpenDemoDialog] = useState(false)
  const [isDemoActive, setIsDemoActive] = useState(false)
  const language = useAuthStore(state => state.language)

  useEffect(() => {
    let isMounted = true

    isDemoMode().then((active) => {
      if (isMounted) setIsDemoActive(active)
    })

    return () => {
      isMounted = false
    }
  }, [])

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

  const handleToggleDemoDialog = () => {
    if (!user) {
      toast.error(t('demo_mode_login_required'))
      return
    }

    setOpenDemoDialog(prev => !prev)
  }

  const handleEnterDemoMode = async () => {
    if (!user) {
      toast.error(t('demo_mode_login_required'))
      return
    }

    setLoading(true)
    setOpenDemoDialog(false)
    try {
      const currentStore = useAuthStore.getState()
      await saveCurrentSessionBackup()
      await currentStore.disconnectPusher(currentStore.pusher, currentStore.channel)

      await ensureDemoDatabase(language?.code ?? 'ko')

      const demoUser = await getInfoMock()
      if (!demoUser) throw new Error('Demo user not found')

      await activateDemoSession(demoUser)
      setIsDemoActive(true)
      reset(Routes.Auth.Home)
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }

  const handleExitDemoMode = async () => {
    setLoading(true)
    try {
      const backupRaw = await getDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)
      if (!backupRaw) {
        toast.error(t('demo_mode_session_not_found'))
        return
      }

      const backup = JSON.parse(backupRaw) as DemoSessionBackup

      setDemoMode(false)
      await removeDataStorage(DEMO_MODE_STORAGE_KEY)
      await removeDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)
      await restorePreviousSession(backup)
      setIsDemoActive(false)
      reset(Routes.Auth.Home)
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
    openDemoDialog,
    isDemoActive,
    handleToggleDemoDialog,
    handleEnterDemoMode,
    handleExitDemoMode,
  }
}

export default useSetting
