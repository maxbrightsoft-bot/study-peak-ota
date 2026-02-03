import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Audio } from 'expo-av';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import {
  INACTIVITY_LIMIT,
  INTERVAL_INACTIVITY_LIMIT,
  PAUSE_INACTIVITY_LIMIT,
} from '../configs/constants';
import { SubjectTimerResponse } from '../../utils/types';

const useInactiveWarning = (
  isRunning: boolean,
  onLimitReached: (
    onSuccess?: (data: SubjectTimerResponse) => void,
    onError?: (error: any) => void
  ) => void
) => {
  const { t } = useTranslation();

  const [showWarning, setShowWarning] =
    useState<boolean>(false);

  const lastActiveRef = useRef<moment.Moment>(
    moment()
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(
    null
  );
  const soundRef = useRef<Audio.Sound | null>(
    null
  );

  const playWarning = async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.replayAsync();
    } catch {}
  };

  const stopWarning = async () => {
    try {
      await soundRef.current?.stopAsync();
    } catch {}
  };

  const checkTime = async () => {
    const diff = moment().diff(
      lastActiveRef.current,
      'milliseconds'
    );

    const shouldWarn =
      diff >= INACTIVITY_LIMIT &&
      diff <
        INACTIVITY_LIMIT + PAUSE_INACTIVITY_LIMIT;

    setShowWarning(shouldWarn);

    if (shouldWarn) {
      await playWarning();
    } else {
      await stopWarning();
    }

    if (
      diff >=
      INACTIVITY_LIMIT + PAUSE_INACTIVITY_LIMIT
    ) {
      await stopWarning();
      onLimitReached(() => {
      });
    }
  };

  const resetTimer = useCallback(() => {
    lastActiveRef.current = moment();
    setShowWarning(false);
    stopWarning();

    if (intervalRef.current)
      clearInterval(intervalRef.current);

    intervalRef.current = setInterval(
      checkTime,
      INTERVAL_INACTIVITY_LIMIT
    );
  }, [onLimitReached]);

  useEffect(() => {
    const load = async () => {
      const { sound } =
        await Audio.Sound.createAsync(
          require('../assets/warning.mp3'),
          { isLooping: true }
        );
      soundRef.current = sound;
    };

    load();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    resetTimer();

    const sub = AppState.addEventListener(
      'change',
      state => {
        if (state === 'active') {
          resetTimer();
        }
      }
    );

    return () => {
      intervalRef.current &&
        clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [isRunning]);

  return {
    showWarning,
    resetTimer,
  };
};

export default useInactiveWarning;
