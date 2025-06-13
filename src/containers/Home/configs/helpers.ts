import { ScheduleFormData, ScheduleRequest } from "./type";

export const formatTime = (t: any, timeInMilliseconds: number) => {
  const hours = Math.floor(timeInMilliseconds / 3600000);
  const minutes = Math.floor((timeInMilliseconds % 3600000) / 60000);
  const seconds = Math.floor((timeInMilliseconds % 60000) / 1000);
  return timeInMilliseconds < 60
    ? `${timeInMilliseconds}${t("seconds")}`
    : t("hours_mins_seconds", {
        hours: hours,
        mins: minutes,
        seconds: seconds
      });
};

export const convertScheduleFormToRequest = (scheduleFrom: ScheduleFormData) => {
  const date = scheduleFrom.date ?
        scheduleFrom.date.isUTC()
          ? scheduleFrom.date.format("YYYY-MM-DDTHH:mm:ss")
          : scheduleFrom.date
              .startOf("day")
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss")
        : "";
    const schedule: ScheduleRequest = {
      title: scheduleFrom.title,
      startTime: scheduleFrom.startTime?.utc().format("HH:mm:ss") ?? "",
      endTime: scheduleFrom.endTime?.utc().format("HH:mm:ss") ?? "",
      date
    }
    
    return schedule
}
