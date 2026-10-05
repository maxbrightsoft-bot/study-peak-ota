import { useEffect, useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import useServerTime from "@/hooks/useServerTime";

interface Props {
  startTime?: moment.Moment;
  studyTime: number;
  textbookId: number;
  /** Client-side pause flag (normal textbook only) */
  isPaused?: boolean;
  /** Accumulated paused milliseconds to subtract from elapsed time */
  totalLocalPausedMs?: number;
}

export const useTextbookTimer = (props: Props) => {
  const {
    studyTime,
    textbookId,
    startTime,
    isPaused = false,
    totalLocalPausedMs = 0
  } = props;

  const [elapsedTime, setElapsedTime] = useState(Math.max(0, studyTime || 0));
  const { t } = useTranslation();
  const { getServerNow } = useServerTime();

  useEffect(() => {
    if (!textbookId || !startTime) {
      setElapsedTime(Math.max(0, studyTime || 0));
      return;
    }

    const calculateElapsedTime = () => {
      const currentNow = getServerNow();
      const elapsedSinceStart = Math.max(0, currentNow - startTime.valueOf());
      const activeElapsed = Math.max(0, elapsedSinceStart - totalLocalPausedMs);
      return Math.max(0, (studyTime || 0) + activeElapsed);
    };

    // When paused, freeze the display at the current active time.
    if (isPaused) {
      setElapsedTime(calculateElapsedTime());
      return;
    }

    // On resume (or initial start): set the correct value immediately
    // so the display continues from where it was, no flash/jump.
    setElapsedTime(calculateElapsedTime());

    let timerId: ReturnType<typeof setTimeout>;

    const tick = () => {
      setElapsedTime(calculateElapsedTime());
      timerId = setTimeout(tick, 500);
    };

    timerId = setTimeout(tick, 500);

    return () => clearTimeout(timerId);
  }, [studyTime, startTime, textbookId, isPaused, totalLocalPausedMs, getServerNow]);

  const formatTime = (timeInMilliseconds: number) => {
    const totalMs = Math.max(0, timeInMilliseconds || 0);
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    return t("hours_mins_seconds", {
      hours: hours.toString().padStart(2, "0"),
      mins: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0")
    });
  };

  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime)
  };
};
