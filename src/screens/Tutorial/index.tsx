import React from 'react'
import { useNavigation } from '@react-navigation/native'
import TutorialContainer from '@/containers/Tutorial'
import useAuthStore from '@/store/useAuthStore'
import { Routes } from '@/navigators/RouteName'

const TutorialScreen = () => {
  const navigation = useNavigation<any>()
  const user = useAuthStore(state => state.user)

  const handleFinish = async () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate(user ? Routes.Auth.Home : Routes.UnAuth.Login)
    }
  }

  return (
    <TutorialContainer
      onFinish={handleFinish}
      onSkip={handleFinish}
    />
  )
}

export default TutorialScreen
