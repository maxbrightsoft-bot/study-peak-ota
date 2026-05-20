import RootNavigation from "../src/navigators/RootNavigation";
import { I18nextProvider } from "react-i18next";
import React, { useEffect, useState } from "react";
import { NavigationIndependentTree } from "@react-navigation/native";
import { LogBox, Platform, View, ActivityIndicator, Text } from "react-native";
import i18n from "@/languages/i18n";
import hotUpdate from "react-native-ota-hot-update";
import ReactNativeBlobUtil from "react-native-blob-util";
import { OTA_URL } from "@/utils/constants";
import { useFonts } from "expo-font";
import RNBootSplash from "react-native-bootsplash";
import { requireNativeModule } from "expo-modules-core";
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
  Feather,
} from "@expo/vector-icons";

const CURRENT_BUNDLE_VERSION = "1.0.9";
const NativeFontLoader = requireNativeModule("ExpoFontLoader");

function isNewerVersion(server: string, current: string): boolean {
  const s = server.split(".").map(Number);
  const c = current.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (s[i] > c[i]) return true;
    if (s[i] < c[i]) return false;
  }
  return false;
}

if (!Array.prototype.findLastIndex) {
  Array.prototype.findLastIndex = function (callback, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) {
        return i;
      }
    }
    return -1;
  };
}
if (!Array.prototype.findLast) {
  Array.prototype.findLast = function (callback, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) {
        return this[i];
      }
    }
    return undefined;
  };
}

export default function App() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [fontWaitTimedOut, setFontWaitTimedOut] = useState(false);

  const [nativeFontsLoaded, setNativeFontsLoaded] = useState(false);
  const [nativeFontError, setNativeFontError] = useState<any>(null);

  const [expoFontsLoaded, expoFontError] = useFonts(
    Platform.OS === 'ios'
      ? {
          ...Ionicons.font,
          ...FontAwesome.font,
          ...FontAwesome5.font,
          ...MaterialIcons.font,
          ...MaterialCommunityIcons.font,
          ...AntDesign.font,
          ...Feather.font,
        }
      : {}
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      const fontMap = {
        ionicons: "fonts/Ionicons.ttf",
        FontAwesome: "fonts/FontAwesome.ttf",
        "FontAwesome5Free-Regular": "fonts/FontAwesome5_Regular.ttf",
        "FontAwesome5Free-Solid": "fonts/FontAwesome5_Solid.ttf",
        "FontAwesome5Brands-Brand": "fonts/FontAwesome5_Brands.ttf",
        material: "fonts/MaterialIcons.ttf",
        "material-community": "fonts/MaterialCommunityIcons.ttf",
        anticon: "fonts/AntDesign.ttf",
        feather: "fonts/Feather.ttf",
      };

      const loadAndroidFonts = async () => {
        try {
          for (const [key, file] of Object.entries(fontMap)) {
            await NativeFontLoader.loadAsync(key, `asset:///${file}`);
            console.log(`[FONTS] Successfully loaded native font: ${key}`);
          }
          setNativeFontsLoaded(true);
        } catch (err) {
          console.error("[FONTS] Failed to load native font:", err);
          setNativeFontError(err);
        }
      };

      loadAndroidFonts();
    }
  }, []);

  const fontsLoaded = Platform.OS === 'android' ? nativeFontsLoaded : expoFontsLoaded;
  const fontError = Platform.OS === 'android' ? nativeFontError : expoFontError;

  LogBox.ignoreAllLogs();

  useEffect(() => {
    if (fontsLoaded || fontError) return;

    const timeout = setTimeout(() => {
      setFontWaitTimedOut(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Chỉ ẩn splash screen khi KHÔNG còn đang check update VÀ việc load font đã hoàn thành (hoặc lỗi/timeout)
    if (!isUpdating && (fontsLoaded || fontError || fontWaitTimedOut)) {
      console.log("[FONTS] Hiding splash screen. Loaded:", fontsLoaded, "Error:", fontError, "Timeout:", fontWaitTimedOut);
      RNBootSplash.hide({ fade: true }).catch((err) => {
        console.log("[FONTS] Error hiding splash:", err);
      });
    }
  }, [isUpdating, fontsLoaded, fontError, fontWaitTimedOut]);

  useEffect(() => {
    if (!__DEV__) {
      checkOtaUpdate(setIsUpdating);
    }
  }, []);

  if (isUpdating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 16, fontSize: 16, fontWeight: "500", color: "#333" }}>
          {i18n.t("updating_app")}
        </Text>
      </View>
    );
  }

  if (!fontsLoaded && !fontError && !fontWaitTimedOut) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10, fontSize: 12, color: "#999" }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationIndependentTree>
        <RootNavigation />
      </NavigationIndependentTree>
    </I18nextProvider>
  );
}

async function checkOtaUpdate(setIsUpdating: (val: boolean) => void) {
  try {
    const timestamp = new Date().getTime();
    const res = await fetch(`${OTA_URL}?t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    const data = await res.json();

    console.log("[OTA] server:", data.version, "| local:", CURRENT_BUNDLE_VERSION);

    if (!isNewerVersion(data.version, CURRENT_BUNDLE_VERSION)) {
      console.log("[OTA] Up to date");
      return;
    }

    setIsUpdating(true);

    const url = Platform.OS === "ios"
      ? data.downloadIosUrl
      : data.downloadAndroidUrl;

    const versionCode = data.versionCode ?? 1;

    hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, versionCode, {
      updateSuccess: () => console.log("[OTA] Success"),
      updateFail: (msg) => {
        console.log("[OTA] Failed:", msg);
        setIsUpdating(false);
      },
      restartAfterInstall: true,
      maxBundleVersions: 3,
    });

  } catch (e) {
    console.log("[OTA] Error:", e);
  }
} 
