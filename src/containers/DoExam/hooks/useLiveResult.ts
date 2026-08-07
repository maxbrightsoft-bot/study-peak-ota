import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage, toast } from "@/utils/helpers";
import { getResults, getStudentExamResultPercentages } from "../apiClients";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { ExamResult } from "@/utils/types";
import { StudentExamResult } from "../config/types";

type Props = {
  examCode: string
}

const useLiveResult = ({ examCode }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<StudentExamResult>();
  const [resultData, setResultData] = useState<ExamResult>();
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    const fetchResultData = async () => {
      if (!examCode) {
        setExamResult(undefined);
        setResultData(undefined);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const [percentRes, resultRes] = await Promise.all([
          getStudentExamResultPercentages(examCode),
          getResults(examCode)
        ]);

        let resData = percentRes.data;
        let retriesLeft = 5;

        const isScorePending = (data: any) => {
          if (!data) return true;
          if (data.score === undefined || data.score === null) return true;
          if (data.score === 0 && (!data.percentageAmongStudents || data.percentageAmongStudents === 0)) return true;
          return false;
        };

        while (isScorePending(resData) && retriesLeft > 0 && isMounted) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (!isMounted) return;
          const retryRes = await getStudentExamResultPercentages(examCode);
          if (retryRes?.data) {
            resData = retryRes.data;
            if (!isScorePending(resData)) break;
          }
          retriesLeft--;
        }

        if (isMounted) {
          setExamResult({
            ...resData,
            code: examCode
          });
          setResultData({
            ...resultRes?.data?.data,
            code: examCode
          });
        }
      } catch (error) {
        if (isMounted) {
          toast.error(getErrorMessage(t, error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchResultData();

    return () => {
      isMounted = false;
    };
  }, [examCode]);

  const handleExit = () => {
    navigate(Routes.Auth.Home);
  };

  const totalTime = useMemo(() => {
    if (!resultData?.questions?.length) return `0${t("seconds")}`;
    const totalTime = resultData?.questions.reduce(
      (val: number, current: any) => val + Math.round(current?.duration || 0),
      0
    );
    return totalTime < 60
      ? `${totalTime}${t("seconds")}`
      : t("mins_mins_seconds_seconds", {
        mins: Math.floor(totalTime / 60),
        seconds: totalTime % 60
      });
  }, [JSON.stringify(resultData?.questions)]);

  return {
    t,
    isLoading,
    totalTime,
    examResult,
    resultData,
    handleExit
  }
}

export default useLiveResult