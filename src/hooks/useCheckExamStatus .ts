import { getCheckStatusExam } from "@/services";
import { checkTextbookApi } from "@/services/api/textbookService";
import useAuthStore from "@/store/useAuthStore";
import { ExamStatus } from "@/utils/enums";
import { useEffect, useRef } from "react"

const ONE_SECOND_IN_MILLISECONDS = 1000

interface CheckStatusParams {
    code?: string;
    textbookId?: number;
    studentSessionId?: number;
    examStatus?: ExamStatus;
}

const useCheckExamStatus = (onSuccess?: (data: CheckStatusParams, callback?: Function) => void, isStop?: boolean) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { setLoading } = useAuthStore()
    const stopRef = useRef<boolean | undefined>(isStop)
    const onSuccessRef = useRef(onSuccess)
    onSuccessRef.current = onSuccess

    const checkStatus = async (data: CheckStatusParams, onSuccess?: Function, onFailure?: Function) => {
        if (timerRef.current) clearTimeout(timerRef.current)

        const { code, textbookId, studentSessionId, examStatus } = data

        if ((!code && !textbookId) || examStatus === ExamStatus.Paused || stopRef.current) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const res = code
                ? await getCheckStatusExam(code, studentSessionId)
                : await checkTextbookApi(textbookId!)
            const responseData = res.data.data ?? {}
            const { status, isCalculatedResults } = responseData

            if (status === ExamStatus.Completed && (isCalculatedResults === undefined || isCalculatedResults)) {
                setLoading(false)
                if (onSuccessRef.current)
                    onSuccessRef.current(data, onSuccess)
                else
                    onSuccess?.()
            } else {
                timerRef.current = setTimeout(() => checkStatus(data, onSuccess, onFailure), ONE_SECOND_IN_MILLISECONDS)
            }
        } catch (error) {
            if ((error as any)?.response?.status === 404) {
                setLoading(false)
                onFailure?.()
            } else {
                timerRef.current = setTimeout(() => checkStatus(data, onSuccess, onFailure), ONE_SECOND_IN_MILLISECONDS)
            }
        }
    }

    useEffect(() => {
        stopRef.current = isStop
    }, [isStop])

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    return { checkStatus }
}

export default useCheckExamStatus