import { navigate, reset } from "@/navigators/NavigationHelpers";
import React, { useEffect } from "react";
import { View } from "react-native";
import Logo from "@/assets/icons/student_full-logo_eng.svg";
import { palette } from "@/theme";
import { Routes } from "@/navigators/RouteName";
import { ScaledSheet } from 'react-native-size-matters'

const SplashScreen = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(Routes.UnAuth.Login);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Logo />
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.main[500],
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplashScreen;
