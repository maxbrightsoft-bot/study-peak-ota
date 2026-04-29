import { TimerStatus } from "@/utils/enums"
import { SubjectTimerResponse } from "../../utils/types"
import {
    DEFAULT_TIME_IN_MINUTES,
    TIMER_KEY,
    TOTAL_SECONDS_IN_A_MINUTE,
    TOTAL_SECONDS_IN_AN_HOUR
} from "./constants"
import { TimerBase } from "./types"
import moment from "moment"
import { DATE_TIME_MIN_VALUE } from "@/utils/constants"
import { getDataStorage, removeDataStorage } from "@/utils/storage"

export const formatTime = (totalSeconds: number, t: any): string => {
    const hours = Math.floor(totalSeconds / TOTAL_SECONDS_IN_AN_HOUR)
    const minutes = Math.floor(
        (totalSeconds % TOTAL_SECONDS_IN_AN_HOUR) / TOTAL_SECONDS_IN_A_MINUTE
    )
    const seconds = totalSeconds % TOTAL_SECONDS_IN_A_MINUTE

    if (hours > 0) {
        return `${hours.toString().padStart(2, "0")}${t("hour_h")} ${minutes.toString().padStart(2, "0")}${t("minutes")} ${seconds.toString().padStart(2, "0")}${t("seconds")}`
    }
    if (minutes > 0) {
        return `${minutes.toString().padStart(2, "0")}${t("minutes")} ${seconds.toString().padStart(2, "0")}${t("seconds")}`
    }
    return `${seconds.toString().padStart(2, "0")}${t("seconds")}`
}
export const getDisplayDiffTime = (t: any, startTime: moment.Moment, endTime: moment.Moment) => {
    const diff = Math.floor(Math.max(0, endTime.diff(startTime, "seconds")))
    return formatTime(diff, t)
}
export const getDisplayTime = (t: any, data?: TimerBase, activeTimerId?: number, seconds?: number) => {
    if (!data) return formatTime(0, t)
    const limitedTime = Math.floor(data.limitedTime / 1000)
    const duration = Math.floor(data.duration / 1000)
    switch (data.status) {
        case TimerStatus.Started:
            return data.limitedTimeReached
                ? formatTime(limitedTime, t)
                : activeTimerId !== data.id
                    ? formatTime(duration, t)
                    : formatTime(Math.max(seconds ?? 0, 0), t)
        case TimerStatus.NotStarted:
            return null
        case TimerStatus.Stopped:
            return formatTime(0, t)
        default:
            return formatTime(duration, t)
    }
}
export const getTime = (data?: TimerBase, activeTimerId?: number, seconds?: number) => {
    if (!data) return 0
    switch (data.status) {
        case TimerStatus.Started:
            return data.limitedTimeReached
                ? data.limitedTime
                : activeTimerId !== data.id
                    ? data.duration
                    : seconds ?? 0
        case TimerStatus.NotStarted:
            return 0
        default:
            return data.limitedTimeReached
                ? data.limitedTime
                : data.duration
    }
}

export const getPrevTimes = (timeValue: moment.Moment) => {
    let startMoment = timeValue.clone().add(-DEFAULT_TIME_IN_MINUTES - 1, "minutes")
    let endMoment = timeValue.clone().add(-1, "minutes")
    if (!startMoment.isSame(endMoment, "day")) {
        endMoment = endMoment.clone().startOf("days").add(-1, "minutes")
        startMoment = endMoment.clone().add(-1, "minutes")
    }
    return {
        startMoment,
        endMoment
    }
}
export const getNextTimes = (date: moment.Moment, timeValue?: moment.Moment) => {
    const endMoment = timeValue ? timeValue.clone().add(DEFAULT_TIME_IN_MINUTES + 1, "minutes") : date.clone().startOf("days").add(DEFAULT_TIME_IN_MINUTES + 1, "minutes")
    const startMoment = endMoment.clone().add(-1, "minutes")
    return {
        startMoment,
        endMoment
    }
}
export const isNextTimeValid = (date: moment.Moment, timeValue?: moment.Moment) => {
    const endMoment = timeValue ? timeValue.clone().add(DEFAULT_TIME_IN_MINUTES + 1, "minutes") : date.clone().startOf("days").add(DEFAULT_TIME_IN_MINUTES + 1, "minutes")
    if (moment().isBefore(endMoment)) return false;
    return date.isSame(endMoment, "day")
}

export const convertInactiveTimer = async (item: SubjectTimerResponse, userSuperId: number): Promise<SubjectTimerResponse> => {
    const { startTime, status, lastResumeTime, limitedInactiveTime, checkPointTime } = item
    if (status !== TimerStatus.Started || !checkPointTime || !limitedInactiveTime) return item
    const timerKey = `${TIMER_KEY}.${userSuperId}.${item.id}.${item.timerId}`
    const savedTime = await getDataStorage(timerKey) ?? ""
    const savedMoment = moment.utc(+savedTime)
    const startTimeValue = moment.utc(startTime)
    const lastResumeTimeValue = lastResumeTime === DATE_TIME_MIN_VALUE ? null : moment.utc(lastResumeTime)
    const checkPointTimeValue = moment.utc(checkPointTime)
    let limitedInactiveTimeValue = moment.utc(limitedInactiveTime)
    const now = moment().utc()
    const isValidSavedTime = !!savedTime && savedMoment.isValid() && savedMoment.isBefore(now) && savedMoment.isAfter(startTimeValue) && (!lastResumeTimeValue || savedMoment.isBefore(lastResumeTimeValue))

    if (!isValidSavedTime)
        await removeDataStorage(timerKey)

    const diff = savedMoment.diff(checkPointTimeValue, "seconds")
    limitedInactiveTimeValue = diff <= 0 ? limitedInactiveTimeValue : limitedInactiveTimeValue.clone().add(diff, "seconds")

    const isReachedLimited = limitedInactiveTimeValue.isBefore(now)
    const newItem = {
        ...item,
        pauseTime: isReachedLimited ? limitedInactiveTimeValue.valueOf() : undefined
    }
    return newItem
}

export const getDefaultAltName = (name: string) => {
    return name.toUpperCase().split(" ").slice(0, 2).map((c: string) => c.charAt(0))
}