import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { getErrorMessage } from "@/utils/helpers"
import { getMyWrongNoteExamApi } from "../apiClients"
import { MyExamDetailResponse } from "../configs/types"

const useMyWrongNoteDetail = (
    examSessionId?: number,
    studentExamSessionId?: number
) => {
    const { t } = useTranslation()

    const [detail, setDetail] = useState<MyExamDetailResponse>()
    const [isLoading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>()
    const [notFound, setNotFound] = useState<boolean>(false)

    const requestIdRef = useRef<number>(0)

    const reload = useCallback(async () => {
        const requestId = ++requestIdRef.current
        if (examSessionId === undefined) {
            setDetail(undefined)
            setError(undefined)
            setNotFound(false)
            setLoading(false)
            return
        }
        setLoading(true)
        setError(undefined)
        setNotFound(false)
        try {
            const res = await getMyWrongNoteExamApi(
                examSessionId,
                studentExamSessionId !== undefined
                    ? { studentExamSessionId }
                    : undefined
            )
            if (requestId !== requestIdRef.current) return
            setDetail(res.data)
        } catch (e: any) {
            if (requestId !== requestIdRef.current) return
            setDetail(undefined)
            if (e?.response?.status === 404) setNotFound(true)
            else setError(getErrorMessage(t, e))
        } finally {
            if (requestId === requestIdRef.current) setLoading(false)
        }
    }, [examSessionId, studentExamSessionId, t])

    useEffect(() => {
        reload()
    }, [reload])

    return { detail, isLoading, error, notFound, reload }
}

export default useMyWrongNoteDetail
