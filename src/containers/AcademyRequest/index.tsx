import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Button, Card, Chip, ActivityIndicator } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { palette, TYPO } from "@/theme";
import useAcademyRequest, { AcademyEnrollmentRequestStatus } from "./hooks/useAcademyRequest";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const AcademyRequest = () => {
  const {
    t,
    isFetched,
    otherRole,
    isNotFound,
    isLoading,
    isRequestSending,
    academyRequest,
    sendAcademyRequest,
    handleSwitchAcademy,
    goHome,
    academyDomain,
  } = useAcademyRequest();

  if (isNotFound) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={palette.grey[400]} />
        <Text style={styles.notFoundText}>{t("not_found")}</Text>
        <Button mode="contained" onPress={goHome} style={styles.button}>
          {t("go_to_home")}
        </Button>
      </View>
    );
  }

  const renderStatus = () => {
    const status = academyRequest?.status;
    if (status === undefined || !academyRequest?.id) return null;

    switch (status) {
      case AcademyEnrollmentRequestStatus.PendingApproval:
        return (
          <Chip icon="clock-outline" style={[styles.statusChip, { backgroundColor: palette.warning.main + '20' }]} textStyle={{ color: palette.warning.dark }}>
            {t("pending")}
          </Chip>
        );
      case AcademyEnrollmentRequestStatus.Rejected:
        return (
          <Chip icon="close-circle-outline" style={[styles.statusChip, { backgroundColor: palette.error.main + '20' }]} textStyle={{ color: palette.error.dark }}>
            {t("rejected")}
          </Chip>
        );
      case AcademyEnrollmentRequestStatus.Approved:
        return (
          <Chip icon="check-circle-outline" style={[styles.statusChip, { backgroundColor: palette.success.main + '20' }]} textStyle={{ color: palette.success.dark }}>
            {t("approved")}
          </Chip>
        );
      default:
        return null;
    }
  };

  const renderContentText = () => {
    if (academyRequest?.isEnrolled || !!otherRole) {
      return <Text style={styles.contentText}>{t("already_attended")}</Text>;
    }

    const status = academyRequest?.status;
    if (!academyRequest?.id || status === null || status === undefined) return null;

    switch (status) {
      case AcademyEnrollmentRequestStatus.PendingApproval:
        return <Text style={styles.contentText}>{t("your_request_is_being_reviewed")}</Text>;
      case AcademyEnrollmentRequestStatus.Rejected:
        return <Text style={styles.contentText}>{t("request_rejected")}</Text>;
      case AcademyEnrollmentRequestStatus.Approved:
        return (
          <View>
            <Text style={styles.contentText}>{t("request_approved_proceed")}</Text>
            {!academyRequest?.isEnrolled && (
              <Text style={[styles.contentText, { color: palette.error.main, marginTop: 4 }]}>
                {t("but_you_have_not_been_attended_yet")}
              </Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const renderInfoRow = (label: string, value: string) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isFetched || isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={palette.main[600]} />
          </View>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text style={styles.title}>{t("academy_request")}</Text>
                {renderStatus()}
              </View>

              <View style={styles.infoContainer}>
                {!!academyRequest && renderInfoRow(t("academy"), academyRequest.academyName)}
                {!!academyRequest?.course?.name && renderInfoRow(t("class"), academyRequest.course.name)}

                {!!otherRole && (
                  <View style={styles.otherRoleContainer}>
                    {renderInfoRow(t("academy"), otherRole.academyName)}
                    <View style={styles.currentRoleRow}>
                      <Text style={[styles.infoLabel, { color: palette.error.dark }]}>{t("current_role")}:</Text>
                      <Text style={styles.infoValue}>{otherRole.roleName}</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.contentSection}>
                {renderContentText()}
              </View>

              <View style={styles.actionSection}>
                {(!academyRequest || (!academyRequest.isEnrolled && !otherRole && (!academyRequest.id || academyRequest.status !== AcademyEnrollmentRequestStatus.PendingApproval))) && (
                  <Button
                    mode="contained"
                    loading={isRequestSending}
                    onPress={sendAcademyRequest}
                    style={styles.primaryButton}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <MaterialIcons name="send" size={18} color="#FFF" />
                      <Text style={{ color: "#FFF" }}>
                        {t(!!academyRequest?.id ? "send_new_request" : "send_request")}
                      </Text>
                    </View>
                  </Button>
                )}

                {!!academyRequest?.isEnrolled && (
                  <Button
                    mode="contained"
                    onPress={() => handleSwitchAcademy(false)}
                    style={[styles.primaryButton, { backgroundColor: palette.success.main }]}
                    icon="swap-horizontal"
                  >
                    {t("switch_academy")}
                  </Button>
                )}

                <Button
                  mode="outlined"
                  onPress={goHome}
                  style={styles.secondaryButton}
                  textColor={palette.grey[600]}
                  icon="home-outline"
                >
                  {t("go_to_home")}
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[50],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    ...TYPO.heading2,
    color: palette.main[600],
    fontWeight: "bold",
  },
  statusChip: {
    height: 28,
    borderRadius: 8,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100],
  },
  infoLabel: {
    ...TYPO.body2,
    color: palette.grey[500],
  },
  infoValue: {
    ...TYPO.body2,
    color: palette.grey[900],
    fontWeight: "600",
  },
  otherRoleContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: palette.error.main + '05',
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: palette.error.main + '40',
  },
  currentRoleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  contentSection: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  contentText: {
    ...TYPO.body2,
    color: palette.grey[600],
    textAlign: "center",
  },
  actionSection: {
    gap: 12,
  },
  primaryButton: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 6,
    backgroundColor: palette.main[600],
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 6,
    borderColor: palette.grey[300],
  },
  notFoundText: {
    ...TYPO.heading3,
    color: palette.grey[600],
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    backgroundColor: palette.main[600],
  },
});

export default AcademyRequest;
