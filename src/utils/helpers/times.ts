import _ from "lodash"
import moment, { Moment, unitOfTime } from "moment"
import { DATE_MIN_VALUE, DATE_TIME_MIN_VALUE } from "../constants"

export const getLocalDayOfWeek = (utcDateTime: string, dayOfWeek: number) => {
    const currentDayOfWeek = moment.utc(utcDateTime).weekday()
    let diff = dayOfWeek - currentDayOfWeek
    if (diff < 0) diff += 7
    return moment.utc(utcDateTime).add(diff, "days").local().weekday()
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

export const formatMinutesToTime = (minutes: number) => {
  const totalSeconds = Math.floor(minutes * 60)

  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60

  const paddedMins = String(mins).padStart(2, '0')
  const paddedSecs = String(secs).padStart(2, '0')

  return `${paddedMins}:${paddedSecs}`
}

export const isValidTime = (time?: string) => {
    if (!time || time === DATE_MIN_VALUE || time === DATE_TIME_MIN_VALUE) return false
    return true
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

export const getLessonDateTime = (time: string, date?: string): Moment => {
    const originalDate = date ? moment.utc(date) : moment.utc().startOf('day');
    let lessonDate = originalDate.clone().startOf('day').add(moment.duration(time));
    
    if (lessonDate.isBefore(originalDate))
        lessonDate = lessonDate.add(1, 'day');
    return lessonDate.local();
}
export const getLessonFormat = (t: any, date: string, startTime: string, endTime: string) => {
    const startDate = getLessonDateTime(startTime, date)
    const endDate = getLessonDateTime(endTime, date)
    const isSameDate = startDate.isSame(endDate, 'day')
    const dateFormat = isSameDate ? `${startDate.format("HH:mm")} ~ ${endDate.format("HH:mm")} ${startDate.format(t("date_format"))}` : `${startDate.format(`HH:mm ${t("date_format")}`)} ~ ${startDate.format(`HH:mm ${t("date_format")}`)}`
    return dateFormat
}
export const convertHHMMSStoSeconds = (time?: string) => {
    if(!time) return 0
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

export const getRemainTimeFromMinutes = (startTime: string, duration: number, runningTime: number, lastResumeTime?: string) => {
    const time = (!lastResumeTime || lastResumeTime === DATE_TIME_MIN_VALUE) ? startTime : lastResumeTime
    const timePass = diffFromNow(time, "milliseconds")
    if (typeof timePass !== "number") return null
    const totalTimePassed = runningTime + timePass
    if (totalTimePassed > duration) return 0
    return duration - totalTimePassed
}

export const getCountTime = (startTime: string, duration: number) => {
    const timePass = diffFromNow(startTime, "milliseconds")
    if (typeof timePass !== "number") return null
    return duration + timePass
}