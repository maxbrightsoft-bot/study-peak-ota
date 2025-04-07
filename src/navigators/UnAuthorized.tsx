import React from "react";
import Routes from "./RouteName";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "@/screens/Auth/Login";

const Stack = createStackNavigator();
const UnAuthorized = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
      initialRouteName={Routes.Login}
    >
      <Stack.Screen name={Routes.Login} component={Login} />
    </Stack.Navigator>
  );
};
export default UnAuthorized;
