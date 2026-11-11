// The store's subscribeChannel/unsubscribeChannelSafe already keep a per-channel registry of
// listeners (the native SDK has a single onEvent per channel) and only unsubscribe when the last
// listener leaves, so timers and alarm hooks share one subscription through it.

// Study sync payloads are camelCase JSON strings (the store usually parses them already)
export const parsePayload = <T>(data: unknown): T | undefined => {
    if (typeof data !== "string") return data as T | undefined
    try {
        return JSON.parse(data) as T
    } catch {
        return undefined
    }
}
