import { navigate, reset } from "@/navigators/NavigationHelpers";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LogoEN from "@/assets/icons/vertical_full-logo_eng.svg";
import LogoKO from "@/assets/icons/vertical_full-logo_kor.svg";
import { useLanguage } from "@/hooks/useLanguage";
import { palette } from "@/theme";
import { Routes } from "@/navigators/RouteName";
import useAuthStore from "@/store/useAuthStore";

const SplashScreen = () => {
  const { isKorean } = useLanguage();
  const { user } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(Routes.UnAuth.Login);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {!!isKorean ? <LogoKO /> : <LogoEN />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.main[500],
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplashScreen;
