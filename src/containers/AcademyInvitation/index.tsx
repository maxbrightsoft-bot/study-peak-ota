import React from "react";
import { View, Text } from "react-native";
import { Button } from "react-native-paper";
import Loading from "@/components/Loading";
import { Routes } from "@/navigators/RouteName";
import { palette, TYPO } from "@/theme";
import useAcademyInvitation from "./hooks/useAcademyInvitation";
import { ScaledSheet } from 'react-native-size-matters'

const AcademyInvitation = () => {
  const {
    t,
    token,
    academy,
    domain,
    isLoading,
    isLoadingAcademy,
    errorMessage,
    navigation,
    accessToken
  } = useAcademyInvitation();

  return (
    <View style={styles.container}>
      {isLoadingAcademy && <Loading isOverlay={false} />}
      
      {isLoadingAcademy === false && domain && !academy && (
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>{t("not_found")}</Text>
        </View>
      )}

      {!!academy && (
        <View style={styles.content}>
          <Text style={styles.title}>
            {isLoading ? t("verifying") : t("authentication_failed")}
          </Text>
          
          <View style={styles.messageContainer}>
            {(errorMessage || !token) && (
              <Text style={styles.subtitle}>{t("oops_sorry")}</Text>
            )}
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            {isLoading && (
              <Text style={styles.mutedText}>{t("please_wait_a_moment")}</Text>
            )}
            {!token && (
              <Text style={styles.errorText}>
                {t("invitation_token_not_provided")}
              </Text>
            )}
          </View>

          <Button
            mode="contained"
            style={styles.button}
            icon="login"
            onPress={() =>
              !accessToken
                ? navigation.navigate(Routes.UnAuth.Login)
                : navigation.navigate(Routes.Auth.Home)
            }
          >
            <Text style={styles.buttonText}>
              {!accessToken ? t("login") : t("home")}
            </Text>
          </Button>
        </View>
      )}

      {!!isLoadingAcademy && (
        <Button
          mode="contained"
          style={styles.button}
          icon="login"
          onPress={() => navigation.navigate(Routes.UnAuth.Login)}
        >
          <Text style={styles.buttonText}>{t("login")}</Text>
        </Button>
      )}
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: '24@ms',
    backgroundColor: palette.grey[50],
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  notFoundText: {
    ...TYPO.heading2,
    color: palette.grey[700],
  },
  title: {
    ...TYPO.heading1,
    color: palette.grey[900],
    textAlign: "center",
    marginBottom: '24@ms',
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: '24@ms',
  },
  subtitle: {
    ...TYPO.heading3,
    color: palette.grey[800],
    marginBottom: '8@ms',
  },
  errorText: {
    ...TYPO.body1,
    color: palette.error.main,
    marginBottom: '8@ms',
    textAlign: "center",
  },
  mutedText: {
    ...TYPO.body1,
    color: palette.grey[500],
    marginBottom: '8@ms',
    textAlign: "center",
  },
  button: {
    marginTop: '8@ms',
    backgroundColor: palette.main[600],
    borderRadius: '8@ms',
  },
  buttonText: {
    ...TYPO.button2,
    color: palette.common.white,
  },
});

export default AcademyInvitation;
