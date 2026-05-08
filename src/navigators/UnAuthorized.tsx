import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Login from '@/screens/Auth/Login'
import LoginParentPhoneScreen from '@/screens/Auth/LoginParentPhone'
import AcademyInvitationScreen from '@/screens/AcademyInvitation'
import AcademyRequestScreen from '@/screens/AcademyRequest'
import { Routes } from './RouteName'

const Stack = createStackNavigator()
const UnAuthorized = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.UnAuth.Login} component={Login} />
      <Stack.Screen name={Routes.UnAuth.LoginParentPhone} component={LoginParentPhoneScreen} />
    </Stack.Navigator>
  )
}
export default UnAuthorized
