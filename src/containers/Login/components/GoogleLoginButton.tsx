import React from "react";

import { TouchableOpacity, Text, StyleSheet } from "react-native";
import IconGoogle from "@/assets/icons/google.svg"
import useLogin from "../hooks/useLogin";
import { palette } from "@/theme";

const GoogleLoginButton = () => {
  const {
    request,
    promptAsync
  } = useLogin()

  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={() => promptAsync()}
      disabled={!request}
    >
      <IconGoogle style={styles.googleIcon}/>
      <Text style={styles.googleButtonText}>Google로 계속하기</Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: palette.grey[700],
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
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
  },
});
