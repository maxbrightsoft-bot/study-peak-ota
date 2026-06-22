import { useState, useRef, useCallback, useEffect } from "react";
import moment from "moment";
import { ExamStatus } from "@/utils/enums";
import { isValidTime } from "@/utils/helpers";
import { useIsFocused } from "@react-navigation/native";
import { AppState } from "react-native";
import useServerTime from "./useServerTime";
import useCheckExamStatus from "./useCheckExamStatus ";

interface Props {
    lastResumedAt?: string;
    lastResumedTime?: string;
    totalPausedTime?: number;
    lastPausedAt?: string;
    lastPausedTime?: string;
    startTime?: string;
    code?: string;
    status?: ExamStatus;
    duration?: number;
    studentExamSessionId?: number;
    isRunning?: boolean;
    textbookId?: number;
    isCheckStatus?: boolean;
    onFinish: () => void;
}

const ONE_SECOND = 1000;

const useCountDownTimer = (props: Props) => {
    const {
        textbookId,
        lastResumedAt,
        lastPausedAt,
        lastPausedTime,
        lastResumedTime,
        totalPausedTime,
        studentExamSessionId,
        startTime,
        status,
        code,
        isRunning = true,
        isCheckStatus = true,
        duration,
        onFinish,
    } = props;

    const { getServerNow, synced } = useServerTime();
    const [remainTime, setRemainTime] = useState<number>();
    const countdownTimeoutRef = useRef<number | null>(null);
    const isFinishedRef = useRef(false);
    const isTickingRef = useRef(false);
    const isCheckStatusRef = useRef(isCheckStatus);
    const isFocused = useIsFocused();
    const [appState, setAppState] = useState(AppState.currentState);

    const { checkStatus } = useCheckExamStatus(onFinish, status === ExamStatus.Paused || (remainTime !== undefined && remainTime > 0));

    const diffFromNowMs = useCallback((time: string): number => {
        const input = moment.utc(time);
        if (!input.isValid()) return 0;
        return getServerNow() - input.valueOf();
    }, [getServerNow]);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState) => {
            setAppState(nextState);
            if (nextState !== 'active') {
                if (countdownTimeoutRef.current) {
                    clearTimeout(countdownTimeoutRef.current);
                }
                isTickingRef.current = false;
            }
        });

        return () => sub.remove();
    }, []);

    useEffect(() => {
        if (!isFocused || appState !== 'active') return;
        if (status !== ExamStatus.InProgress && status !== ExamStatus.Paused) return;
        if (!startTime || !duration || !isRunning) return;
        if (isTickingRef.current) return;

        if (!synced) return;

        isTickingRef.current = true;
        isFinishedRef.current = false;

        const pauseTime = lastPausedAt ?? lastPausedTime;
        const resumeTime = lastResumedAt ?? lastResumedTime;

        const tick = () => {
            if (isFinishedRef.current || !isRunning) return;

            const isValidPauseTime = isValidTime(pauseTime);
            const isValidResumeTime = isValidTime(resumeTime);

            const isCurrentlyPaused = isValidResumeTime
                ? moment(pauseTime).isAfter(moment(resumeTime))
                : isValidPauseTime;

            const pausedTimeDuringCurrentPause = isCurrentlyPaused
                ? diffFromNowMs(pauseTime || '')
                : 0;

            const totalPausedTimeNow = (totalPausedTime || 0) + pausedTimeDuringCurrentPause;

            const elapsed = diffFromNowMs(startTime) - totalPausedTimeNow;

            const remain = duration - Math.floor(elapsed / 1000);

            if (remain <= 0) {
                isFinishedRef.current = true;
                setRemainTime(0);
                if (!isCheckStatusRef.current) {
                    onFinish();
                }
                return;
            }

            setRemainTime(remain);
            countdownTimeoutRef.current = window.setTimeout(tick, ONE_SECOND);
        };

        tick();

        return () => {
            isTickingRef.current = false;
            if (countdownTimeoutRef.current) {
                clearTimeout(countdownTimeoutRef.current);
            }
        };
    }, [
        startTime,
        duration,
        status,
        isRunning,
        synced,
        diffFromNowMs,
        lastPausedAt,
        lastPausedTime,
        lastResumedAt,
        lastResumedTime,
        totalPausedTime,
        onFinish,
        isFocused,
        appState,
    ]);

    useEffect(() => {
        if (typeof remainTime === "number" && remainTime <= 0 && isCheckStatusRef.current)
            checkStatus({ code, textbookId, studentSessionId: studentExamSessionId, examStatus: status });
    }, [remainTime]);

    useEffect(() => {
        return () => {
            if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current);
        };
    }, []);

    return remainTime;
};

export default useCountDownTimer;