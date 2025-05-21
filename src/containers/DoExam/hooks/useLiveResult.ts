import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage, toast } from "@/utils/helpers";
import useAuthStore from "@/store/useAuthStore";
import { CATEGORY_RESPONSES, EFFECT_SIZE_QUESTIONS, EXAM_RESULT, LONGTIME_SPEND_QUESTIONS, TIMELY_ORDER_QUESTIONS } from "../config/config";
import { getResults, getResultsCategories, getResultsEffectSize, getResultsLongTimeSpend, getResultsTimeOrderQuestion } from "../apiClients";
import useExamSolving from "./useExamSolving";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { CategoryResponse, EffectSize, ExamResult, LongTimeSpendQuestion, TimelyOrderQuestion } from "@/utils/types";

type Props = {
  examCode: string
}

const useLiveResult = ({ examCode } : Props) => {
  const { setLoading } = useAuthStore()
  const [resultData, setResultData] = useState<ExamResult>();
  const [effectSize, setEffectSize] = useState<EffectSize[]>();
  const [longTimeSpend, setLongTimeSpend] = useState<LongTimeSpendQuestion[]>(
    []
  );
  const [timelyOrderQuestion, setTimelyOrderQuestion] = useState<
    TimelyOrderQuestion[]
  >([]);
  const [categoryResponses, setCategoryResponses] = useState<
    CategoryResponse[]
  >([]);
  const [openProblem, setOpenProblem] = useState<string>("");

  const { t } = useTranslation();

  const getData = async (examCode: string) => {
    setLoading(true)
    try {
      const result = await Promise.all([
        getResults(examCode),
        getResultsLongTimeSpend(examCode),
        getResultsEffectSize(examCode),
        getResultsTimeOrderQuestion(examCode),
        getResultsCategories(examCode)
      ]);

      setResultData(result[0].data?.data);
      setLongTimeSpend(result[1].data?.data);
      setEffectSize(result[2].data?.data);
      setTimelyOrderQuestion(result[3].data?.data);
      setCategoryResponses(result[4].data?.data || []);
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  };

  const setExampleData = () => {
    setResultData(EXAM_RESULT);
    setLongTimeSpend(LONGTIME_SPEND_QUESTIONS);
    setEffectSize(EFFECT_SIZE_QUESTIONS);
    setTimelyOrderQuestion(TIMELY_ORDER_QUESTIONS);
    setCategoryResponses(CATEGORY_RESPONSES);
  };

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

  const { recoverExamCode, recoverKey } = useExamSolving({ examCode, isProgressing: false });

  useEffect(() => {
    if(recoverExamCode == recoverKey)
      examCode === "example-code" ? setExampleData() : getData(examCode);
  }, [recoverExamCode, examCode]);

  return {
    t,
    totalTime,
    resultData,
    effectSize,
    longTimeSpend,
    timelyOrderQuestion,
    openProblem,
    categoryResponses,
    setOpenProblem,
    handleExit
  }
}

export default useLiveResult