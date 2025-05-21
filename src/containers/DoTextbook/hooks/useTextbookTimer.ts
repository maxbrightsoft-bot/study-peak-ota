import useAuthStore from "@/store/useAuthStore";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  studyTime: number;
  textbookId: number;
}

export const useTextbookTimer = (props: Props) => {
  const { user } = useAuthStore()
  const [elapsedTime, setElapsedTime] = useState(0);
  const { t } = useTranslation()
  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;
  const { studyTime, textbookId } = props;


  const textbookElapsedTimeKey = useMemo(() => {
    if (!userId || !textbookId) return undefined;
    return `textbookElapsedTime${academyDomain?.toLowerCase()}${textbookId}${userId}`;
  }, [academyDomain, textbookId, userId]);

  useEffect(() => {
    if (!textbookElapsedTimeKey) return;

    const storedTime = parseInt(localStorage.getItem(textbookElapsedTimeKey) || "0", 10);
    const initialTime = Math.max(studyTime, storedTime || 0);
    setElapsedTime(initialTime);

    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        return prev + 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [studyTime, textbookElapsedTimeKey]);

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
    textbookElapsedTimeKey,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
  };
};
