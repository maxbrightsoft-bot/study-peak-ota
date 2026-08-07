import { getTimeServerApi } from '@/services/api/timeService';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';

let globalOffset = 0;
let globalSynced = false;
let syncInProgress = false;
let pendingSync: Promise<void> | null = null;

export async function doSync(attempt = 0): Promise<void> {
  if (pendingSync) return pendingSync;

  pendingSync = (async () => {
    try {
      const t1 = Date.now();
      const res = await getTimeServerApi();
      const { serverTime } = res.data;
      const latency = Math.floor((Date.now() - t1) / 2);
      globalOffset = Math.floor(serverTime - (Date.now() - latency));
      globalSynced = true;
    } catch {
      if (attempt < 4) {
        const delay = [1000, 2000, 4000, 8000][attempt];
        await new Promise((r) => setTimeout(r, delay));
        pendingSync = null;
        return doSync(attempt + 1);
      }
      globalSynced = false;
    } finally {
      pendingSync = null;
    }
  })();

  return pendingSync;
}

const useServerTime = () => {
  const [synced, setSynced] = useState(globalSynced);
  const [offset, setOffset] = useState(globalOffset);
  const appStateRef = useRef(AppState.currentState);
  const periodicRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sync = async () => {
    await doSync();
    setSynced(globalSynced);
    setOffset(globalOffset);
  };

  useEffect(() => {
    sync();

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (appStateRef.current !== 'active' && state === 'active') {
        sync();
      }
      appStateRef.current = state;
    });

    periodicRef.current = setInterval(sync, 5 * 60 * 1000);

    return () => {
      appStateSub.remove();
      if (periodicRef.current) clearInterval(periodicRef.current);
    };
  }, []);

  const getServerNow = useCallback(() => {
    return Math.floor(Date.now() + globalOffset);
  }, []);

  return { getServerNow, synced, offset };
};

export default useServerTime;