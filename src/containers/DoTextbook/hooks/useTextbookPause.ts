import { useCallback, useRef, useState } from "react";
import moment from "moment";

interface UseTextbookPauseResult {
  /** Whether the timer is currently paused (client-side only, normal textbook) */
  isPaused: boolean;
  /** Ref holding the moment when pause started (undefined when not paused) */
  pausedAtRef: React.MutableRefObject<moment.Moment | undefined>;
  /** Accumulated total paused milliseconds across all pause/resume cycles */
  totalLocalPausedMs: number;
  /** Pause the timer (no-op for mock textbooks) */
  pause: () => void;
  /** Resume the timer, accumulating the paused duration */
  resume: () => void;
  /** Reset all pause state (e.g. when textbook restarts) */
  resetPause: () => void;
}

/**
 * Client-side-only pause for **normal** (non-mock) textbooks.
 *
 * - No API call is made on pause/resume.
 * - Tracks the accumulated paused milliseconds so that other hooks
 *   (timer display, diff-time calculation) can compensate.
 */
const useTextbookPause = (isMock?: boolean): UseTextbookPauseResult => {
  const [isPaused, setIsPaused] = useState(false);
  const pausedAtRef = useRef<moment.Moment | undefined>(undefined);
  const [totalLocalPausedMs, setTotalLocalPausedMs] = useState(0);

  const pause = useCallback(() => {
    if (isMock) return; // mock uses server-side pause
    pausedAtRef.current = moment();
    setIsPaused(true);
  }, [isMock]);

  const resume = useCallback(() => {
    if (isMock) return;
    if (pausedAtRef.current) {
      const elapsed = moment().diff(pausedAtRef.current, "milliseconds");
      setTotalLocalPausedMs((prev) => prev + Math.max(0, elapsed));
    }
    pausedAtRef.current = undefined;
    setIsPaused(false);
  }, [isMock]);

  const resetPause = useCallback(() => {
    pausedAtRef.current = undefined;
    setIsPaused(false);
    setTotalLocalPausedMs(0);
  }, []);

  return {
    isPaused,
    pausedAtRef,
    totalLocalPausedMs,
    pause,
    resume,
    resetPause
  };
};

export default useTextbookPause;
