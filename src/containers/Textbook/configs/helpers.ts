export const formatTime = (t: any, timeInMilliseconds: number) => {
    const hours = Math.floor(timeInMilliseconds / 3600000);
    const minutes = Math.floor((timeInMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((timeInMilliseconds % 60000) / 1000);
    return t("hours_mins_seconds", {
      hours: hours.toString().padStart(2, "0"),
      mins: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0")
    })
  };