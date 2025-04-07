import RootNavigation from "@/navigators/RootNavigation";
import { I18nextProvider } from "react-i18next";
import React from "react";
import { NavigationIndependentTree } from "@react-navigation/native";
import { LogBox } from "react-native";
import i18n from "@/languages/i18n";

export default function App() {
  LogBox.ignoreAllLogs();
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationIndependentTree>
          <RootNavigation/>
      </NavigationIndependentTree>
    </I18nextProvider>
  );
}
