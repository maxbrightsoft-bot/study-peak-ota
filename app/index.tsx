import RootNavigation from "../src/navigators/RootNavigation";
import { I18nextProvider } from "react-i18next";
import React, { useEffect } from "react";
import { NavigationIndependentTree } from "@react-navigation/native";
import { LogBox, Platform } from "react-native";
import i18n from "@/languages/i18n";
import hotUpdate from "react-native-ota-hot-update";
import ReactNativeBlobUtil from "react-native-blob-util";
import { OTA_URL } from "@/utils/constants";

const CURRENT_BUNDLE_VERSION = "1.0.0";

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
  LogBox.ignoreAllLogs();

  useEffect(() => {
    if (!__DEV__) {
      checkOtaUpdate();
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationIndependentTree>
        <RootNavigation />
      </NavigationIndependentTree>
    </I18nextProvider>
  );
}
async function checkOtaUpdate() {
  try {
    const res = await fetch(OTA_URL);
    const data = await res.json();

    console.log("[OTA] server:", data.version, "| local:", CURRENT_BUNDLE_VERSION);

    if (!isNewerVersion(data.version, CURRENT_BUNDLE_VERSION)) {
      console.log("[OTA] Up to date");
      return;
    }

    const url = Platform.OS === "ios"
      ? data.downloadIosUrl
      : data.downloadAndroidUrl;

    const versionCode = data.versionCode ?? 1;

    hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, versionCode, {
      updateSuccess: () => console.log("[OTA] Success"),
      updateFail: (msg) => console.log("[OTA] Failed:", msg),
      restartAfterInstall: true,
      maxBundleVersions: 3,
    });
  } catch (e) {
    console.log("[OTA] Error:", e);
  }
} 
