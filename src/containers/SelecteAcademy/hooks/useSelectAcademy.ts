import useLogin from "@/containers/Login/hooks/useLogin"
import { getUserAcademies, switchAcademy } from "@/layouts/apiClients/academyServices"
import { navigate } from "@/navigators/NavigationHelpers"
import { Routes } from "@/navigators/RouteName"
import useAuthStore from "@/store/useAuthStore"
import { Role } from "@/utils/enums"
import { getErrorMessage, toast } from "@/utils/helpers"
import { AcademyResponse, LoginAccessTokenRequest } from "@/utils/types"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

const useSelectAcademy = () => {
  const { t } = useTranslation()
  const { academies, user, setLoading, setAcademies, setSelectAcademy, setHasEnteredSelectAcademy } = useAuthStore()
  const { handleLoginAccessToken } = useLogin()
  const [academy, setAcademy] = useState<number>()

  const getAcademies = async (isLoading: boolean = true) => {
    if (!user) return
    isLoading && setLoading(true)
    try {
      const res = await getUserAcademies(Role.Student, user.isLearningSpace)
      const items: AcademyResponse[] = res.data.items || []
      setAcademies(items)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    isLoading && setLoading(false)
  }

  useEffect(() => {
    if (academies.length) return
    getAcademies()
  }, [user?.academyDomain, user?.email])

  const handleSelectedAcademy = (value: number) => {
    setAcademy(value)
  }

  const academyOptions = useMemo(() => {
    return [
      {
        label: t('my_study_space'),
        value: undefined
      },
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
      setHasEnteredSelectAcademy(true)
      isLoading && setLoading(false)
    }
  }

  return {
    user,
    academy,
    handleSwitchAcademy,
    academyOptions,
    handleSelectedAcademy
  }
}

export default useSelectAcademy
