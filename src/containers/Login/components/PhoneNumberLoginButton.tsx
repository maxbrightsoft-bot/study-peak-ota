import React from "react";

import { TouchableOpacity, Text } from "react-native";
import { palette } from "@/theme";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { ScaledSheet } from 'react-native-size-matters'

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

const styles = ScaledSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: palette.main[500],
    borderWidth: '1@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '6@ms',
    color: palette.main[500],
    justifyContent: "center",
  },
  googleIcon: {
    width: '20@ms',
    height: '20@ms',
    marginRight: '8@ms',
  },
  googleButtonText: {
    fontSize: '16@ms',
    fontWeight: "500",
    color: palette.main[500],
  },
});
