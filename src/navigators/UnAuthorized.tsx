import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'
import useAuthStore from '@/store/useAuthStore'
import Login from '@/screens/Auth/Login'
import LoginParentPhoneScreen from '@/screens/Auth/LoginParentPhone'
import TutorialContainer from '@/containers/Tutorial'
import { Routes } from './RouteName'

const Stack = createStackNavigator()

function TutorialScreen() {
  const navigation = useNavigation<any>()
  const setHasSeenTutorial = useAuthStore(state => state.setHasSeenTutorial)

  const handleFinish = async () => {
    setHasSeenTutorial(true)
    navigation.replace(Routes.UnAuth.Login)
  }

  return (
    <TutorialContainer
      onFinish={handleFinish}
      onSkip={handleFinish}
    />
  )
}

const UnAuthorized = () => {
  const hasSeenTutorial = useAuthStore(state => state.hasSeenTutorial)

  return (
    <Stack.Navigator
      initialRouteName={hasSeenTutorial ? Routes.UnAuth.Login : Routes.UnAuth.Tutorial}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={Routes.UnAuth.Tutorial} component={TutorialScreen} />
      <Stack.Screen name={Routes.UnAuth.Login} component={Login} />
      <Stack.Screen name={Routes.UnAuth.LoginParentPhone} component={LoginParentPhoneScreen} />
    </Stack.Navigator>
  )
}

export default UnAuthorized