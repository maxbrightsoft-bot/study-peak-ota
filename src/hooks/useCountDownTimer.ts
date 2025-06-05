import { ExamStatus } from "@/containers/Home/configs/constants";
import { getCheckStatusExam } from "@/services/examService";
import useAuthStore from "@/store/useAuthStore";
import { getRemainTime } from "@/utils/helpers";
import { useState, useRef, useCallback, useEffect } from "react"

interface Props {
    isEnding: boolean
    startTime?: string
    code?: string;
    status?: ExamStatus;
    duration?: string;
    onFinish: () => void
}

const ONE_SECOND_IN_MILLISECONDS = 1000

const useCountDownTimer = (props: Props) => {
    const { setLoading } = useAuthStore()
    const {
        isEnding,
        startTime,
        status,
        code,
        duration,
        onFinish
    } = props
    const [remainTime, setRemainTime] = useState<number>()
    const checkStatusRef = useRef<any>(null)
    const requestRef = useRef<number | null>(null)

    const checkLiveExamStatus = useCallback(async () => {
        !!checkStatusRef.current && clearTimeout(checkStatusRef.current)
        if (isEnding || !code || status === ExamStatus.Completed) {
            return
        }
        let isOk = false;
        try {
            setLoading(true)
            const res = await getCheckStatusExam(code)
            if (res.data.data.status === ExamStatus.Completed) {
                isOk = true;
                clearTimeout(checkStatusRef.current)
                setLoading(false)
                onFinish()
            } else {
                checkStatusRef.current = setTimeout(
                    checkLiveExamStatus,
                    ONE_SECOND_IN_MILLISECONDS
                )
            }
        } catch (error) {
            console.log({ error })
        }
        finally {
            if (!isOk)
                checkStatusRef.current = setTimeout(
                    checkLiveExamStatus,
                    ONE_SECOND_IN_MILLISECONDS
                )
        }
    }, [code, status, onFinish, isEnding])

    useEffect(() => {
        if (status !== ExamStatus.InProgress || isEnding) return
        const animate = () => {
            if (!startTime || !duration) return
            if (typeof remainTime === "number" && remainTime <= 0) {
                return
            }
            const remain = getRemainTime(startTime, duration)
            if (typeof remain !== "number") {
                setRemainTime(undefined)
                return
            }
            setRemainTime(remain - 1 || 0)
            requestRef.current = requestAnimationFrame(animate)
        }
        requestRef.current = requestAnimationFrame(animate)

        return () => {
            !!requestRef.current && cancelAnimationFrame(requestRef.current)
            setRemainTime(undefined)
        }
    }, [
        startTime,
        duration,
        isEnding
    ])

    useEffect(() => {
        if (typeof remainTime === "number" && remainTime <= 0)
            checkLiveExamStatus();
    }, [remainTime, checkLiveExamStatus])

    return remainTime
}

export default useCountDownTimer
