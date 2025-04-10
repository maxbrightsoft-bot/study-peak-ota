import React from "react";
import Routes from "./RouteName";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "@/screens/Auth/Login";
import SplashScreen from "@/screens/Splash";
import LoginParentPhoneScreen from "@/screens/Auth/LoginParentPhone";

const Stack = createStackNavigator();
const UnAuthorized = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
      initialRouteName={Routes.Splash}
    >
      <Stack.Screen name={Routes.Splash} component={SplashScreen} />
      <Stack.Screen name={Routes.Login} component={Login} />
      <Stack.Screen name={Routes.LoginParentPhone} component={LoginParentPhoneScreen} />
    </Stack.Navigator>
  );
};
export default UnAuthorized;
