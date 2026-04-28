import { t } from "i18next"
import _ from "lodash"
import moment from "moment"
import { useState, useRef, useMemo, useEffect } from "react"

import { formatTime, getTime } from "../configs/fn"
import { SubjectTimerResponse, UpdateSubjectTimerInfoRequest, UpdateSubjectTimersInfoRequest } from "../../utils/types"
import { Timer } from "../configs/types"
import useAuthStore from "@/store/useAuthStore"
import { TimerStatus } from "@/utils/enums"
import { DATE_TIME_MIN_VALUE, MS_IN_SECOND } from "@/utils/constants"
import { getSuperTimerByIdApi, getSuperTimersApi, getTimerByIdApi, getTimersApi, updateSuperTimerByIdApi, updateSuperTimersApi, updateTimerByIdApi, updateTimersApi } from "@/services/api/subjectService"
import { getErrorMessage, getMessageFromError, toast } from "@/utils/helpers"

const useTimeUpdate = (
    open: boolean,
    onClose: () => void,
    data?: SubjectTimerResponse
) => {
    const [currentTimeLines, setCurrentTimeLines] = useState<Timer[]>([])
    const [loading, setIsLoading] = useState<boolean>(false)
    const [value, setValue] = useState<number>(0)
    const today = moment()
    const [selectedDate, setSelectedDate] = useState<moment.Moment>()
    const { user, setLoading } = useAuthStore()
    const academyDomain = user?.academyDomain?.toLowerCase?.() ?? ""
    const onAcademy = academyDomain || user?.isLearningSpace
    const originTimeLine = useRef<Timer[]>([])
    const [timeErrors, setTimeErrors] = useState<any>({})

    const handleTimeErrors = (index: number, val: boolean) => {
        setTimeErrors((state: any) => ({
            ...state,
            [index]: val
        }))
    }
    const updateTimer = async () => {
        if (!data || !currentTimeLines[0]) return
        setLoading(true)
        try {
            const timer = currentTimeLines[0]
            const endTimeStr = timer.status === TimerStatus.Stopped ? timer.stoppedAt : timer.lastPauseTime;
            const stoppedTime = endTimeStr && endTimeStr !== DATE_TIME_MIN_VALUE ? moment.utc(endTimeStr).valueOf() : undefined;
            const reqData: UpdateSubjectTimerInfoRequest = {
                rowVersion: timer.rowVersion,
                startTime: moment.utc(timer.startTime).valueOf(),
                stoppedTime: stoppedTime,
                totalTime: timer.duration
            }
            const update = onAcademy
                ? updateTimerByIdApi
                : updateSuperTimerByIdApi
            await update(data.id, data.timerId, reqData)
            await getTimerDetail()
        } catch (error) {
            toast.error(getMessageFromError(t, error))
        }
        setLoading(false)
    }

    const updateTimers = async () => {
        if (!data || !selectedDate) return
        setLoading(true)
        try {
            const reqData: UpdateSubjectTimersInfoRequest = {
                startDate: selectedDate.clone().startOf("day").utc().valueOf(),
                endDate: selectedDate.clone().endOf("day").utc().valueOf(),
                timers: currentTimeLines.map(timer => {
                    const endTimeStr = timer.status === TimerStatus.Stopped ? timer.stoppedAt : timer.lastPauseTime;
                    const stoppedTime = endTimeStr && endTimeStr !== DATE_TIME_MIN_VALUE ? moment.utc(endTimeStr).valueOf() : undefined;
                    return {
                        id: timer.id,
                        rowVersion: timer.rowVersion,
                        startTime: moment.utc(timer.startTime).valueOf(),
                        stoppedTime: stoppedTime,
                        totalTime: timer.duration
                    }
                })
            }
            const update = onAcademy ? updateTimersApi : updateSuperTimersApi
            await update(data.id, reqData)
            await getTimersByDate()
        } catch (error) {
            toast.error(getMessageFromError(t, error))
        }
        setLoading(false)
    }

    const getTimerDetail = async () => {
        if (!data) return
        setIsLoading(true)
        try {
            const getTimer = onAcademy ? getTimerByIdApi : getSuperTimerByIdApi
            const res = await getTimer(data.id, data.timerId)
            setCurrentTimeLines([res.data])
            originTimeLine.current = [res.data]
        } catch (error) {
            toast.error(getErrorMessage(t, error))
            setCurrentTimeLines([])
            originTimeLine.current = []
        }
        setIsLoading(false)
    }

    const getTimersByDate = async () => {
        if (!data || !selectedDate) return
        setIsLoading(true)
        const startDate = selectedDate.clone().startOf("day").utc().valueOf()
        const endDate = selectedDate.clone().endOf("day").utc().valueOf()

        try {
            const getTimers = onAcademy ? getTimersApi : getSuperTimersApi
            const res = await getTimers(data.id, {
                startDate,
                endDate
            })
            setCurrentTimeLines(res.data?.items ?? [])
            originTimeLine.current = res.data?.items ?? []
        } catch (error) {
            toast.error(getErrorMessage(t, error))
            setCurrentTimeLines([])
            originTimeLine.current = []
        }
        setIsLoading(false)
    }
    const handleClose = (
        _: any,
        reason?: "backdropClick" | "escapeKeyDown"
    ) => {
        if (reason !== undefined) return
        onClose()
        setValue(0)
    }

    const handleChange = (event: any, newValue?: number) => {
        const val = typeof event === 'number' ? event : newValue
        if (val !== undefined) {
            setValue(val)
            setCurrentTimeLines([])
        }
    }
    const handleUpdateStart = (index: number, newTime: moment.Moment) => {
        const timer = currentTimeLines[index]
        const oldStartTime = moment.utc(timer.startTime)
        const newStartTimeStr = newTime.utc().toISOString()
        const diff = oldStartTime.diff(newTime, 'milliseconds')
        let newDuration = Math.max(0, timer.duration + diff)
        
        const endTimeStr = timer.status === TimerStatus.Stopped ? timer.stoppedAt : timer.lastPauseTime;
        if (endTimeStr && endTimeStr !== DATE_TIME_MIN_VALUE) {
            const maxDuration = moment.utc(endTimeStr).diff(newTime, 'milliseconds');
            newDuration = Math.min(newDuration, Math.max(0, maxDuration));
        }
        
        const newTimer = { ...timer, startTime: newStartTimeStr, duration: newDuration }
        const newLines = [...currentTimeLines]
        newLines[index] = newTimer
        setCurrentTimeLines(newLines)
    }

    const handleUpdateEnd = (index: number, newTime: moment.Moment) => {
        const timer = currentTimeLines[index]
        const oldEndTimeStr = timer.status === TimerStatus.Stopped ? timer.stoppedAt : timer.lastPauseTime;
        if (!oldEndTimeStr || oldEndTimeStr === DATE_TIME_MIN_VALUE) return
        const oldEndTime = moment.utc(oldEndTimeStr)
        const newEndTimeStr = newTime.utc().toISOString()
        const diff = newTime.diff(oldEndTime, 'milliseconds')
        let newDuration = Math.max(0, timer.duration + diff)
        
        const startTime = moment.utc(timer.startTime)
        const maxDuration = newTime.diff(startTime, 'milliseconds')
        newDuration = Math.min(newDuration, Math.max(0, maxDuration))
        
        const newTimer = timer.status === TimerStatus.Stopped 
            ? { ...timer, stoppedAt: newEndTimeStr, duration: newDuration } 
            : { ...timer, lastPauseTime: newEndTimeStr, duration: newDuration }
            
        const newLines = [...currentTimeLines]
        newLines[index] = newTimer
        setCurrentTimeLines(newLines)
    }

    const handleUpdateDuration = (index: number, newDuration: number) => {
        const timer = currentTimeLines[index]
        const newTimer = { ...timer, duration: newDuration }
        const newLines = [...currentTimeLines]
        newLines[index] = newTimer
        setCurrentTimeLines(newLines)
    }

    const handleAddTimerAt = (index: number, newTimer: Timer) => {
        const newLines = [...currentTimeLines]
        newLines.splice(index, 0, newTimer)
        setCurrentTimeLines(newLines)
    }

    const handleRemoveTimer = (index: number) => {
        const newLines = [...currentTimeLines]
        newLines.splice(index, 1)
        setCurrentTimeLines(newLines)
    }

    const handleChangeDate = (newValue: moment.Moment | null) => {
        setSelectedDate(newValue ?? moment())
    }
    useEffect(() => {
        if (value === 1) setSelectedDate(today)
    }, [value, today.clone().startOf("day").valueOf()])

    useEffect(() => {
        if (!open) {
            setCurrentTimeLines([])
            setSelectedDate(undefined)
            setValue(0)
        }
    }, [open])

    useEffect(() => {
        if (open && value === 0) getTimerDetail()
    }, [open, value, data?.id, data?.timerId])

    useEffect(() => {
        if (open && value === 1) getTimersByDate()
    }, [
        open,
        value,
        data?.id,
        data?.timerId,
        selectedDate?.clone().startOf("day").valueOf()
    ])

    const handleUpdateTimerRecords = () => {
        if (value) updateTimers()
        else updateTimer()
    }
    const totalTime = useMemo(() => {
        return formatTime(
            Math.floor(
                currentTimeLines.reduce(
                    (acc, current) => acc + getTime({
                        ...current,
                        name: "",
                        timerId: 0
                    }),
                    0
                ) / MS_IN_SECOND
            ),
            t
        )
    }, [JSON.stringify(currentTimeLines), t])

    const isEdited = useMemo(() => {
        return (
            JSON.stringify(originTimeLine.current) !==
            JSON.stringify(currentTimeLines)
        )
    }, [JSON.stringify(currentTimeLines)])

    const isTimeError = useMemo(() => {
        for (const key in timeErrors) {
            if (Object.prototype.hasOwnProperty.call(timeErrors, key)) {
                const element = timeErrors[key];
                if(element) return true
            }
        }
        return false
    }, [JSON.stringify(timeErrors)])

    return {
        isTimeError,
        value,
        selectedDate,
        loading,
        isEdited,
        totalTime,
        currentTimeLines,
        today,
        handleUpdateTimerRecords,
        handleChangeDate,
        handleClose,
        handleUpdateStart,
        handleUpdateEnd,
        handleUpdateDuration,
        handleAddTimerAt,
        handleRemoveTimer,
        handleChange,
        handleTimeErrors,
        getTimerDetail,
        getTimersByDate
    }
}

export default useTimeUpdate
