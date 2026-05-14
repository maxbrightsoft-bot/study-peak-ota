import React, { useCallback, useEffect, useMemo, useState } from 'react'
import OnboardingScreen from '@/screens/Onboarding'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Footer from '@/layouts/Footer'
import LayoutApp from '@/layouts'
import TextbookScreen from '@/screens/Textbook'
import HomeScreen from '@/screens/Home'
import ExamResultScreen from '@/screens/ExamResult'
import DoExamScreen from '@/screens/DoExam'
import { hiddenTabBar, Routes } from './RouteName'
import { currentScreen } from './NavigationHelpers'
import useAuthStore from '@/store/useAuthStore'
import DoTextbookScreen from '@/screens/DoTextbook'
import ExamListScreen from '@/screens/ExamList'
import ExamResultListScreen from '@/screens/ExamResultList'
import StudyPerformanceScreen from '@/screens/StudyPerformance'
import ProfileScreen from '@/screens/Profile'
import useLayoutApp from '@/layouts/hooks/useLayoutApp'
import QuestionScreen from '@/screens/Question'
import { Platform } from 'react-native'
import StudentExamHistoryScreen from '@/screens/StudentExamHistory'
import ConsentScreen from '@/containers/Setting/components/ConsentScreen'
import { getConsentStatusApi, agreeConsentApi } from '@/containers/Setting/apiClients'
import { toast, getErrorMessage } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import { CONSENT_POLICY_VERSION } from '@/utils/constants'

const Tab = createBottomTabNavigator()
const Authorized = ({ route }: { route: any }) => {
  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const hasConsented = useAuthStore(state => state.hasConsented)
  const setHasConsented = useAuthStore(state => state.setHasConsented)
  const { headerProps } =
    useLayoutApp()
  const { t } = useTranslation()

  const isNotEnoughStatements = useMemo(
    () => user?.email && user?.isNotEnoughStatements,
    [user?.email, user?.isNotEnoughStatements]
  )

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const res = await getConsentStatusApi()
        if (res.data) {
          const consented = !!res.data.privacyPolicyAgreed && !!res.data.termsOfServiceAgreed
          setHasConsented(consented)
        } else {
          setHasConsented(false)
        }
      } catch (error) {
        setHasConsented(false)
      }
    }
    checkConsent()
  }, [])

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

  if (hasConsented === false) {
    return <ConsentScreen onAgree={handleConsentAgree} />
  }

  if (isNotEnoughStatements && Platform.OS !== 'ios')
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tab.Screen name={Routes.Auth.Onboarding} component={OnboardingScreen} />
      </Tab.Navigator>
    )

  return (
    <LayoutApp headerProps={headerProps}>
      <Tab.Navigator
        screenOptions={{
          header: (props) => <></>
        }}
        tabBar={(props) => !hiddenTabBar.some((i) => i === currentScreen()) && <Footer {...props} />}
      >
        <Tab.Screen name={Routes.Auth.Home} component={HomeScreen} />
        <Tab.Screen name={Routes.Auth.Textbook} component={TextbookScreen} />
        <Tab.Screen name={Routes.Auth.DoExam} component={DoExamScreen} />
        <Tab.Screen name={Routes.Auth.DoTextbook} component={DoTextbookScreen} />
        <Tab.Screen name={Routes.Auth.ExamList} component={ExamListScreen} />
        <Tab.Screen name={Routes.Auth.ExamResult} component={ExamResultScreen} />
        <Tab.Screen name={Routes.Auth.ExamResultList} component={ExamResultListScreen} />
        <Tab.Screen name={Routes.Auth.StudyPerformance} component={StudyPerformanceScreen} />
        <Tab.Screen name={Routes.Auth.Profile} component={ProfileScreen} />
        <Tab.Screen name={Routes.Auth.Question} component={QuestionScreen} />
        <Tab.Screen name={Routes.Auth.StudentExamHistory} component={StudentExamHistoryScreen} />
      </Tab.Navigator>
    </LayoutApp>
  )
}

export default Authorized

