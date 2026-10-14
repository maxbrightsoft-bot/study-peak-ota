import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, getStateFromPath as defaultGetStateFromPath } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import NavigationHelpers from './NavigationHelpers'
import Authorized from './Authorized'
import UnAuthorized from './UnAuthorized'
import useAuthStore from '@/store/useAuthStore'
import { useLanguage } from '@/hooks/useLanguage'
import { useSocketInit } from '@/hooks/useSocketInit'
import Loading from '@/components/Loading'
import Toast from 'react-native-toast-message'
import { PaperProvider } from 'react-native-paper'
import { MainRoutes, Routes } from './RouteName'
import RNBootSplash from 'react-native-bootsplash'
import { audioToastConfig } from '@/layouts/partials/Alarm/AudioToastContent'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { IOS_GOOGLE_CLIENT_ID, WEB_GOOGLE_CLIENT_ID } from '@/utils/constants'
import AcademyRequestScreen from '@/screens/AcademyRequest'
import AcademyInvitationScreen from '@/screens/AcademyInvitation'
import TutorialScreen from '@/screens/Tutorial'
import { toast } from '@/utils/helpers'
import i18next from 'i18next'
import { isDemoMode } from '@/demoData/mockInterceptor'
import { KeyboardProvider } from 'react-native-keyboard-controller'

const Stack = createNativeStackNavigator()

GoogleSignin.configure({
  iosClientId: IOS_GOOGLE_CLIENT_ID,
  webClientId: WEB_GOOGLE_CLIENT_ID,
  offlineAccess: false
})

const linking: any = {
  prefixes: [
    'com.max.britghtsoft.touchstudymobile://',
    'exp+touch-study-mobile://',
    'https://rsglhbbr-8080.asse.devtunnels.ms',
    'https://student.studypeak.io',
    'https://student-studypeak.brightsoftsolution.com'
  ],
  config: {
    screens: {
      [Routes.AcademyLogin]: 'login/:domain',
      [Routes.AcademyRequest]: 'student/requests/:domain',
      [Routes.AcademyInvitation]: ':domain/invitations',
      [MainRoutes.AuthStack]: {
        screens: {
          [Routes.Auth.MainTabs]: {
            screens: {
              [Routes.Auth.ExamResultList]: 'student/exam-results/:domain',
              [Routes.Auth.ExamResult]: 'student/exam-results/details/:domain',
            },
          },
        },
      },
      [MainRoutes.UnAuthStack]: {
        screens: {
          [Routes.UnAuth.Login]: 'login/:domain?',
        },
      },
    },
  },
  getStateFromPath(path: string, options: any) {
    const loginMatch = path.match(/^\/?login\/([^/?]+)/)
    if (loginMatch?.[1]) {
      return {
        routes: [{
          name: MainRoutes.UnAuthStack,
          state: {
            routes: [{ name: Routes.UnAuth.Login, params: { domain: loginMatch[1] } }]
          }
        }],
      }
    }
    const requestMatch = path.match(/^\/?(?:student\/)?requests\/([^/?]+)(?:\?(.*))?$/)
    if (requestMatch?.[1]) {
      const domain = requestMatch[1]
      const query = requestMatch[2] ?? ''
      const classMatch = query.match(/(?:^|&)class=([^&]+)/)
      const classParam = classMatch ? classMatch[1] : null
      return {
        routes: [{
          name: Routes.AcademyRequest,
          params: { domain, ...(classParam ? { class: classParam } : {}) },
        }],
      }
    }
    if (path.includes('student/exam-results') || path.includes('student/exam-result')) {
      const user = useAuthStore.getState().user
      const state = defaultGetStateFromPath(path, options)
      const authRoute = state?.routes?.find((r: any) => r.name === MainRoutes.AuthStack)
      const mainTabsRoute = (authRoute?.state as any)?.routes?.find((r: any) => r.name === Routes.Auth.MainTabs)

      const isExamResultRoute = path.includes('student/exam-results/details') || path.includes('student/exam-result')
      const targetScreen = isExamResultRoute ? Routes.Auth.ExamResult : Routes.Auth.ExamResultList

      const examRoute = (mainTabsRoute?.state as any)?.routes?.find((r: any) => r.name === targetScreen)
      const params = examRoute?.params
      const targetDomain = params?.domain

      const isDemoMode = useAuthStore.getState().isDemoMode
      const academies = useAuthStore.getState().academies
      const isCheckLinkAccount =
        params?.isCheckLinkAccount === 'true' || params?.isCheckLinkAccount === true
        
      if (!user?.id) {
        useAuthStore.getState().setPendingRedirectUrl(targetScreen, params)
        const hasSeenTutorial = useAuthStore.getState().hasSeenTutorial

        return {
          routes: [{
            name: MainRoutes.UnAuthStack,
            state: {
              routes: [{
                name: hasSeenTutorial ? Routes.UnAuth.Login : Routes.UnAuth.Tutorial,
              }]
            }
          }],
        }
      }

      if (!isCheckLinkAccount && !isDemoMode && targetDomain && academies?.length > 0) {
        const isAcademyExist = academies.some((a: any) => a.domain === targetDomain)
        if (!isAcademyExist) {
          toast.error(i18next.t('academy_not_found'))
          return undefined
        }
      }

      return {
        routes: [{
          name: MainRoutes.AuthStack,
          state: {
            routes: [{
              name: Routes.Auth.MainTabs,
              state: {
                routes: [{
                  name: targetScreen,
                  params,
                }],
              },
            }],
          },
        }],
      }
    }
    return defaultGetStateFromPath(path, options)
  },
}

