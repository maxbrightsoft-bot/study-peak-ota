import { getTimeServerApi } from '@/services/api/timeService';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';

let globalOffset = 0;
let globalSynced = false;
let syncInProgress = false;

export async function doSync(attempt = 0) {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    const t1 = Date.now();
    const res = await getTimeServerApi()
    
    const { serverTime } = res.data;

    const latency = (Date.now() - t1) / 2;

    globalOffset = serverTime - (Date.now() - latency);
    globalSynced = true;

  } catch {
    if (attempt < 4) {
      const delay = [1000, 2000, 4000, 8000][attempt];
      setTimeout(() => {
        syncInProgress = false;
        doSync(attempt + 1);
      }, delay);
      return;
    }
    globalSynced = false;
  }

  syncInProgress = false;
}

const useServerTime = () => {
  const [synced, setSynced] = useState(globalSynced);
  const [offset, setOffset] = useState(globalOffset);
  const appStateRef = useRef(AppState.currentState);
  const periodicRef = useRef<any>(null);

  const sync = useCallback(async () => {
    await doSync();
    setSynced(globalSynced);
    setOffset(globalOffset);
  }, []);

  useEffect(() => {
    syncInProgress = false;
    sync();

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (appStateRef.current !== 'active' && state === 'active') {
        syncInProgress = false;
        sync();
      }
      appStateRef.current = state;
    });

    periodicRef.current = setInterval(sync, 5 * 60 * 1000);

    return () => {
      appStateSub.remove();
      clearInterval(periodicRef.current);
    };
  }, [sync]);

  const getServerNow = useCallback(() => {
    return Date.now() + globalOffset;
  }, []);

  return { getServerNow, synced, offset };
}

export default useServerTime;