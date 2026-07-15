import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { answerQuestionExam } from "@/containers/DoExam/apiClients";
import { answerQuestionTextbook } from "@/containers/DoTextbook/apiClients";

export const syncOfflineAnswers = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    for (const key of keys) {
      if (key.startsWith("rc.")) {
        // Exam recovery
        const parts = key.split(".");
        if (parts.length >= 4) {
          const examCode = parts[2];
          const dataStr = await AsyncStorage.getItem(key);
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            if (!data.questions || !data.questions.length) {
              await AsyncStorage.removeItem(key);
              continue;
            }
            const body = {
              lastAnswerTime: data.lastAnswerTime,
              runningTime: data.runningTime || 0,
              questions: data.questions.map((i: any) => ({
                questionId: i.id,
                selectedAnswers: i.selectedAnswers,
                duration: i.duration,
                isStar: i.isStar,
                answerTime: i.answerTime,
                textualAnswers: i.textualAnswers,
                unit: i.unit
              })),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
            };

            const res = await answerQuestionExam(examCode, body);
            if (res.data && res.data.status === 0) {
              throw new Error(res.data.message || "Validation error");
            }
            // Sync success: remove key and rollback key
            await AsyncStorage.removeItem(key);
            const rbKey = key.replace("rc.", "rb.");
            await AsyncStorage.removeItem(rbKey);
            console.log(`Synced offline answers for exam ${examCode}`);
          } catch (err: any) {
            console.log(`Failed to sync exam ${examCode}:`, err);
            // If it is not a network error, remove key to prevent infinite retries on invalid data / expired exam
            if (err.code !== "ERR_NETWORK" && err.message !== "Network Error") {
              await AsyncStorage.removeItem(key);
              const rbKey = key.replace("rc.", "rb.");
              await AsyncStorage.removeItem(rbKey);
            }
          }
        }
      } else if (key.startsWith("trc.")) {
        // Textbook recovery
        const parts = key.split(".");
        if (parts.length >= 5) {
          const textbookId = Number(parts[2]);
          const dataStr = await AsyncStorage.getItem(key);
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            if (!data.questions || !data.questions.length) {
              await AsyncStorage.removeItem(key);
              continue;
            }
            const body = {
              lastAnswerTime: data.lastAnswerTime,
              questions: data.questions.map((i: any) => ({
                questionId: i.id,
                selectedAnswers: i.selectedAnswers,
                textualAnswers: i.textualAnswers,
                duration: i.duration,
                isStar: i.isStar,
                answerTime: i.answerTime,
                unit: i.unit
              })),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
            };

            const res = await answerQuestionTextbook(textbookId, body);
            if (res.data && res.data.status === 0) {
              throw new Error(res.data.message || "Validation error");
            }
            // Sync success: remove key and rollback key
            await AsyncStorage.removeItem(key);
            const trbKey = key.replace("trc.", "trb.");
            await AsyncStorage.removeItem(trbKey);
            console.log(`Synced offline answers for textbook ${textbookId}`);
          } catch (err: any) {
            console.log(`Failed to sync textbook ${textbookId}:`, err);
            // If not a network error, remove key
            if (err.code !== "ERR_NETWORK" && err.message !== "Network Error") {
              await AsyncStorage.removeItem(key);
              const trbKey = key.replace("trc.", "trb.");
              await AsyncStorage.removeItem(trbKey);
            }
          }
        }
      }
    }
  } catch (e) {
    console.log("Failed to sync offline answers:", e);
  }
};

let isSyncing = false;
export const triggerOfflineSync = () => {
  if (isSyncing) return;
  isSyncing = true;
  syncOfflineAnswers().finally(() => {
    isSyncing = false;
  });
};

export const startOfflineSyncListener = () => {
  // Listen to network status changes
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      triggerOfflineSync();
    }
  });
  // Also run immediately
  triggerOfflineSync();
  return unsubscribe;
};
