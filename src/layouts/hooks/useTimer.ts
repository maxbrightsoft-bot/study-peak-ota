import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import moment from "moment"
import _ from "lodash"
import {
    getStudentSubjectListApi,
    getSuperStudentSubjectListApi,
    pauseStudentSubjectApi,
    pauseSuperStudentSubjectApi,
    saveStudentSubjectTimerApi,
    saveSuperStudentSubjectTimerApi,
    startStudentSubjectTimerApi,
    startSuperStudentSubjectTimerApi,
    stopStudentSubjectApi,
    stopSuperStudentSubjectApi
} from "../../services/api/subjectService"
import { SubjectTimerResponse } from "../../utils/types"
import { StudyTimerTabProps } from "../partials/Timer/StudyTimerTab"
import { TimeUpdateDialogProps } from "../partials/Timer/TimeUpdateDialog"
import { INTERVAL_SAVE_TIMER, TIMER_KEY } from "../configs/constants"
import { convertInactiveTimer } from "../configs/fn"
import useAuthStore from "@/store/useAuthStore"
import { TimerStatus } from "@/utils/enums"
import { getCountTime, getErrorMessage, toast } from "@/utils/helpers"
import { DATE_TIME_MIN_VALUE } from "@/utils/constants"
import { useTranslation } from "react-i18next"
import { removeDataStorage, setDataStorage } from "@/utils/storage"
import useServerTime from "@/hooks/useServerTime"

