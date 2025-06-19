import useLogin from "@/containers/Login/hooks/useLogin"
import { switchAcademy } from "@/layouts/apiClients/academyServices"
import { navigate } from "@/navigators/NavigationHelpers"
import { Routes } from "@/navigators/RouteName"
import useAuthStore from "@/store/useAuthStore"
import { Role } from "@/utils/enums"
import { getErrorMessage, toast } from "@/utils/helpers"
import { LoginAccessTokenRequest } from "@/utils/types"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

const useSelectAcademy = () => {
  const { t } = useTranslation()
  const { academies, user, setLoading, setSelectAcademy } = useAuthStore()
  const { handleLoginAccessToken } = useLogin()
  const [academy, setAcademy] = useState<number>()

  const handleRedirectHome = () => {
    navigate(Routes.Auth.Home)
  }

  const handleSelectedAcademy = (value: number) => {
    setAcademy(value)
  }

  const academyOptions = useMemo(() => {
    return [
      ...academies.map((i) => ({
        ...i,
        label: i.name,
        value: i.id
      })),
    ];
  }, [t, academies]);

  const handleSwitchAcademy = async (
    isLearningSpace: boolean,
    isLoading: boolean = true,
  ) => {
    isLoading && setLoading(true)
    
    try {
      const selectedAcademy = academies.find((i) => i.id === academy)
      const academyId = selectedAcademy ? selectedAcademy.id : 0
      const academyDomain = selectedAcademy
        ? selectedAcademy.domain
        : undefined
      const res = await switchAcademy(academyId, Role.Student, isLearningSpace)
      const data = res.data
      const requestBody: LoginAccessTokenRequest = {
        accessToken: data.accessToken,
        email: user?.email || "",
        role: Role.Student,
        isMobile: true
      }
      
      await handleLoginAccessToken(
        requestBody,
        isLearningSpace,
        academyDomain,
        false,
      )

      setSelectAcademy(selectedAcademy)
      navigate(Routes.Auth.Home)
    } catch (error) {
      console.log({ error });
      toast.error(getErrorMessage(t, error))
    }
    finally {
      isLoading && setLoading(false)
    }
  }

  return {
    user,
    academy,
    handleSwitchAcademy,
    academyOptions,
    handleRedirectHome,
    handleSelectedAcademy
  }
}

export default useSelectAcademy
