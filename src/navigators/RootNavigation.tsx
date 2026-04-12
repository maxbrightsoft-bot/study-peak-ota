import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import React, { useEffect } from 'react'
import NavigationHelpers, { currentScreen } from './NavigationHelpers'
import Authorized from './Authorized'
import UnAuthorized from './UnAuthorized'
import useAuthStore from '@/store/useAuthStore'
import { useLanguage } from '@/hooks/useLanguage'
import Loading from '@/components/Loading'
import Toast from 'react-native-toast-message'
import { PaperProvider } from 'react-native-paper'
import { MainRoutes } from './RouteName'
import RNBootSplash from 'react-native-bootsplash'
import { audioToastConfig } from '@/layouts/partials/Alarm/AudioToastContent'
import { BASE_URL } from '@/utils/constants'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import crashlytics from '@react-native-firebase/crashlytics';

const Stack = createNativeStackNavigator()

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
  offlineAccess: false
})

const RootNavigation: React.FC = () => {
  const { language, user, isLoading, setCrashlyticsUser, selectedAcademy, isLoadingWithoutOverlay, setLoading } = useAuthStore()
  useLanguage()
  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user?.id) {
      setCrashlyticsUser(user)
    }
  }, [user?.id])

  console.log({
    env: BASE_URL,
    language: language.code,
    user,
    isLoading,
    currentScreen: currentScreen(),
    selectedAcademy
  })

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer
          onReady={() => RNBootSplash.hide()}
          ref={(navigatorRef) => {
            if (navigatorRef) {
              NavigationHelpers.setTopLevelNavigator(navigatorRef)
            }
          }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user?.id ? (
              <Stack.Screen name={MainRoutes.UnAuthStack} component={UnAuthorized} />
            ) : (
              <Stack.Screen name={MainRoutes.AuthStack} component={Authorized} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
        {isLoading && <Loading isOverlay />}
        {!isLoading && isLoadingWithoutOverlay && <Loading />}
      </PaperProvider>
      <Toast config={audioToastConfig} position="top" topOffset={10} />
    </SafeAreaProvider>
  )
}
export default RootNavigation
