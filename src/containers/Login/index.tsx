import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { palette } from "@/theme";
import GoogleLoginButton from "./components/GoogleLoginButton";

const Login = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          당신의 공부 데이터,{"\n"}
          <Text style={styles.bold}>BIG 데이터로!</Text>
        </Text>

        <Text style={styles.description}>
          스터디 피크는{"\n"}
          오프라인의 공부 데이터를{"\n"}
          축적, 분석, 공유하기 위한{"\n"}
          <Text style={styles.highlight}>공부 페이스 메이커</Text> 입니다.
        </Text>
        <GoogleLoginButton />
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#333",
    marginBottom: 40,
    lineHeight: 28,
    paddingHorizontal: 45,
  },
  bold: {
    fontWeight: "bold",
  },
  description: {
    fontSize: 24,
    fontWeight: 500,
    color: palette.grey[700],
    lineHeight: 26,
    marginBottom: 124,
    paddingHorizontal: 45,
  },
  highlight: {
    color: palette.main[500],
    fontWeight: "600",
  },
});
