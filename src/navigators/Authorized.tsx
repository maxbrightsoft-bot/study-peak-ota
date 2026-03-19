import React, { useMemo } from 'react'
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

const Tab = createBottomTabNavigator()
const Authorized = ({ route }: { route: any }) => {
  const { user } = useAuthStore()
  const { headerProps } =
    useLayoutApp()
  const isNotEnoughStatements = useMemo(
    () => user?.email && user?.isNotEnoughStatements,
    [user?.email, user?.isNotEnoughStatements]
  )

  if (isNotEnoughStatements)
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tab.Screen name={Routes.Auth.Onboarding} component={OnboardingScreen} />
      </Tab.Navigator>
    )

  // if (!hasEnteredSelectAcademy)
  // return (
  //   <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => null}>
  //     <Tab.Screen
  //       name={Routes.Auth.SelectAcademy}
  //       component={SelectAcademyScreen}
  //     />
  //   </Tab.Navigator>
  // )

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
        <Tab.Screen name={Routes.Auth.DoExam} component={DoExamScreen} options={{ lazy: true, }} />
        <Tab.Screen name={Routes.Auth.DoTextbook} component={DoTextbookScreen} options={{ lazy: true, }} />
        <Tab.Screen name={Routes.Auth.ExamList} component={ExamListScreen} options={{ lazy: true, }} />
        <Tab.Screen name={Routes.Auth.ExamResult} component={ExamResultScreen} />
        <Tab.Screen name={Routes.Auth.ExamResultList} component={ExamResultListScreen} />
        <Tab.Screen name={Routes.Auth.StudyPerformance} component={StudyPerformanceScreen} />
        <Tab.Screen name={Routes.Auth.Profile} component={ProfileScreen} />
        <Tab.Screen name={Routes.Auth.Question} component={QuestionScreen} />
      </Tab.Navigator>
    </LayoutApp>
  )
}

export default Authorized
