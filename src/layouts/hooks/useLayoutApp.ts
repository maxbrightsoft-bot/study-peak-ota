import { getInfo, getSuperAdminInfoFromWeb } from '@/containers/Login/apiClients/accountService'
import useAuthStore from '@/store/useAuthStore'
import { Role } from '@/utils/enums'
import { getAcademyDomain, getAccessToken, getErrorMessage, getLearningSpace, toast } from '@/utils/helpers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserAcademies, switchAcademy } from '../apiClients/academyServices'
import { AcademyResponse, LoginAccessTokenRequest } from '@/utils/types'
import useLogin from '@/containers/Login/hooks/useLogin'
import { MainRoutes, Routes } from '@/navigators/RouteName'
import { getDataStorage, removeDataStorage } from '@/utils/storage'
import { ACADEMY_DOMAIN, ACCESS_TOKEN, REDIRECT_URL } from '@/utils/constants'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from 'expo-router'
const useLayoutApp = () => {
  const { t } = useTranslation()
  const navigation = useNavigation();
  const { user, academies, setUser, setLoading, logout, setAcademies, setSelectAcademy, initializePusher, pusher, disconnectPusher } = useAuthStore()
  const { handleLoginAccessToken } = useLogin()

  const isNotEnoughStatements = useMemo(() => user?.email && user?.isNotEnoughStatements, [user?.email, user?.isNotEnoughStatements])

  const [academyMenuVisible, setAcademyMenuVisible] = useState(false)
  const [userMenuVisible, setUserMenuVisible] = useState(false)

  const openAcademyMenu = () => setAcademyMenuVisible(true)
  const closeAcademyMenu = () => setAcademyMenuVisible(false)

  const openUserMenu = () => setUserMenuVisible(true)
  const closeUserMenu = () => setUserMenuVisible(false)

  const handleSignOut = async () => {
    await logout()
    closeUserMenu()
    closeAcademyMenu()
  }

  const loadInfo = async () => {
    const token = await getAccessToken()
    if (!token) {
      await logout()
      return
    }

    if (user?.id) return

    setLoading(true)
    try {
      const isLearningSpace = await getLearningSpace()
      const isAcademy = !!(await getAcademyDomain())

      const info =
        isAcademy || isLearningSpace ? await getInfo(Role.Student, isLearningSpace) : await getSuperAdminInfoFromWeb()
      if (!info.data) logout()

      setUser(info.data)
    } catch (err) {
      await logout()
    }
    setLoading(false)
  }

  const needRedirect = async () => {
    const urlRedirect = await getDataStorage(REDIRECT_URL)
    if (!urlRedirect) {
      if (user?.id && isNotEnoughStatements) navigation.navigate(MainRoutes.AuthStack, {
        screen: Routes.Auth.Onboarding
      });
      else navigation.navigate(MainRoutes.AuthStack, {
        screen: !!user?.academyDomain ? Routes.Auth.Home : Routes.Auth.SelectAcademy
      });
    }
    else {
      if (urlRedirect === Routes.UnAuth.Login)
        await logout()
      else
        navigation.navigate(MainRoutes.AuthStack, {
          screen: urlRedirect
        });
    }

    await removeDataStorage(REDIRECT_URL)
  }

  useEffect(() => {
    needRedirect()
  }, [user, isNotEnoughStatements])

  useEffect(() => {
    loadInfo()
  }, [user?.id])

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

  const handleSwitchAcademy = async (
    isLearningSpace: boolean,
    selectedAcademy?: AcademyResponse,
    isLoading: boolean = true,
    redirectUrlProp?: string
  ) => {
    isLoading && setLoading(true)
    try {
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
        redirectUrlProp
      )

      setSelectAcademy(selectedAcademy)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    isLoading && setLoading(false)
    closeAcademyMenu()
  }

  const handleLogOutAcademy = async (
    callback: any
  ) => {
    setLoading(true)
    try {
      const res = await switchAcademy(0, Role.Student)
      const data = res.data
      const requestBody: LoginAccessTokenRequest = {
        accessToken: data.accessToken,
        email: user?.email || "",
        role: Role.Student,
        isMobile: true
      }

      await handleLoginAccessToken(
        requestBody,
        undefined,
        undefined,
        false
      )
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
    callback()
  }

  useEffect(() => {
    if (academies.length) return
    getAcademies()
  }, [user?.academyDomain, user?.email])

  const handleGetSelectedAcademy = () => {
    const academy = academies.find(
      i =>
        i.domain.trim().toLowerCase() ===
        user?.academyDomain?.trim().toLowerCase()
    )

    if (academy) setSelectAcademy(academy)
  }

  useEffect(() => {
    if (!user?.academyDomain) return
    handleGetSelectedAcademy()
  }, [user?.academyDomain])

  const cleanupPusherChannels = () => {
    if (!pusher) return;
    const channels = Array.from(pusher.channels.values());

    channels.forEach(channel => disconnectPusher(pusher, channel))
  };

  useEffect(() => {
    if (pusher) return
    const setupPusher = async () => {
      const academyDomain = await getDataStorage(ACADEMY_DOMAIN) || user?.academyDomain
      const token = await getDataStorage(ACCESS_TOKEN)
      if(!token || !academyDomain) return
      const isLearningSpace = user?.isLearningSpace || false
      await initializePusher(academyDomain, isLearningSpace)
    };

    setupPusher();

    return () => {
      cleanupPusherChannels();
    };
  }, [pusher, user?.academyDomain]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        cleanupPusherChannels()
      }
    }, [])
  )

  return {
    headerProps: {
      academyMenuVisible,
      userMenuVisible,
      closeUserMenu,
      openUserMenu,
      closeAcademyMenu,
      openAcademyMenu,
      handleSignOut,
      handleLogOutAcademy,
      handleSwitchAcademy
    }
  }
}

export default useLayoutApp