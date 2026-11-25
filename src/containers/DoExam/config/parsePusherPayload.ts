// The React Native Pusher client delivers event data as a JSON string,
// while some callers/tests pass an already-parsed object.
export const parsePusherPayload = <T = Record<string, unknown>>(data: unknown): T | undefined => {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === 'object' ? (parsed as T) : undefined;
    } catch {
      return undefined;
    }
  }
  if (data && typeof data === 'object') return data as T;
  return undefined;
};

export const readExtraDuration = (data: unknown): string | undefined => {
  const payload = parsePusherPayload<{ Duration?: unknown; duration?: unknown }>(data);
  const value = payload?.Duration ?? payload?.duration;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};
