import React from "react";

import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { palette } from "@/theme";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";

const PhoneNumberLoginButton = () => {
  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={() => navigate(Routes.UnAuth.LoginParentPhone)}
    >
      <Text style={styles.googleButtonText}>전화번호로 로그인</Text>
    </TouchableOpacity>
  );
};

export default PhoneNumberLoginButton;

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: palette.main[500],
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    color: palette.main[500],
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: palette.main[500],
  },
});
