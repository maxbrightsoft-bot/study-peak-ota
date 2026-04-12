import useServerTime from "@/hooks/useServerTime";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  startTime?: moment.Moment;
  studyTime: number;
  textbookId: number;
}

export const useTextbookTimer = (props: Props) => {
  const { getServerNow } = useServerTime();
  const [elapsedTime, setElapsedTime] = useState(0);
  const { t } = useTranslation()
  const { studyTime, textbookId, startTime } = props;
  useEffect(() => {
    if (!textbookId || !startTime) return;
    setElapsedTime(studyTime);
    const timer = setInterval(() => {
      const time = studyTime + (getServerNow() - startTime.valueOf())
      setElapsedTime(time);
    }, 1000);

    return () => clearInterval(timer);
  }, [studyTime, startTime, textbookId]);

  const formatTime = (timeInMilliseconds: number) => {
    const hours = Math.floor(timeInMilliseconds / 3600000);
    const minutes = Math.floor((timeInMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((timeInMilliseconds % 60000) / 1000);
    return t("hours_mins_seconds", {
      hours: hours.toString().padStart(2, "0"),
      mins: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0")
    })
  };

  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
  };
};
