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
  studentExamSessionId?: number | string
}

const useLiveResult = ({ examCode, studentExamSessionId }: Props) => {
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
          getStudentExamResultPercentages(examCode, studentExamSessionId),
          getResults(examCode, studentExamSessionId)
        ]);

        const parseBody = (res: any) => {
          if (!res) return undefined;
          const body = res.data;
          if (!body) return undefined;
          if (body.data && typeof body.data === 'object') {
            return body.data;
          }
          return body;
        };

        let percentData = parseBody(percentRes);
        let resultsData = parseBody(resultRes);

        let retriesLeft = 5;

        while ((!percentData || percentData.score === undefined || percentData.score === null) && retriesLeft > 0 && isMounted) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (!isMounted) return;
          const retryRes = await getStudentExamResultPercentages(examCode, studentExamSessionId);
          const newPercentData = parseBody(retryRes);
          if (newPercentData && newPercentData.score !== undefined && newPercentData.score !== null) {
            percentData = newPercentData;
            break;
          }
          retriesLeft--;
        }

        if (isMounted) {
          setExamResult({
            ...percentData,
            code: examCode
          });
          setResultData({
            ...resultsData,
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
      setExamResult(undefined);
      setResultData(undefined);
    };
  }, [examCode, studentExamSessionId]);

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