const RootNavigation: React.FC = () => {
  const user = useAuthStore(state => state.user)
  const isLoading = useAuthStore(state => state.isLoading)
  const setCrashlyticsUser = useAuthStore(state => state.setCrashlyticsUser)
  const isLoadingWithoutOverlay = useAuthStore(state => state.isLoadingWithoutOverlay)
  const setLoading = useAuthStore(state => state.setLoading)
  const hasSeenTutorial = useAuthStore(state => state.hasSeenTutorial)
  const setIsDemoMode = useAuthStore(state => state.setIsDemoMode)
  const setIsMustChangePasswordDismissed = useAuthStore(state => state.setIsMustChangePasswordDismissed)
  const mustChangePassword = !!user?.mustChangePassword
  useLanguage()
  useSocketInit()

  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])

  useEffect(() => {
    setLoading(false)
    isDemoMode().then(setIsDemoMode)
  }, [])

  useEffect(() => {
    if (user?.id) {
      setCrashlyticsUser(user)
    }
  }, [user?.id])

  useEffect(() => {
    if (mustChangePassword) {
      setIsMustChangePasswordDismissed(false)
    }
  }, [mustChangePassword])

  if (!hydrated) {
    return null
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <PaperProvider>
          <NavigationContainer
            linking={linking}
            onReady={() => RNBootSplash.hide()}
            onStateChange={() => {
              useAuthStore.getState().setLoading(false)
              useAuthStore.getState().setLoadingWithoutOverlay(false)
            }}
            ref={(navigatorRef) => {
              if (navigatorRef) {
                NavigationHelpers.setTopLevelNavigator(navigatorRef)
              }
            }}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!user?.id ? (
                <Stack.Screen
                  name={MainRoutes.UnAuthStack}
                  component={UnAuthorized}
                  initialParams={{ tutorialSeen: hasSeenTutorial }}
                />
              ) : (
                <Stack.Screen name={MainRoutes.AuthStack} component={Authorized} />
              )}
              <Stack.Screen name={Routes.AcademyRequest} component={AcademyRequestScreen} />
              <Stack.Screen name={Routes.AcademyInvitation} component={AcademyInvitationScreen} />
              <Stack.Screen name={Routes.Auth.Tutorial} component={TutorialScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          {isLoading && <Loading isOverlay />}
          {!isLoading && isLoadingWithoutOverlay && <Loading />}
        </PaperProvider>
      </KeyboardProvider>
      <Toast config={audioToastConfig} position="top" topOffset={10} />
    </SafeAreaProvider>
  )
}

export default RootNavigation