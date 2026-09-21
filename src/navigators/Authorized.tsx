import React, { useCallback, useEffect, useMemo, useState } from 'react'
import OnboardingScreen from '@/screens/Onboarding'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Footer from '@/layouts/Footer'
import LayoutApp from '@/layouts'
import TextbookScreen from '@/screens/Textbook'
import HomeScreen from '@/screens/Home'
import ExamResultScreen from '@/screens/ExamResult'
import DoExamScreen from '@/screens/DoExam'
import { hiddenTabBar, Routes } from './RouteName'
import { currentScreen, navigationRef } from './NavigationHelpers'
import useAuthStore from '@/store/useAuthStore'
import DoTextbookScreen from '@/screens/DoTextbook'
import ExamListScreen from '@/screens/ExamList'
import ExamResultListScreen from '@/screens/ExamResultList'
import StudyPerformanceScreen from '@/screens/StudyPerformance'
import ProfileScreen from '@/screens/Profile'
import useLayoutApp from '@/layouts/hooks/useLayoutApp'
import QuestionScreen from '@/screens/Question'
import { Platform, StatusBar, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import StudentExamHistoryScreen from '@/screens/StudentExamHistory'
import PopQuizScreen from '@/containers/PopQuiz'
import ParentAccountLinkingScreen from '@/screens/AccountLinking/ParentList'
import StudentAccountLinkingScreen from '@/screens/AccountLinking/StudentList'
import ParentLinkRequestScreen from '@/screens/AccountLinking/ParentLinkRequest'
import StudentLinkShareScreen from '@/screens/AccountLinking/StudentLinkShare'
import ParentQrScanScreen from '@/screens/AccountLinking/ParentQrScan'
import ParentWaitingApprovalScreen from '@/screens/AccountLinking/ParentWaitingApproval'
import StudentLinkApprovalScreen from '@/screens/AccountLinking/StudentLinkApproval'
import RoleSelectionScreen from '@/screens/AccountLinking/AccountLinkRoleSelection'
import useAccountLinkingPusher from '@/containers/AccountLinking/hooks/useAccountLinkingPusher'
import ConsentScreen from '@/containers/Setting/components/ConsentScreen'
import { getConsentStatusApi, agreeConsentApi } from '@/containers/Setting/apiClients'
import Loading from '@/components/Loading'
import { toast, getErrorMessage, checkIsParent } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import { CONSENT_POLICY_VERSION } from '@/utils/constants'
import { startOfflineSyncListener } from '@/services/offlineSync'
import ChangePasswordDialog from '@/containers/Setting/components/ChangePasswordDialog'
import ResetPasswordWarningDialog from '@/containers/Setting/components/ResetPasswordWarningDialog'
import PopQuizCreateScreen from '@/screens/PopQuiz/Create'
import PopQuizIntroScreen from '@/screens/PopQuiz/Intro'
import PopQuizTakeScreen from '@/screens/PopQuiz/Take'
import PopQuizResultScreen from '@/screens/PopQuiz/Result'

const Tab = createBottomTabNavigator()

const getActiveRouteName = (state: any): string => {
  if (!state) return ''
  const route = state.routes[state.index]
  if (route?.state) {
    return getActiveRouteName(route.state)
  }
  return route?.name || ''
}
const AuthStack = createNativeStackNavigator()
const AccountLinkingStack = createNativeStackNavigator()

const AccountLinkingNavigator = () => {
  useAccountLinkingPusher()

  return (
    <AccountLinkingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AccountLinkingStack.Screen name={Routes.Auth.ParentAccountLinking} component={ParentAccountLinkingScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.StudentAccountLinking} component={StudentAccountLinkingScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.ParentLinkRequest} component={ParentLinkRequestScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.StudentLinkShare} component={StudentLinkShareScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.ParentQrScan} component={ParentQrScanScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.ParentWaitingApproval} component={ParentWaitingApprovalScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.StudentLinkApproval} component={StudentLinkApprovalScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.AccountLinkRoleSelection} component={RoleSelectionScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.PopQuiz} component={PopQuizScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.PopQuizCreate} component={PopQuizCreateScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.PopQuizIntro} component={PopQuizIntroScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.PopQuizTake} component={PopQuizTakeScreen} />
      <AccountLinkingStack.Screen name={Routes.Auth.PopQuizResult} component={PopQuizResultScreen} />
    </AccountLinkingStack.Navigator>
  )
}

const MainTabNavigator = () => {
  const isParentMode = !!useAuthStore((state) => state.parentViewMode?.isActive)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <></>,
        tabBarStyle: hiddenTabBar.includes(route.name) ? { display: 'none', height: 0, position: 'absolute' } : undefined
      })}
      tabBar={(props) => {
        const topRouteName = navigationRef?.current?.isReady?.() ? navigationRef?.current?.getCurrentRoute?.()?.name : undefined
        const currentTab = props.state.routes[props.state.index]
        const activeRouteName = topRouteName || currentTab?.name || currentScreen()

        if (hiddenTabBar.includes(activeRouteName)) {
          return null
        }
        return <Footer {...props} />
      }}
    >
      <Tab.Screen name={Routes.Auth.Home} component={HomeScreen} />
      <Tab.Screen name={Routes.Auth.Textbook} component={TextbookScreen} />
      {!isParentMode && (
        <>
          <Tab.Screen name={Routes.Auth.DoExam} component={DoExamScreen} />
          <Tab.Screen name={Routes.Auth.DoTextbook} component={DoTextbookScreen} />
        </>
      )}
      <Tab.Screen name={Routes.Auth.ExamList} component={ExamListScreen} />
      <Tab.Screen name={Routes.Auth.ExamResult} component={ExamResultScreen} />
      <Tab.Screen name={Routes.Auth.ExamResultList} component={ExamResultListScreen} />
      <Tab.Screen name={Routes.Auth.StudyPerformance} component={StudyPerformanceScreen} />
      <Tab.Screen name={Routes.Auth.Profile} component={ProfileScreen} />
      <Tab.Screen name={Routes.Auth.Question} component={QuestionScreen} />
      <Tab.Screen name={Routes.Auth.StudentExamHistory} component={StudentExamHistoryScreen} />
      <Tab.Screen name={Routes.Auth.PopQuiz} component={PopQuizScreen} />
      <Tab.Screen name={Routes.Auth.PopQuizCreate} component={PopQuizCreateScreen} />
      <Tab.Screen name={Routes.Auth.PopQuizIntro} component={PopQuizIntroScreen} />
      <Tab.Screen name={Routes.Auth.PopQuizTake} component={PopQuizTakeScreen} />
      <Tab.Screen name={Routes.Auth.PopQuizResult} component={PopQuizResultScreen} />
    </Tab.Navigator>
  )
}

