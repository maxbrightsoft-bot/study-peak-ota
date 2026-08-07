import _ from "lodash"
import moment, { Moment } from "moment"
import { DATE_MIN_VALUE, DATE_TIME_MIN_VALUE } from "../constants"

export const getLocalDayOfWeek = (utcDateTime: string, dayOfWeek: number) => {
    const currentDayOfWeek = moment.utc(utcDateTime).weekday()
    let diff = dayOfWeek - currentDayOfWeek
    if (diff < 0) diff += 7
    return moment.utc(utcDateTime).add(diff, "days").local().weekday()
}

export const parseUTC = (t: string) => {
  if (!t) return NaN;

  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(t)) {
    return new Date(t).getTime();
  }
  return new Date(t + 'Z').getTime();
};

export const diffFromNow = (
  time: string,
  nowMs: number,
  targetTime?: string
) => {
  const baseNow = targetTime
    ? parseUTC(targetTime)
    : nowMs;

  const t = parseUTC(time);

  return baseNow - t;
};

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

export const getRemainTimeFromMinutes = (startTime: string, duration: number, runningTime: number, nowTime: number, lastResumeTime?: string) => {
    const time = (!lastResumeTime || lastResumeTime === DATE_TIME_MIN_VALUE) ? startTime : lastResumeTime
    const timePass = diffFromNow(time, nowTime)
    if (typeof timePass !== "number") return null
    const totalTimePassed = runningTime + timePass
    if (totalTimePassed > duration) return 0
    return duration - totalTimePassed
}

export const getCountTime = (
  startTime: string,
  duration: number,
  nowTime: number
) => {
  const start = parseUTC(startTime)
  if (isNaN(start)) return null

  return duration + (nowTime - start)
}