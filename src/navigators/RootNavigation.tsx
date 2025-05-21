import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
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

const Stack = createNativeStackNavigator()

const RootNavigation: React.FC = () => {
  const navigation = useNavigation()
  const state = navigation.getState()
  const { user, isLoading, selectedAcademy, setLoading } = useAuthStore()
  useLanguage()
  useEffect(() => {
    setLoading(false)
  }, [])

  console.log({
    user,
    isLoading,
    currentScreen: currentScreen(),
    selectedAcademy,
    state: JSON.stringify(state, null, 2)
  })

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer
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
        {isLoading && <Loading />}
        <Toast position="top" topOffset={10} />
      </PaperProvider>
    </SafeAreaProvider>
  )
}
export default RootNavigation
