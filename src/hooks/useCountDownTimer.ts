import { useState, useRef, useCallback, useEffect } from "react";
import moment from "moment";
import useAuthStore from "@/store/useAuthStore";
import { checkTextbookApi } from "@/services/api/textbookService";
import { ExamStatus } from "@/utils/enums";
import { getCheckStatusExam } from "@/services";
import { isValidTime } from "@/utils/helpers";

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
    isRunning?: boolean;
    textbookId?: number;
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
        startTime,
        status,
        code,
        isRunning = true,
        duration,
        onFinish,
    } = props;

    const { setLoading } = useAuthStore();
    const [remainTime, setRemainTime] = useState<number>();
    const checkStatusTimeoutRef = useRef<number | null>(null);
    const countdownTimeoutRef = useRef<number | null>(null);
    const isCheckingStatus = useRef(false);
    const isFinishedRef = useRef(false);

    const diffFromNowMs = (time: string): number => {
        const input = moment.utc(time);
        if (!input.isValid()) return 0;
        return moment.utc().diff(input);
    };

    const checkLiveExamStatus = useCallback(async () => {
        if ((!code && !textbookId) || isCheckingStatus.current || isFinishedRef.current) return;

        isCheckingStatus.current = true;

        try {
            setLoading(true);
            const res = code
                ? await getCheckStatusExam(code)
                : await checkTextbookApi(textbookId!);

            if (res.data.data.status === ExamStatus.Completed) {
                isFinishedRef.current = true;
                onFinish();
                return;
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            isCheckingStatus.current = false;

            if (status !== ExamStatus.Paused && !isFinishedRef.current) {
                checkStatusTimeoutRef.current = window.setTimeout(
                    checkLiveExamStatus,
                    ONE_SECOND
                );
            }
        }
    }, [code, textbookId, status, onFinish, setLoading]);

    useEffect(() => {
        if (status !== ExamStatus.InProgress && status !== ExamStatus.Paused) return;
        if (!startTime || !duration || !isRunning) return;

        const pauseTime = lastPausedAt ?? lastPausedTime;
        // const resumeTime = lastResumedAt ?? lastResumedTime;

        const tick = () => {
            if (isFinishedRef.current) return;

            let pausedNow = 0;

            const isPaused = status === ExamStatus.Paused;
            const isValidPauseTime = isValidTime(pauseTime);

            if (isPaused && isValidPauseTime) {
                pausedNow = diffFromNowMs(pauseTime!);
            }

            const totalPaused = (totalPausedTime || 0) + pausedNow;
            const elapsedMs = diffFromNowMs(startTime) - totalPaused;
            const elapsedSeconds = Math.max(Math.floor(elapsedMs / ONE_SECOND), 0);
            const remain = duration - elapsedSeconds;

            if (remain <= 0) {
                isFinishedRef.current = true;
                setRemainTime(0);
                onFinish();
                return;
            }

            setRemainTime(remain);

            countdownTimeoutRef.current = window.setTimeout(tick, ONE_SECOND);
        };

        tick();

        return () => {
            if (countdownTimeoutRef.current) {
                clearTimeout(countdownTimeoutRef.current);
            }
        };
    }, [
        startTime,
        duration,
        status,
        isRunning,
        lastPausedAt,
        lastPausedTime,
        lastResumedAt,
        lastResumedTime,
        totalPausedTime,
        onFinish,
    ]);

    useEffect(() => {
        if (typeof remainTime === "number" && remainTime <= 0) {
            checkLiveExamStatus();
        }
    }, [remainTime, checkLiveExamStatus]);

    useEffect(() => {
        return () => {
            if (checkStatusTimeoutRef.current) {
                clearTimeout(checkStatusTimeoutRef.current);
            }
            if (countdownTimeoutRef.current) {
                clearTimeout(countdownTimeoutRef.current);
            }
        };
    }, []);

    return remainTime;
};

export default useCountDownTimer;
