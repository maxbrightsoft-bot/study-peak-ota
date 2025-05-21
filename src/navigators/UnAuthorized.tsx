import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "@/screens/Auth/Login";
import SplashScreen from "@/screens/Splash";
import LoginParentPhoneScreen from "@/screens/Auth/LoginParentPhone";
import { Routes } from "./RouteName";

const Stack = createStackNavigator();
const UnAuthorized = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={Routes.UnAuth.Splash}
    >
      <Stack.Screen name={Routes.UnAuth.Splash} component={SplashScreen} />
      <Stack.Screen name={Routes.UnAuth.Login} component={Login} />
      <Stack.Screen name={Routes.UnAuth.LoginParentPhone} component={LoginParentPhoneScreen} />
    </Stack.Navigator>
  );
};
export default UnAuthorized;
