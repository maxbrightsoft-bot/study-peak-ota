import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
  StatusBar,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import i18n from "@/languages/i18n";
import DeviceInfo from "react-native-device-info";

type Props = {
  storeUrl?: string;
  latestVersion: string;
};

const ForceUpdateScreen: React.FC<Props> = ({ storeUrl, latestVersion }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.9,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [scaleAnim, opacityAnim]);

  const handleUpdate = () => {
    const defaultUrl = Platform.OS === "android"
      ? `market://details?id=${DeviceInfo.getBundleId()}`
      : `itms-apps://itunes.apple.com/app/id6760352231`;

    const finalUrl = storeUrl || defaultUrl;

    Linking.openURL(finalUrl).catch((err) => {
      console.log("Could not open market link, trying fallback web link:", err);
      const fallbackUrl = Platform.OS === "android"
        ? `https://play.google.com/store/apps/details?id=${DeviceInfo.getBundleId()}`
        : `https://apps.apple.com/app/id6760352231`;
      Linking.openURL(fallbackUrl).catch((e) => console.error("Failed to open fallback URL:", e));
    });
  };

  const title = i18n.t("force_update_title");
  const subtitle = i18n.t("force_update_subtitle");
  const buttonText = i18n.t("force_update_button");
  const versionLabel = i18n.t("version_label");

  return (
    <LinearGradient
      colors={["#5F30AA", "#3B1E6E", "#1D0B3A"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.contentContainer}>
        <View style={styles.glowCircle1} />
        <View style={styles.glowCircle2} />

        <View style={styles.glassCard}>
          <Animated.View 
            style={[
              styles.iconWrapper, 
              { transform: [{ scale: scaleAnim }], shadowOpacity: opacityAnim }
            ]}
          >
            <View style={styles.iconCircle}>
              <Feather name="download-cloud" size={42} color="#5F30AA" />
            </View>
          </Animated.View>

          <Text style={styles.title}>{title}</Text>

          {latestVersion && (
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                {versionLabel}: {latestVersion}
              </Text>
            </View>
          )}

          <Text style={styles.description}>{subtitle}</Text>

          <TouchableOpacity 
            style={styles.updateButton} 
            activeOpacity={0.8}
            onPress={handleUpdate}
          >
            <LinearGradient
              colors={["#FFD38C", "#FFC570"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
              <Feather name="arrow-right" size={18} color="#2A1154" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ForceUpdateScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glowCircle1: {
    position: "absolute",
    top: "-40@ms",
    left: "10@ms",
    width: "150@ms",
    height: "150@ms",
    borderRadius: "75@ms",
    backgroundColor: "rgba(255, 197, 112, 0.15)",
    blurRadius: 50,
    zIndex: 0,
  },
  glowCircle2: {
    position: "absolute",
    bottom: "-20@ms",
    right: "20@ms",
    width: "180@ms",
    height: "180@ms",
    borderRadius: "90@ms",
    backgroundColor: "rgba(95, 48, 170, 0.4)",
    blurRadius: 60,
    zIndex: 0,
  },
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: "24@ms",
    padding: "24@ms",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: "24@ms",
    shadowColor: "#FFC570",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 6,
  },
  iconCircle: {
    width: "80@ms",
    height: "80@ms",
    borderRadius: "40@ms",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 197, 112, 0.8)",
  },
  title: {
    fontSize: "22@ms",
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: "12@ms",
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: "4@ms",
    paddingHorizontal: "12@ms",
    borderRadius: "20@ms",
    marginBottom: "16@ms",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  versionText: {
    fontSize: "12@ms",
    color: "#FFC570",
    fontWeight: "600",
  },
  description: {
    fontSize: "14@ms",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: "22@ms",
    marginBottom: "28@ms",
    paddingHorizontal: "8@ms",
  },
  updateButton: {
    width: "100%",
    height: "50@ms",
    borderRadius: "25@ms",
    overflow: "hidden",
    shadowColor: "#FFC570",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "20@ms",
  },
  buttonText: {
    color: "#2A1154",
    fontSize: "15@ms",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: "8@ms",
  },
  footerText: {
    marginTop: "24@ms",
    fontSize: "11@ms",
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 0.5,
    zIndex: 1,
  },
});