const Authorized = ({ route }: { route: any }) => {
  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const hasConsented = useAuthStore(state => state.hasConsented)
  const setHasConsented = useAuthStore(state => state.setHasConsented)
  const [isCheckingConsent, setIsCheckingConsent] = useState(true)
  const language = useAuthStore(state => state.language)
  const isDemo = useAuthStore(state => state.isDemoMode)
  const languageKey = isDemo ? language?.code : undefined
  const linkedStudents = useAuthStore(state => state.linkedStudents)
  const isUserCustomLoaded = useAuthStore(state => state.isUserCustomLoaded)
  const isParent = checkIsParent();
  const isParentNoChildren = isParent && linkedStudents?.length === 0

  const { headerProps } =
    useLayoutApp()
  const { t } = useTranslation()

  const mustChangePassword = !!user?.mustChangePassword
  const [hasConfirmedWarning, setHasConfirmedWarning] = useState(false)
  const [isMustChangePasswordDismissed, setIsMustChangePasswordDismissed] = useState(false)

  useEffect(() => {
    if (mustChangePassword) {
      setHasConfirmedWarning(false)
      setIsMustChangePasswordDismissed(false)
    }
  }, [mustChangePassword])

  const isNotEnoughStatements = useMemo(
    () => user?.email && user?.isNotEnoughStatements,
    [user?.email, user?.isNotEnoughStatements]
  )

  useEffect(() => {
    if (checkIsParent()) return
    const unsubscribeSync = startOfflineSyncListener()
    return () => {
      unsubscribeSync?.()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkConsent = async () => {
      try {
        const res = await getConsentStatusApi()
        if (!isMounted) return

        if (res.data) {
          const consented = !!res.data.privacyPolicyAgreed && !!res.data.termsOfServiceAgreed
          setHasConsented(consented)
        } else {
          setHasConsented(false)
        }
      } catch (error) {
        if (isMounted) setHasConsented(true)
      } finally {
        if (isMounted) setIsCheckingConsent(false)
      }
    }
    checkConsent()

    return () => {
      isMounted = false
    }
  }, [setHasConsented])

  const handleConsentAgree = useCallback(async () => {
    try {
      setLoading(true)
      await agreeConsentApi(CONSENT_POLICY_VERSION)
      setHasConsented(true)
      toast.success(t('consent_saved'))
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }, [t, setLoading])

  if (isCheckingConsent || (isParent && !isUserCustomLoaded)) {
    return <Loading isOverlay />
  }

  if (hasConsented === false) {
    return <ConsentScreen onAgree={handleConsentAgree} />
  }

  if (isNotEnoughStatements && !isParent && Platform.OS !== 'ios')
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tab.Screen name={Routes.Auth.Onboarding} component={OnboardingScreen} />
      </Tab.Navigator>
    )

  return (
    <>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name={Routes.Auth.MainTabs}>
          {() => (
            <LayoutApp headerProps={headerProps} key={languageKey}>
              {isParentNoChildren ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF' }}>
                  <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ionicons name="people-outline" size={36} color="#5F30AA" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#222222', textAlign: 'center', marginBottom: 8 }}>
                    {t('no_linked_children_in_academy')}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: 18 }}>
                    {t('select_another_academy_desc')}
                  </Text>
                </View>
              ) : (
                <MainTabNavigator />
              )}
            </LayoutApp>
          )}
        </AuthStack.Screen>
        <AuthStack.Screen name={Routes.Auth.AccountLinkingGroup}>
          {() => (
            <LayoutApp headerProps={headerProps} hideHeader={true} key={languageKey}>
              <StatusBar barStyle="dark-content" backgroundColor="#FAFAFB" animated />
              <AccountLinkingNavigator />
            </LayoutApp>
          )}
        </AuthStack.Screen>
      </AuthStack.Navigator>
      <ChangePasswordDialog
        visible={mustChangePassword && hasConfirmedWarning && !isMustChangePasswordDismissed}
        onClose={() => setIsMustChangePasswordDismissed(true)}
        cancelText={t('change_later')}
      />
      <ResetPasswordWarningDialog
        visible={mustChangePassword && !hasConfirmedWarning && !isMustChangePasswordDismissed}
        onClose={() => setIsMustChangePasswordDismissed(true)}
        onConfirm={() => setHasConfirmedWarning(true)}
      />
    </>
  )
}

export default Authorized


