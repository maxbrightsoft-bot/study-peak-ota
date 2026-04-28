import { getInfo, getSuperAdminInfoFromWeb } from '@/containers/Login/apiClients/accountService'
import useAuthStore from '@/store/useAuthStore'
import { Role } from '@/utils/enums'
import { getAcademyDomain, getAccessToken, getErrorMessage, getLearningSpace, toast } from '@/utils/helpers'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAcademyDetailApi, getUserAcademies, switchAcademy } from '../apiClients/academyServices'
import { AcademyResponse, LoginAccessTokenRequest } from '@/utils/types'
import useLogin from '@/containers/Login/hooks/useLogin'
import { getDataStorage } from '@/utils/storage'
import { ACADEMY_DOMAIN, ACCESS_TOKEN } from '@/utils/constants'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import useTimers from './useTimer'
import useAlarm from './useAlarm'
import { getSocket, initSocket } from '@/services'
import { AppState } from 'react-native'
import { currentScreen, navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { apiJoinExam } from '@/containers/DoExam/apiClients'
import { PusherChannel } from '@pusher/pusher-websocket-react-native'

const useLayoutApp = () => {
  const { t } = useTranslation()
  const navigation = useNavigation();
  const { user, academies, setUser, setLoadingWithoutOverlay, logout, setAcademies, setSelectAcademy, initializePusher, pusher, subscribeChannel, disconnectPusher, redirectUrl, clearRedirectUrl } = useAuthStore()
  const { handleLoginAccessToken } = useLogin()
  const superId = user?.superId
  const [academyMenuVisible, setAcademyMenuVisible] = useState(false)
  const [userMenuVisible, setUserMenuVisible] = useState(false)
  const [openNoticeDialog, setOpenNoticeDialog] = useState<boolean>(false)
  const appState = useRef(AppState.currentState)
  const generalChannel = useRef<PusherChannel>();

  const handleOpenNoticeDialog = () => setOpenNoticeDialog(true)
  const handleCloseNoticeDialog = () => setOpenNoticeDialog(false)

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

    setLoadingWithoutOverlay(true)
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
    setLoadingWithoutOverlay(false)
  }

  const getAcademies = async (isLoading: boolean = true) => {
    if (!user) return
    isLoading && setLoadingWithoutOverlay(true)
    try {
      const res = await getUserAcademies(Role.Student, user.isLearningSpace)
      const items: AcademyResponse[] = res.data.items || []
      setAcademies(items)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    isLoading && setLoadingWithoutOverlay(false)
  }

  const handleGetAcademyDetail = async () => {

    setLoadingWithoutOverlay(true)
    try {
      const info = await getAcademyDetailApi()
      if (info) {
        setSelectAcademy(info.data)
      }
    } catch (err) {
      console.log({ err })
      toast.error(getErrorMessage(t, err))
    }
    setLoadingWithoutOverlay(false)
  }

  useEffect(() => {
    if (academies.length) return
    getAcademies()
  }, [user?.academyDomain, user?.email])

  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        navigation.navigate(redirectUrl as never);
        clearRedirectUrl();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        loadInfo()
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const handleExamStart = async (data: any) => {
    const { code, academy } = data;

    if (currentScreen() === Routes.Auth.DoExam) return;
    setLoadingWithoutOverlay(true)
    try {
      if (user?.academyDomain !== academy.domain)
        await handleSwitchAcademy(academy);
      await apiJoinExam(code, true);
      navigate(Routes.Auth.DoExam, { examCode: code });
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  const handleExamReStart = async (data: any) => {
    const item = JSON.parse(data);

    const { code, academy } = item;

    if (currentScreen() === Routes.Auth.DoExam) return;
    setLoadingWithoutOverlay(true)
    try {
      if (user?.academyDomain !== academy.domain)
        await handleSwitchAcademy(academy);
      await apiJoinExam(code, true);
      navigate(Routes.Auth.DoExam, { examCode: code });
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  const handleSwitchAcademy = async (
    isLearningSpace: boolean,
    selectedAcademy?: AcademyResponse,
    isLoading: boolean = true,
    redirectUrlProp?: string
  ) => {
    isLoading && setLoadingWithoutOverlay(true)
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
    isLoading && setLoadingWithoutOverlay(false)
    closeAcademyMenu()
  }

  const handleGeneralListener = async () => {
    try {
      if (!pusher || !superId) return;

      const channelName = `GENERAL-${superId}-CHANNEL`;

      const generalHandlers = {
        "LOGOUT": logout,
        "start-exam": handleExamStart,
        "restart-exam": handleExamReStart,
      };

      const handlers = Object.entries(generalHandlers).map(
        ([eventName, handler]) => ({
          eventName,
          handler,
        })
      );

      generalChannel.current = await subscribeChannel(
        pusher,
        channelName,
        handlers
      );
    } catch (err) {
      console.error("General subscription failed", err);
    }
  };

  useEffect(() => {
    handleGeneralListener();
  }, [pusher, superId, user?.academyDomain]);

  const handleLogOutAcademy = async (
    callback: any
  ) => {
    setLoadingWithoutOverlay(true)
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
    setLoadingWithoutOverlay(false)
    callback()
  }

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
      if (!token || !academyDomain) return
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
      handleGetAcademyDetail()
      return () => {
        cleanupPusherChannels()
      }
    }, [user?.academyDomain])
  )

  useEffect(() => {
    const startSocket = async () => {
      const socket = await initSocket()

      const token = await getAccessToken()
      const academyDomain = await getAcademyDomain()
      const isLearningSpace = await getLearningSpace()

      socket.auth = {
        token,
        academyDomain,
        super: `${!isLearningSpace && !academyDomain}`
      }

      socket.connect()

      socket.on('connect', () => {
        console.log('SOCKET CONNECTED', socket.id)
      })

      socket.on('connect_error', err => {
        console.log('CONNECT ERROR', err.message)
      })
    }

    startSocket()

    return () => {
      const socket = getSocket()
      socket?.disconnect()
    }
  }, [])

  return {
    headerProps: {
      openNoticeDialog,
      handleOpenNoticeDialog,
      handleCloseNoticeDialog,
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