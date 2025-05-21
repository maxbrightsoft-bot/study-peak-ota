import { Pusher } from "@pusher/pusher-websocket-react-native";

let reconnectAttempts = 0;
const MAX_RETRIES = 5;

export const autoReconnectPusher = async (pusher: Pusher) => {
  if (!pusher || pusher.connectionState === "CONNECTED") return;

  if (reconnectAttempts >= MAX_RETRIES) {
    console.warn("[Pusher] Max reconnect attempts reached");
    return;
  }

  try {
    console.log(`[Pusher] Attempting reconnect (${reconnectAttempts + 1})...`);
    await pusher.connect();

    reconnectAttempts = 0
    console.log("[Pusher] Reconnected successfully");
  } catch (err) {
    reconnectAttempts++;
    const retryIn = 1000 * 2 ** reconnectAttempts;
    console.warn(`[Pusher] Reconnect failed. Retrying in ${retryIn / 1000}s`);

    setTimeout(() => autoReconnectPusher(pusher), retryIn);
  }
};
