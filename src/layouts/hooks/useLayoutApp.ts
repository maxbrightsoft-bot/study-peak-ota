import { getInfo, getSuperAdminInfoFromWeb } from '@/containers/Login/apiClients/accountService'
import useAuthStore from '@/store/useAuthStore'
import { Role } from '@/utils/enums'
import { getAcademyDomain, getAccessToken, getErrorMessage, getLearningSpace, toast } from '@/utils/helpers'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAcademyDetailApi, getUserAcademies, switchAcademy } from '../apiClients/academyServices'
import { AcademyResponse, LoginAccessTokenRequest } from '@/utils/types'
import useLogin from '@/containers/Login/hooks/useLogin'
import { getDataStorage, removeDataStorage, setDataStorage } from '@/utils/storage'
import { ACADEMY_DOMAIN, ACCESS_TOKEN, LEARNING_SPACE } from '@/utils/constants'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import useTimers from './useTimer'
import useAlarm from './useAlarm'

import { AppState } from 'react-native'
import { currentScreen, navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { apiJoinExam } from '@/containers/DoExam/apiClients'
import { PusherChannel } from '@pusher/pusher-websocket-react-native'

const useLayoutApp = () => {
  const { t } = useTranslation()
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user)
  const academies = useAuthStore(state => state.academies)
  const setUser = useAuthStore(state => state.setUser)
  const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
  const logout = useAuthStore(state => state.logout)
  const setAcademies = useAuthStore(state => state.setAcademies)
  const setSelectAcademy = useAuthStore(state => state.setSelectAcademy)
  const initializePusher = useAuthStore(state => state.initializePusher)
  const pusher = useAuthStore(state => state.pusher)
  const subscribeChannel = useAuthStore(state => state.subscribeChannel)
  const disconnectPusher = useAuthStore(state => state.disconnectPusher)
  const redirectUrl = useAuthStore(state => state.redirectUrl)
  const redirectParams = useAuthStore(state => state.redirectParams)
  const clearRedirectUrl = useAuthStore(state => state.clearRedirectUrl)
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
    const academyDomain = await getDataStorage(ACADEMY_DOMAIN)
    if (!academyDomain) {
      setSelectAcademy(null)
      return
    }

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
        (navigation as any).navigate(redirectUrl, redirectParams);
        clearRedirectUrl();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [redirectUrl, redirectParams]);

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
    // Demo Mode: chỉ cập nhật store, không gọi API thật
    const demoMode = await getDataStorage('DEMO_MODE');
    if (demoMode === 'true') {
      if (selectedAcademy) {
        await setDataStorage(ACADEMY_DOMAIN, selectedAcademy.domain);
        await removeDataStorage(LEARNING_SPACE);
        setUser({ ...user!, academyDomain: selectedAcademy.domain, isLearningSpace: false } as any);
        setSelectAcademy(selectedAcademy);
      } else {
        // "My study space" - xóa academyDomain → Footer hiển thị 3 tab
        await removeDataStorage(ACADEMY_DOMAIN);
        await setDataStorage(LEARNING_SPACE, 'true');
        setUser({ ...user!, academyDomain: '', isLearningSpace } as any);
        setSelectAcademy(null);
      }
      closeAcademyMenu();
      return;
    }

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