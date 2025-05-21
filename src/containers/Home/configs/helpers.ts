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
