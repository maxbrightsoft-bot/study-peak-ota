import { useCallback, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import useAuthStore from "@/store/useAuthStore"
import useLogin from "@/containers/Login/hooks/useLogin"
import { switchAcademy } from "@/layouts/apiClients/academyServices"
import { Role } from "@/utils/enums"
import { AcademyResponse, LoginAccessTokenRequest } from "@/utils/types"
import { getDataStorage, removeDataStorage, setDataStorage } from "@/utils/storage"
import { getErrorMessage, toast } from "@/utils/helpers"
import { setDemoMode } from "@/demoData/mockInterceptor"
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { reset } from "@/navigators/NavigationHelpers"
import { DEMO_MODE_STORAGE_KEY, DEMO_SESSION_BACKUP_STORAGE_KEY, DemoSessionBackup, restorePreviousSession } from "@/containers/Setting/hooks/useSetting"

export const useAcademyDeepLink = (targetDomain?: string, targetRoute?: string) => {
  const { t } = useTranslation()
  const route = useRoute<any>()
  const user = useAuthStore(state => state.user)
  const academies = useAuthStore(state => state.academies)
  const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
  const setSelectAcademy = useAuthStore(state => state.setSelectAcademy)
  const { handleLoginAccessToken } = useLogin()
  const isSwitchingAcademy = useRef<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(!targetDomain)

  const exitDemoMode = async () => {
    const demoMode = await getDataStorage(DEMO_MODE_STORAGE_KEY)
    if (demoMode === 'true') {
      const backupRaw = await getDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)
      setDemoMode(false)
      await removeDataStorage(DEMO_MODE_STORAGE_KEY)
      await removeDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)

      if (backupRaw) {
        try {
          const backup = JSON.parse(backupRaw) as DemoSessionBackup
          await restorePreviousSession(backup)
        } catch (e) {
          useAuthStore.getState().setIsDemoMode(false)
        }
      } else {
        useAuthStore.getState().setIsDemoMode(false)
      }

      if (targetRoute) {
        reset(targetRoute, route?.params)
      }
    }
    return demoMode === 'true';
  }

  const handleSwitchAcademy = async (targetAcademy: AcademyResponse) => {
    setLoadingWithoutOverlay(true)
    try {
      const res = await switchAcademy(targetAcademy.id, Role.Student, false)
      const data = res.data
      const requestBody: LoginAccessTokenRequest = {
        accessToken: data.accessToken,
        email: user?.email || '',
        role: Role.Student,
        isMobile: true
      }

      await handleLoginAccessToken(
        requestBody,
        false,
        targetAcademy.domain,
        false,
        targetRoute
      )

      setSelectAcademy(targetAcademy)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      throw error
    } finally {
      setLoadingWithoutOverlay(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      const checkAndSwitchDomain = async () => {
        if (!targetDomain) {
          return
        }

        const isDemo = (await getDataStorage(DEMO_MODE_STORAGE_KEY)) === 'true'
        if (isDemo) {
          await exitDemoMode()
          return
        }
        if (user?.academyDomain === targetDomain) {
          setIsReady(true)
          return
        }
        setIsReady(false)
        const targetAcademy = academies?.find(a => a.domain === targetDomain)
        if (targetAcademy) {
          try {
            await handleSwitchAcademy(targetAcademy)
          } catch (error) {
            toast.error(getErrorMessage(t, error))
          } finally {
            setIsReady(true)
            isSwitchingAcademy.current = false
          }
        }
      }
      checkAndSwitchDomain()
    }, [targetDomain, user?.academyDomain, academies])
  )

  return {
    isReady,
    handleSwitchAcademy
  }
}
