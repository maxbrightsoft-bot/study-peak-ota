import React from "react";
import Routes from "./RouteName";
import HomePage from "@/screens/Home";
import OnboardingScreen from "@/screens/Onboarding";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Footer from "@/layouts/Footer";

const Tab = createBottomTabNavigator();
const Authorized = ({ route }: { route: any }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: (props) => <></>,
      }}
      initialRouteName={Routes.Home}
      tabBar={(props) => <Footer {...props} />}
    >
        <Tab.Screen name={Routes.Onboarding} component={OnboardingScreen} />
        <Tab.Screen name={Routes.Home} component={HomePage} />
    </Tab.Navigator>
  );
};

export default Authorized;
