import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import {
  INACTIVITY_LIMIT,
  INTERVAL_INACTIVITY_LIMIT,
  PAUSE_INACTIVITY_LIMIT,
} from '../configs/constants';
import { SubjectTimerResponse } from '../../utils/types';
import useServerTime from '@/hooks/useServerTime';
import {
  AppAudioPlayer,
  createAppAudioPlayer,
  replayAppAudioPlayer,
  stopAndReleaseAppAudioPlayer,
  stopAppAudioPlayer
} from '@/utils/audio';

const useInactiveWarning = (
  isRunning: boolean,
  onLimitReached: (
    onSuccess?: (data: SubjectTimerResponse) => void,
    onError?: (error: any) => void
  ) => void
) => {
  const { t } = useTranslation();
  const { getServerNow } = useServerTime();

  const [showWarning, setShowWarning] =
    useState<boolean>(false);

  const lastActiveRef = useRef<moment.Moment>(
    moment()
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(
    null
  );
  const soundRef = useRef<AppAudioPlayer | null>(
    null
  );

  const playWarning = async () => {
    try {
      if (!soundRef.current) return;
      await replayAppAudioPlayer(soundRef.current);
    } catch {}
  };

  const stopWarning = async () => {
    try {
      await stopAppAudioPlayer(soundRef.current);
    } catch {}
  };

  const checkTime = async () => {
    const nowTime = getServerNow();
    const diff = moment(nowTime).diff(
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
    const nowTime = getServerNow();
    lastActiveRef.current = moment(nowTime);
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
      soundRef.current = await createAppAudioPlayer(
        require('../assets/warning.mp3'),
        { isLooping: true }
      );
    };

    load();

    return () => {
      stopAndReleaseAppAudioPlayer(soundRef.current);
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
