import { Pusher } from "@pusher/pusher-websocket-react-native";

export type ConcurrentConnection = {
    pusher: Pusher | null,
    academyDomain?: string,
    isRegistered: boolean
}

export type EventHandler = (...args: any[]) => void;
export type EventsMap = Record<string, EventHandler>;