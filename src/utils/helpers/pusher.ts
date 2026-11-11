import { Pusher } from "@pusher/pusher-websocket-react-native";

let reconnectAttempts = 0;
const MAX_RETRIES = 5;
// True while the app itself closed the connection (academy switch, logout). Its DISCONNECTED must not trigger a
// reconnect: that reconnect races the next initializePusher (init + connect on the same singleton) and can leave
// the client stuck in RECONNECTING, where every subscribe fails until the app is relaunched.
let disconnectRequested = false;

export const setPusherDisconnectRequested = (value: boolean) => {
  disconnectRequested = value;
};

const normalizeDomain = (domain?: string) => domain?.trim().toLowerCase() || "";

/**
 * True when the live connection was opened for another academy than the one now selected. Its authorizer still
 * sends the old academy header, so it must be closed and re-opened. Unknown on either side (study space, or no
 * recorded academy) keeps the connection.
 */
export const isPusherForOtherAcademy = (connectedAcademy?: string, wantedAcademy?: string): boolean => {
  const connected = normalizeDomain(connectedAcademy);
  const wanted = normalizeDomain(wantedAcademy);
  return !!connected && !!wanted && connected !== wanted;
};

export const autoReconnectPusher = async (pusher: Pusher) => {
  if (disconnectRequested) return;
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
