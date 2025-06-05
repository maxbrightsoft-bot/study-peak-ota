import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExamQuestion,
  ExamResponse,
  Question,
  StoredStudentAnswer,
} from "../config/types";
import { answerQuestionExam } from "../apiClients";
import _ from "lodash";
import { QuestionAnswerType } from "../../../utils/enums";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { DATE_MIN_VALUE, DATE_TIME_MIN_VALUE } from "@/utils/constants";
import { diffFromNow, getErrorMessage, toast, toISOString } from "@/utils/helpers";
import moment from "moment";
import { getDataStorage, removeDataStorage, setDataStorage } from "@/utils/storage";
import { StudentAnswerRequest } from "@/utils/types";
import { isTextType } from "@/utils/helpers/textbook";

const rollBackQuestionList = "rb";
const recoverQuestionList = "rc";
interface Props {
  examId?: number;
  exam?: ExamResponse;
  examCode: string;
  questionList?: Question[];
  isEnding?: boolean;
  isProgressing?: boolean;
  updateQuestionList?: (questions: Question[]) => void;
  updateExamLastTimeAnswer?: (lastTimeAnswer: string) => void;
  handleExamEnded?: () => void;
  handleUpdateSlider?: (questionId: number) => void;
}
const useExamSolving = (props: Props) => {
  const {
    examId,
    exam,
    examCode,
    questionList = [],
    isEnding = false,
    isProgressing = true,
    updateExamLastTimeAnswer,
    updateQuestionList,
    handleExamEnded,
    handleUpdateSlider
  } = props;
  const { user } = useAuthStore()
  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const { t } = useTranslation();
  const apiTimeouts = useRef<any>({});

  const [ltAnswerTime, setLtAnswerTime] = useState<string>();
  const [recoverExamCode, setRecoveredExamCode] = useState<string>();

  const recoverKey = useMemo(() => {
    if (!academyDomain || !userId || !examCode) return undefined;
    return `${recoverQuestionList}${academyDomain?.toLowerCase()}${examCode}${userId}`;
  }, [academyDomain, examCode, userId]);

  const rollbackKey = useMemo(() => {
    if (!academyDomain || !userId || !examCode) return undefined;
    return `${rollBackQuestionList}${academyDomain?.toLowerCase()}${examCode}${userId}`;
  }, [academyDomain, examCode, userId]);

  const getDiffTime = (exam: ExamResponse, now: string) => {
    let lastAnswerTime = ltAnswerTime || exam.lastAnswerTime;
    if (
      !lastAnswerTime ||
      lastAnswerTime === DATE_TIME_MIN_VALUE ||
      lastAnswerTime === DATE_MIN_VALUE
    ) {
      lastAnswerTime = exam.startTimeSession;
    }

    const diff = diffFromNow(lastAnswerTime, "milliseconds", now);
    return diff;
  };

  const updateAnswers = async (
    body: StudentAnswerRequest,
    lastAnswerTime: string,
    callback?: Function
  ) => {
    let res: any = null;
    let error: any = null;
    try {
      res = await answerQuestionExam(examCode, body);
      res = res.data;
    } catch (err: any) {
      error = err;
    } finally {
      if (res && res?.status === 1) {
        updateExamLastTimeAnswer?.(lastAnswerTime);
      }
      if (
        (error && error.code !== "ERR_NETWORK") ||
        (res && res?.status === 0)
      ) {
        const rollBackQuestions = await getRollBackQuestionList();
        if (rollBackQuestions) {
          updateQuestionList?.(rollBackQuestions.questions);
          setLtAnswerTime(rollBackQuestions.lastAnswerTime);
        }

        const errorMessage = error.response?.data?.title || res?.message;
        if (errorMessage && typeof errorMessage === "string" && !callback)
          toast.error(error?.response?.status === 500 ? `${getErrorMessage(t, error)}: ${errorMessage}` : getErrorMessage(t, error));
      }
      if(res?.status === 0)
        await removeDataStorage(`${recoverKey}`);
      await removeDataStorage(`${rollbackKey}`);
      await callback?.();
    }
  };

  const handleUpdateAnswer = async (
    questions: Question[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    questionId?: number
  ) => {
    if (!exam || !recoverKey) return;
    await setDataStorage(
      recoverKey,
      JSON.stringify({
        lastAnswerTime: lastAnswerTimeNum,
        questions
      })
    );

    questionId && handleUpdateSlider?.(questionId);

    callApiUpdateAnswers(questions, lastAnswerTime, lastAnswerTimeNum);
  };

  const callApiUpdateAnswers = async (
    arrQuestionNew: Question[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    callback?: Function
  ) => {
    if ((!examId && !callback) || !rollbackKey) return;

    await setDataStorage(
      rollbackKey,
      JSON.stringify({
        lastAnswerTime: lastAnswerTime,
        questions: questionList
      })
    );
    setLtAnswerTime(lastAnswerTime);
    updateQuestionList?.(arrQuestionNew);

    const body: StudentAnswerRequest = {
      lastAnswerTime: lastAnswerTimeNum,
      questions: arrQuestionNew.map((i) => ({
        questionId: i.id,
        selectedAnswers: i.selectedAnswers,
        duration: i.duration,
        isStar: i.isStar,
        answerTime: i.answerTime,
        textualAnswers: i.textualAnswers
      }))
    };
    const prevApiCall = apiTimeouts.current[rollbackKey];
    if (prevApiCall) {
      clearTimeout(apiTimeouts.current[rollbackKey]);
      delete apiTimeouts.current[rollbackKey];
    }
    if (!!callback) {
      await updateAnswers(body, lastAnswerTime, callback);
    } else {
      apiTimeouts.current[rollbackKey] = setTimeout(
        async() => await updateAnswers(body, lastAnswerTime),
        500
      );
    }
  };

  const getRollBackQuestionList = async() => {
    if (!rollbackKey) return null;
    const rollBackQuestionsStr = await getDataStorage(rollbackKey);
    if (!rollBackQuestionsStr) return null;
    try {
      const rollBackQuestions = JSON.parse(rollBackQuestionsStr);
      if (
        !rollBackQuestions.lastAnswerTime ||
        !rollBackQuestions.questions?.length
      ) {
        await removeDataStorage(rollbackKey);
        return null;
      }
      return rollBackQuestions;
    } catch (error) {
      return null;
    }
  };
  const updateQuestionAnswer = ({ questionId, textualAnswers = [], answer } :  ExamQuestion) => {
    try {
      if (!exam) return;
      const time = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const now = toISOString(time);
      const nowTime = moment(now).utc().valueOf();
      
      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: Question) => {
        const isTextAnswerType = isTextType(item.questionAnswerType)
        if (item.textualAnswers !== undefined && !isTextAnswerType) {
          delete item.textualAnswers
        }
        if(item.selectedAnswers !== undefined && isTextAnswerType) {
          delete item.selectedAnswers
        }
        if (item.id === questionId) {
          switch (item.questionAnswerType) {
            case QuestionAnswerType.SingleChoice:
              if(answer === undefined) break;
              item.selectedAnswers = item.selectedAnswers?.includes(answer)
                ? item.selectedAnswers.filter((i: number) => i != answer)
                : [answer];
              break;
            case QuestionAnswerType.MultipleChoice:
              if(answer === undefined) break;
              item.selectedAnswers = item.selectedAnswers?.includes(answer)
                ? item.selectedAnswers.filter((i: number) => i != answer)
                : [...(item.selectedAnswers ?? []), answer];
              break;
            default:
              item.textualAnswers = textualAnswers
              break;
          }
          
          const diff = getDiffTime(exam, now);
          item.duration = (item.duration || 0) + +diff;
          item.answerTime =
            item.answerTime && item.answerTime !== 0
              ? item.answerTime
              : nowTime;
        }
        
        return item;
      });

      handleUpdateAnswer(arrQuestionNew, now, nowTime, questionId);
    } catch (error) {
      console.log({ error });
    }
  };

  const updateQuestionStar = (questionId: number, isStar: boolean) => {
    try {
      if (!exam) return;
      const time = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const now = moment(time).toISOString();
      const nowTime = moment(now).utc().valueOf();
      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: Question) => {
        if (item.id === questionId) {
          item.isStar = isStar;
          const diff = getDiffTime(exam, now);
          item.duration = (item.duration || 0) + +diff;
          item.answerTime =
            item.answerTime && item.answerTime !== 0
              ? item.answerTime
              : nowTime;
        }
        return item;
      });

      handleUpdateAnswer(arrQuestionNew, now, nowTime, questionId);
    } catch (error) {
      console.log({ error });
    }
  };

  const handleRecoverExamAnswer = async (
    recoverKey: string,
    callback?: Function
  ) => {
    let data: StoredStudentAnswer | null = null;
    try {
      const recoverJsonQuestions = await getDataStorage(recoverKey);
      data = JSON.parse(recoverJsonQuestions || "");
    } catch (error) {
      await removeDataStorage(recoverKey);
      console.log({ error });
    }
    const currentLastAnswerTime = exam?.lastAnswerTime
      ? moment.utc(exam?.lastAnswerTime).valueOf()
      : 0;

    if (
      !!data &&
      data.questions.length &&
      data.lastAnswerTime &&
      currentLastAnswerTime < data.lastAnswerTime
    ) {
      const lastAnswerTime = moment(data.lastAnswerTime)
        .toDate()
        .toISOString();
      await callApiUpdateAnswers(
        data.questions,
        lastAnswerTime,
        data.lastAnswerTime,
        callback
      );
    } else {
      await callback?.();
    }
  };

  const handleClearStorage = async() => {
    recoverKey && await removeDataStorage(recoverKey);
    rollbackKey && await removeDataStorage(rollbackKey);
  };

  const recoverAnswers = async () => {
    setRecoveredExamCode(undefined);
    if(!recoverKey)
    {
      setRecoveredExamCode(recoverKey);
      return;
    }
    try {
      await handleRecoverExamAnswer(recoverKey, () => {
        handleClearStorage()
      })
    }catch (e: any) {
      console.log({ error: e.message });
      
    }
    setRecoveredExamCode(recoverKey);
  }

  useEffect(() => {
    if (!recoverKey || !examId) return;
    const endExam = async() => {
      if (isEnding){
        await removeDataStorage(recoverKey);
        handleExamEnded?.();
      }
    };
    
    handleRecoverExamAnswer(recoverKey, endExam);
  }, [recoverKey, examId, isEnding, handleExamEnded]);

  useEffect(() => {
    !isProgressing && recoverAnswers()
  }, [recoverKey, isProgressing])
  return {
    recoverExamCode,
    recoverKey,
    updateQuestionAnswer,
    updateQuestionStar,
    handleClearStorage,
    handleRecoverExamAnswer
  };
};

export default useExamSolving;
