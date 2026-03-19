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
    const getData = async () => {
      if (examCode) {
        setIsLoading(true);
        try {
          const result = await getStudentExamResultPercentages(examCode);
          setExamResult({
            ...result.data,
            code: examCode
          });
        } catch (error) {
          toast.error(getErrorMessage(t, error));
        }
        setIsLoading(false);
      } else {
        setExamResult(undefined);
      }
    };
    getData();
  }, [examCode]);

  useEffect(() => {
    const getData = async () => {
      if (examCode) {
        try {
          const result = await getResults(examCode)
          setResultData({
            ...result.data,
            code: examCode
          });
        } catch (error) {
          toast.error(getErrorMessage(t, error));
        }
      } else {
        setResultData(undefined);
      }
    };
    getData();
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