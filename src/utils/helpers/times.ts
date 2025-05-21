import _ from "lodash"
import moment, { unitOfTime } from "moment"
import { DATE_MIN_VALUE } from "../constants"

export const getLocalDayOfWeek = (utcDateTime: string, dayOfWeek: number) => {
    const currentDayOfWeek = moment.utc(utcDateTime).weekday()
    let diff = dayOfWeek - currentDayOfWeek
    if (diff < 0) diff += 7
    return moment.utc(utcDateTime).add(diff, "days").local().weekday()
}

export const getUtcDayOfWeek = (
    localDateTime: moment.Moment,
    dayOfWeek: number
) => {
    const currentDayOfWeek = (_.cloneDeep(localDateTime) as moment.Moment).local().weekday()
    let diff = dayOfWeek - currentDayOfWeek
    if (diff < 0) diff += 7
    return localDateTime.add(diff, "days").utc().weekday()
}

export const timeSpanToLocalMoment = (time: string, date?: string) => {
    if (!time) return null
    const times = time.split(":")

    if (times.length !== 3) return null
    const totalSeconds = +times[0] * 60 * 60 + +times[1] * 60 + +times[2]
    const startOfDay = moment.utc(date).startOf("day")
    let dateTime = date ? startOfDay.add(totalSeconds, "seconds") : moment().startOf("day")
    if (date && dateTime.isBefore(moment.utc(date)))
        dateTime = dateTime.add(1, "day")
    return dateTime.local()
}


export const diffFromNow = (time: string, unitOfTime: unitOfTime.Diff, targetTime?: string) => {
    if (time === DATE_MIN_VALUE || targetTime === DATE_MIN_VALUE) return 0
    try {
        const now = !targetTime ? moment() : moment.utc(targetTime).local();
        return now.diff(moment.utc(time).local(), unitOfTime)
    } catch {
        return ""
    }
}

export const convertHHMMSStoSeconds = (time: string) => {
    var times = time.split(":")
    return +times[0] * 60 * 60 + +times[1] * 60 + +times[2]
}

export const getRemainTime = (startTime: string, duration: string) => {
    const timePass = diffFromNow(startTime, "second")
    const durationInNumber = convertHHMMSStoSeconds(duration)
    if (typeof timePass !== "number") return null
    if (timePass > durationInNumber) return 0
    return durationInNumber - timePass
}

export const toISOString = (time?: string) => {
    try {
        return moment(time).toISOString()
    } catch {
        return ""
    }
}

export const formatTimeSecond = (duration: number, t: any) => {
    duration = Math.round(duration)
    return `${duration < 60 ? `${duration}${t("seconds")}` : t("mins_mins_seconds_seconds", {
        mins: Math.floor(duration / 60),
        seconds: duration % 60
    })}`
}

export const formatTimeDiff = (my: number, top: number, t: any) => {
    const diff = Math.round(my - top)
    let prefix = ""
    if (diff < 0) prefix = "-"
    if (diff > 0) prefix = "+"
    return `${prefix}${formatTimeSecond(Math.abs(diff), t)}`
}

export const formatDuration = (t: any, duration: number) => {
    if(!duration) return `0${t("seconds")}`
    const totalTime = Math.round(duration)
    return totalTime > 60 ? t("mins_mins_seconds_seconds", {
        mins: Math.floor(totalTime/60),
        seconds: totalTime % 60
    }) : `${Math.round(duration)}${t("seconds")}`
}