const useTimers = (open: boolean, handleToggle: () => void) => {
    const { user, timers, setTimers, activeTimerId, activeTimerSeconds, setActiveTimerId, setActiveTimerSeconds } = useAuthStore()
    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const fetchedRef = useRef<string | null | undefined>(undefined)
    const { t } = useTranslation()

    const [loadingItem, setLoadingItem] = useState(false)
    const [isFetching, setFetching] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const pageSize = 15;
    const [openTimeUpdateDialog, setOpenTimeUpdateDialog] = useState<SubjectTimerResponse>()
    const { getServerNow } = useServerTime();

    const academyDomain = user?.academyDomain?.toLowerCase?.() ?? ""
    const onAcademy = academyDomain || user?.isLearningSpace

    const handleChangeTime = (data: SubjectTimerResponse, time: number) => {
        if (!user?.superId) return
        if (
            ((academyDomain !== fetchedRef.current && onAcademy) ||
                (!onAcademy && fetchedRef.current !== null)) &&
            data.id !== activeTimerId
        ) return
        setActiveTimerSeconds(time)
    }

    const handleOpenDialogEditTimer = (data: SubjectTimerResponse) => {
        setOpenTimeUpdateDialog(data)
        handleToggle()
    }

    const handleCloseDialogEditTimer = () => {
        setOpenTimeUpdateDialog(undefined)
        handleToggle()
    }

    const handleStopTimer = async (data: SubjectTimerResponse) => {
        const isActive = activeTimerId === data.id
        const isStarted = data.status === TimerStatus.Started
        const timerKey = `${TIMER_KEY}.${user?.superId}.${data.id}.${data.timerId}`
        const nowTime = getServerNow()
        setLoadingItem(true)
        try {
            const stop = onAcademy ? stopStudentSubjectApi : stopSuperStudentSubjectApi
            const res = await stop(data.id, data.timerId, {
                stopTime: moment(nowTime).utc().valueOf(),
                rowVersion: data.rowVersion
            })
            setTimers(timers.map(timer => timer.id === data.id ? res.data : timer))
            setActiveTimerId(isStarted && isActive ? undefined : data.id)
            handleChangeTime(res.data, 0)
            await removeDataStorage(timerKey)
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        } finally {
            setLoadingItem(false)
        }
    }

    const handlePauseTimer = async (
        data: SubjectTimerResponse,
        updateState = true,
        onSuccess?: (data: SubjectTimerResponse) => void,
        onError?: (error: any) => void
    ) => {
        if (data.status === TimerStatus.Paused) return data
        const nowTime = getServerNow()
        const timerKey = `${TIMER_KEY}.${user?.superId}.${data.id}.${data.timerId}`
        try {
            const pause = onAcademy ? pauseStudentSubjectApi : pauseSuperStudentSubjectApi
            const res = await pause(data.id, {
                status: TimerStatus.Paused,
                pauseTime: data.pauseTime ?? moment(nowTime).utc().valueOf(),
                timerId: data.timerId,
                rowVersion: data.rowVersion
            })
            if (updateState) {
                setTimers(timers.map(i => i.id === data.id ? res.data : i))
            }
            onSuccess?.(res.data)
            await removeDataStorage(timerKey)
            return res.data
        } catch (error) {
            onError?.(error)
            return data
        }
    }

    const handlePauseAllTimers = async (
        exceptId?: number,
        timerData?: SubjectTimerResponse[]
    ) => {
        !exceptId && setLoadingItem(true)
        const tasks = (timerData ?? timers)
            .filter(i =>
                i.status === TimerStatus.Started &&
                i.id !== exceptId &&
                i.timerId
            )
            .map(i => handlePauseTimer(i, false))
        const paused = await Promise.all(tasks)
        !exceptId && setLoadingItem(false)
        return paused
    }

    const handleStartOrPauseTimer = async (
        data: SubjectTimerResponse,
        isRestart?: boolean,
        isTimerRunning?: boolean
    ) => {
        const isActive = activeTimerId === data.id
        const isStarted = data.status === TimerStatus.Started
        const isPaused = data.status === TimerStatus.Paused
        const isStopped = data.status === TimerStatus.Stopped
        const timerKey = `${TIMER_KEY}.${user?.superId}.${data.id}.${data.timerId}`

        if (
            isRestart &&
            !isPaused &&
            !isStopped &&
            !isStarted &&
            !data.limitedTimeReached
        ) return

        setLoadingItem(true)
        try {
            const pausedTimers = await handlePauseAllTimers(data.id)
            const mergedTimers = timers.map(
                i => pausedTimers.find(p => p.id === i.id) ?? i
            )
            const nowTime = getServerNow()

            if (data.timerId && !isRestart) {
                if (!isActive && !isPaused) {
                    setActiveTimerId(data.id)
                    setTimers(
                        mergedTimers.map(timer =>
                            timer.id === data.id
                                ? { ...timer, lastResumeTime: moment(nowTime).utc().toISOString() }
                                : timer
                        )
                    )
                } else {
                    const pause = onAcademy ? pauseStudentSubjectApi : pauseSuperStudentSubjectApi
                    const res = await pause(data.id, {
                        status: isPaused ? TimerStatus.Started : TimerStatus.Paused,
                        pauseTime: !isPaused ? moment(nowTime).utc().valueOf() : 0,
                        timerId: data.timerId,
                        rowVersion: data.rowVersion
                    })
                    setTimers(
                        mergedTimers.map(timer =>
                            timer.id === data.id ? res.data : timer
                        )
                    )
                    setActiveTimerId(isStarted && isActive ? undefined : data.id)
                }
            } else {
                let timerSelected = data
                console.log({ data });
                
                if(isTimerRunning ||  data.status == null || data.status === TimerStatus.Stopped || data.status === TimerStatus.NotStarted) {
                    const start = onAcademy ? startStudentSubjectTimerApi : startSuperStudentSubjectTimerApi
                    const res = await start(data.id)
                    timerSelected = res.data
                }

                if(data.status === TimerStatus.Paused) {
                    const stop = onAcademy ? stopStudentSubjectApi : stopSuperStudentSubjectApi
                    const res = await stop(data.id, data.timerId, {
                        stopTime: moment(nowTime).utc().valueOf(),
                        rowVersion: data.rowVersion
                    })
                    timerSelected = res.data
                }
                const exists = mergedTimers.some(t => t.id === data.id)
                if (exists) {
                    setTimers(mergedTimers.map(timer => timer.id === data.id ? timerSelected : timer))
                } else {
                    setTimers([timerSelected, ...mergedTimers])
                }
                setActiveTimerId(isStarted && isActive ? undefined : data.id)
                handleChangeTime(timerSelected, 0)
            }

            await removeDataStorage(timerKey)
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        } finally {
            setLoadingItem(false)
        }
    }

    const getTimers = async (page: number = 1, isLoadMore: boolean = false) => {
        if (!user?.superId || isFetching) return
        if (
            ((onAcademy && fetchedRef.current === academyDomain) ||
                (!onAcademy && fetchedRef.current === null)) &&
            !open && !isLoadMore
        ) return

        setFetching(true)
        try {
            const res = onAcademy
                ? await getStudentSubjectListApi(pageSize, page)
                : await getSuperStudentSubjectListApi(pageSize, page)

            const items: SubjectTimerResponse[] = res.data?.items ?? []
            fetchedRef.current = onAcademy ? academyDomain : null

            const newItems = await Promise.all(
                items.map(item => convertInactiveTimer(item, user.superId))
            )

            const activeId = newItems.find(
                i =>
                    i.status === TimerStatus.Started &&
                    !i.pauseTime &&
                    !i.limitedTimeReached
            )?.id

            const paused = await handlePauseAllTimers(activeId, newItems)

            const finalItems = newItems.map(i =>
                paused.find(p => p.id === i.id) ?? i
            )

            setTimers(isLoadMore ? [...timers, ...finalItems] : finalItems)
            if (!isLoadMore) {
                setActiveTimerId(activeId)
            }
            
            setHasMore(items.length === pageSize)
            setCurrentPage(page)
        } catch (error) {
            if (!isLoadMore) setTimers([])
            toast.error(getErrorMessage(t, error))
        } finally {
            setFetching(false)
        }
    }

    const loadMoreTimers = () => {
        if (!hasMore || isFetching) return
        getTimers(currentPage + 1, true)
    }

    const selectedTimer = timers.find(i => i.id === activeTimerId)

    const handleSaveTimer = useCallback(async () => {
        if (
            !selectedTimer ||
            selectedTimer.status !== TimerStatus.Started ||
            loadingItem ||
            selectedTimer.pauseTime
        ) return

        try {
            const nowTime = getServerNow()
            const save = onAcademy ? saveStudentSubjectTimerApi : saveSuperStudentSubjectTimerApi
            const res = await save(
                selectedTimer.id,
                selectedTimer.timerId,
                { savedTime: moment(nowTime).utc().valueOf() }
            )
            setTimers(
                timers.map(timer =>
                    timer.id === selectedTimer.id
                        ? res.data.data
                        : timer
                )
            )
        } catch { }
    }, [
        selectedTimer?.id,
        selectedTimer?.status,
        selectedTimer?.pauseTime,
        loadingItem,
        onAcademy,
        timers
    ])

    useEffect(() => {
        if (
            !selectedTimer ||
            selectedTimer.status !== TimerStatus.Started ||
            loadingItem ||
            selectedTimer.pauseTime
        ) return

        handleSaveTimer()
        saveIntervalRef.current = setInterval(handleSaveTimer, INTERVAL_SAVE_TIMER)

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current)
                saveIntervalRef.current = null
            }
        }
    }, [
        selectedTimer?.id,
        selectedTimer?.status,
        selectedTimer?.pauseTime,
        loadingItem
    ])

    useEffect(() => {
        if (
            !selectedTimer ||
            selectedTimer.status !== TimerStatus.Started ||
            selectedTimer.id !== activeTimerId ||
            loadingItem
        ) return

        const timerKey = `${TIMER_KEY}.${user?.superId}.${selectedTimer.id}.${selectedTimer.timerId}`
        let ticking = false

        const tick = async () => {
            if (ticking) return
            ticking = true
            const nowTime = getServerNow();
            try {
                const {
                    startTime,
                    lastResumeTime,
                    duration,
                    pauseTime,
                    limitedReachedTime
                } = selectedTimer

                const startOfTime =
                    lastResumeTime !== DATE_TIME_MIN_VALUE
                        ? lastResumeTime
                        : startTime

                if (limitedReachedTime && moment.utc(limitedReachedTime).isBefore(moment.utc())) {
                    handleStopTimer(selectedTimer)
                    return
                }

                if (startOfTime === DATE_TIME_MIN_VALUE || pauseTime) return

                const time = getCountTime(startOfTime, duration, nowTime)
                if (typeof time !== "number") {
                    handleChangeTime(selectedTimer, 0)
                    return
                }

                const secs = Math.floor(time / 1000)
                handleChangeTime(selectedTimer, secs)
                await setDataStorage(timerKey, `${nowTime}`)
            } finally {
                ticking = false
            }
        }

        tick()
        timerIntervalRef.current = setInterval(tick, 1000)

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
                timerIntervalRef.current = null
            }
        }
    }, [
        selectedTimer?.id,
        selectedTimer?.status,
        selectedTimer?.pauseTime,
        activeTimerId,
        loadingItem
    ])

    const isTimerRunning = timers.some(t => t.status === TimerStatus.Started)

    const studyTimerProps: StudyTimerTabProps = {
        getTimers,
        isFetching,
        loadingItem,
        subjects: timers,
        activeTimerId,
        time: activeTimerSeconds,
        onStartOrPause: handleStartOrPauseTimer,
        onEditTimer: handleOpenDialogEditTimer,
        onStopTimer: handleStopTimer,
        hasMore,
        loadMoreTimers
    }

    const timeUpdateDialogProps: TimeUpdateDialogProps = {
        seconds: activeTimerSeconds,
        data: openTimeUpdateDialog,
        activeTimerId,
        open: !!openTimeUpdateDialog,
        onClose: handleCloseDialogEditTimer
    }

    return {
        timers,
        studyTimerProps,
        timeUpdateDialogProps,
        isTimerRunning,
        handlePauseCurrentTimer: async (
            onSuccess?: (data: SubjectTimerResponse) => void,
            onError?: (error: any) => void
        ) => {
            if (!selectedTimer) return
            setLoadingItem(true)
            await handlePauseTimer(selectedTimer, true, onSuccess, onError)
            setLoadingItem(false)
        },
        getTimers
    }
}

export default useTimers
