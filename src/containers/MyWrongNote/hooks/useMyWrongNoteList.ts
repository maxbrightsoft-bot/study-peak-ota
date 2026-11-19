import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { getErrorMessage, toast } from "@/utils/helpers"
import {
    getMyWrongNoteExamsApi,
    getMyWrongNoteExamTotalsApi,
    getMyWrongNoteSummaryApi
} from "../apiClients"
import { MY_WRONG_NOTE_PAGE_SIZE } from "../configs/constants"
import { MyExamFilter } from "../configs/enums"
import { mergePage } from "../configs/helpers"
import {
    MyExamItemResponse,
    MyExamTotalsResponse,
    MyWrongNoteSummaryResponse
} from "../configs/types"

export type RefreshOptions = {
    /** Reload without the pull-to-refresh spinner (focus / return from detail). */
    silent?: boolean
}

const useMyWrongNoteList = () => {
    const { t } = useTranslation()
    const tRef = useRef(t)
    tRef.current = t

    const [summary, setSummary] = useState<MyWrongNoteSummaryResponse>()
    const [totals, setTotals] = useState<MyExamTotalsResponse>()
    const [filter, setFilterState] = useState<MyExamFilter>(MyExamFilter.Todo)
    const [exams, setExams] = useState<MyExamItemResponse[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    // First page of the current filter / further pages / pull-to-refresh.
    const [isLoading, setLoading] = useState<boolean>(true)
    const [isLoadingMore, setLoadingMore] = useState<boolean>(false)
    const [isRefreshing, setRefreshing] = useState<boolean>(false)
    // exams page-1 failure vs summary/totals failure.
    const [error, setError] = useState<string>()
    const [summaryError, setSummaryError] = useState<string>()

    // Only the response of the latest exams request may update state.
    const requestIdRef = useRef<number>(0)
    const pageRef = useRef<number>(1)
    const loadingRef = useRef<boolean>(false)
    const hasMoreRef = useRef<boolean>(false)
    const examsRef = useRef<MyExamItemResponse[]>([])
    const filterRef = useRef<MyExamFilter>(MyExamFilter.Todo)
    const mountedRef = useRef<boolean>(true)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    const loadExams = useCallback(
        async (
            page: number,
            targetFilter: MyExamFilter,
            quiet = false
        ) => {
            const requestId = ++requestIdRef.current
            loadingRef.current = true
            // quiet = reload of data already on screen (pull / focus): no skeleton.
            if (!quiet) {
                setLoading(page === 1)
                setLoadingMore(page > 1)
            }
            try {
                const res = await getMyWrongNoteExamsApi({
                    filter: targetFilter,
                    currentPage: page,
                    pageSize: MY_WRONG_NOTE_PAGE_SIZE
                })
                if (requestId !== requestIdRef.current) return
                const merged = mergePage(
                    page > 1 ? examsRef.current : [],
                    res.data
                )
                examsRef.current = merged.items
                pageRef.current = page
                hasMoreRef.current = merged.hasMore
                setExams(merged.items)
                setHasMore(merged.hasMore)
                setError(undefined)
            } catch (e) {
                if (requestId !== requestIdRef.current) return
                const message = getErrorMessage(tRef.current, e)
                if (page > 1) toast.error(message)
                else setError(message)
            } finally {
                if (requestId === requestIdRef.current) {
                    loadingRef.current = false
                    setLoading(false)
                    setLoadingMore(false)
                }
            }
        },
        []
    )

    // Never rejects: failures land in summaryError.
    const loadSummaryAndTotals = useCallback(async () => {
        try {
            const [summaryRes, totalsRes] = await Promise.all([
                getMyWrongNoteSummaryApi(),
                getMyWrongNoteExamTotalsApi()
            ])
            if (!mountedRef.current) return
            setSummary(summaryRes.data)
            setTotals(totalsRes.data)
            setSummaryError(undefined)
        } catch (e) {
            if (!mountedRef.current) return
            setSummaryError(getErrorMessage(tRef.current, e))
        }
    }, [])

    // First load: summary + totals once, exams for the initial filter.
    useEffect(() => {
        loadSummaryAndTotals()
        loadExams(1, filterRef.current)
    }, [loadSummaryAndTotals, loadExams])

    const setFilter = useCallback(
        (next: MyExamFilter) => {
            // Same filter: nothing to reload.
            if (next === filterRef.current) return
            filterRef.current = next
            pageRef.current = 1
            hasMoreRef.current = false
            examsRef.current = []
            setExams([])
            setHasMore(false)
            setError(undefined)
            setFilterState(next)
            // Load directly (does not depend on a re-render); the new request id
            // also invalidates any in-flight request of the previous filter.
            loadExams(1, next)
        },
        [loadExams]
    )

    const refresh = useCallback(
        async (options?: RefreshOptions) => {
            const silent = options?.silent === true
            if (!silent) setRefreshing(true)
            try {
                await Promise.allSettled([
                    loadSummaryAndTotals(),
                    loadExams(1, filterRef.current, true)
                ])
            } finally {
                if (!silent && mountedRef.current) setRefreshing(false)
            }
        },
        [loadExams, loadSummaryAndTotals]
    )

    const loadMore = useCallback(() => {
        if (loadingRef.current || !hasMoreRef.current) return
        loadExams(pageRef.current + 1, filterRef.current)
    }, [loadExams])

    return {
        summary,
        totals,
        filter,
        setFilter,
        exams,
        hasMore,
        isLoading,
        isLoadingMore,
        isRefreshing,
        error,
        summaryError,
        refresh,
        loadMore
    }
}

export default useMyWrongNoteList
