import { TimerStatus } from "@/utils/enums";
import { getRemainTimeFromMinutes } from "@/utils/helpers";
import { useState, useRef, useEffect } from "react";

interface Props {
    isLoading: boolean;
    startTime?: string;
    lastResumeTime?: string;
    status?: TimerStatus;
    duration?: number;
    runningTime: number;
    onFinish: () => void;
    playAudio: (time: number, start?: boolean) => void;
}

const ONE_SECOND = 1000;

const useCountDownTimer = (props: Props) => {
    const {
        isLoading,
        startTime,
        lastResumeTime,
        status,
        duration,
        runningTime,
        onFinish,
        playAudio,
    } = props;

    const [remainTime, setRemainTime] = useState<number>();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const finishedRef = useRef(false);

    useEffect(() => {
        if (!duration || !startTime || isLoading) {
            setRemainTime(undefined);
            return;
        }

        if (status === TimerStatus.Paused) {
            setRemainTime(Math.max(Math.floor((duration - runningTime) / ONE_SECOND), 0));
            return;
        }

        if (status !== TimerStatus.Started) return;

        finishedRef.current = false;

        const tick = () => {
            if (finishedRef.current) return;

            const remain = getRemainTimeFromMinutes(
                startTime,
                duration,
                runningTime,
                lastResumeTime
            );

            if (typeof remain !== "number") return;

            const seconds = Math.floor(remain / ONE_SECOND);

            if (seconds <= 0) {
                finishedRef.current = true;
                setRemainTime(0);
                onFinish();
                return;
            }

            playAudio(seconds);
            setRemainTime(seconds);
            timeoutRef.current = setTimeout(tick, ONE_SECOND);
        };

        tick();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [
        startTime,
        lastResumeTime,
        duration,
        status,
        runningTime,
        isLoading,
        playAudio,
        onFinish,
    ]);

    return remainTime;
};

export default useCountDownTimer;
