import useServerTime from "@/hooks/useServerTime";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ExamStatus } from "@/utils/enums";

interface Props {
  startTime?: moment.Moment;
  studyTime: number;
  textbookId: number;
  status?: ExamStatus;
}

export const useTextbookTimer = (props: Props) => {
  const { getServerNow } = useServerTime();
  const [elapsedTime, setElapsedTime] = useState(0);
  const { t } = useTranslation()
  const { studyTime, textbookId, startTime, status } = props;

  const [localStartTime, setLocalStartTime] = useState<number | null>(null);
  const [baseStudyTime, setBaseStudyTime] = useState<number>(0);

  useEffect(() => {
    if (!textbookId || !startTime) return;
    setBaseStudyTime(studyTime);
    setLocalStartTime(getServerNow());
    setElapsedTime(studyTime);
  }, [studyTime, textbookId, startTime]);

  useEffect(() => {
    if (!localStartTime) return;
    
    if (status === ExamStatus.Paused || status === ExamStatus.Completed) {
      setElapsedTime(baseStudyTime);
      return;
    }

    const updateTimer = () => {
      setElapsedTime(baseStudyTime + (getServerNow() - localStartTime));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [baseStudyTime, localStartTime, status]);

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
