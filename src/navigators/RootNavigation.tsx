import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import React, { useRef } from "react";
import NavigationHelpers from "./NavigationHelpers";
import Routes from "./RouteName";
import Authorized from "./Authorized";
import UnAuthorized from "./UnAuthorized";
import useAuthStore from "@/store/useAuthStore";
import { useLanguage } from "@/hooks/useLanguage";
import Loading from "@/components/Loading";
import Toast from "react-native-toast-message";
import LayoutApp from "@/layouts";

const Stack = createNativeStackNavigator();

const RootNavigation: React.FC = () => {
  let navigation: any = useRef();
  const { user, isLoading } = useAuthStore();
  useLanguage();

  return (
    <SafeAreaProvider>
      <Toast position="top" />
      <LayoutApp>
        <NavigationContainer
          ref={(navigatorRef) => {
            if (navigatorRef) {
              NavigationHelpers.setTopLevelNavigator(navigatorRef);
              navigation = navigatorRef;
            }
          }}
        >
          {isLoading && <Loading />}
          <Stack.Navigator
            screenOptions={{ headerShown: false, gestureEnabled: false }}
          >
            {user ? (
              <Stack.Screen name={Routes.AuthStack} component={Authorized} />
            ) : (
              <Stack.Screen
                name={Routes.UnAuthStack}
                component={UnAuthorized}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </LayoutApp>
    </SafeAreaProvider>
  );
};
export default RootNavigation;
