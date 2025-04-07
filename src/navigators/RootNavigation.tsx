import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import NavigationHelpers from "./NavigationHelpers";
import Routes from "./RouteName";
import Authorized from "./Authorized";
import { useTranslation } from "react-i18next";

const Stack = createNativeStackNavigator();

const RootNavigation: React.FC = () => {
  let navigation: any = useRef();
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage("en");
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={(navigatorRef) => {
          if (navigatorRef) {
            NavigationHelpers.setTopLevelNavigator(navigatorRef);
            navigation = navigatorRef;
          }
        }}
      >
        <Stack.Navigator
          screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
          <Stack.Screen name={Routes.AuthStack} component={Authorized} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
export default RootNavigation;
