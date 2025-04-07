import React from "react";
import Routes from "./RouteName";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "@/screens/Auth/Login";
import HomePage from "@/screens/HomePage";

const Stack = createNativeStackNavigator();
const Authorized = ({ route }: { route: any }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <></>,
      }}
      initialRouteName={Routes.Home}
    >
      <Stack.Screen name={Routes.Home} component={HomePage} />
      <Stack.Screen name={Routes.Login} component={Login} />
    </Stack.Navigator>
  );
};

export default Authorized;
