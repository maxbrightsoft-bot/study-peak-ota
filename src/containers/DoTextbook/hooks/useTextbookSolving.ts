import { useEffect, useMemo, useRef, useState } from "react";
import { PreparedQuestionResponse, SimplePreparedTextbookResponse, StoredStudentTextbookAnswer, TextbookQuestion } from "../config/types";
import { answerQuestionTextbook } from "../apiClients";
import _ from "lodash";
import { QuestionAnswerType } from "../../../utils/enums";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { DATE_MIN_VALUE, DATE_TIME_MIN_VALUE } from "@/utils/constants";
import moment from "moment";
import { diffFromNow, getErrorMessage, toast, toISOString } from "@/utils/helpers";
import { StudentAnswerRequest } from "@/utils/types";
import { isTextType } from "@/utils/helpers/textbook";

const rollBackQuestionList = "rb";
const recoverQuestionList = "rc";
interface Props {
  startTime: string;
  textbook?: SimplePreparedTextbookResponse;
  textbookId: number;
  totalAnswersTime: number;
  questionList?: PreparedQuestionResponse[];
  updateQuestionList?: (questions: PreparedQuestionResponse[]) => void;
  updateTextbookLastTimeAnswer?: (lastTimeAnswer: string) => void;
  handleUpdateSlider?: (questionId: number) => void;
}
const useTextbookSolving = (props: Props) => {
  const { user } = useAuthStore()
  const {
    startTime,
    totalAnswersTime,
    textbook,
    textbookId,
    questionList = [],
    updateTextbookLastTimeAnswer,
    updateQuestionList,
    handleUpdateSlider
  } = props;
  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const { t } = useTranslation();

  const apiTimeouts = useRef<any>({});

  const [ltAnswerTime, setLtAnswerTime] = useState<string>();

  const recoverKey = useMemo(() => {
    if (!userId || !textbookId) return undefined;
    return `${recoverQuestionList}${academyDomain?.toLowerCase()}${textbookId}${userId}`;
  }, [academyDomain, textbookId, userId]);

  const rollbackKey = useMemo(() => {
    if (!userId || !textbookId) return undefined;
    return `${rollBackQuestionList}${academyDomain?.toLowerCase()}${textbookId}${userId}`;
  }, [academyDomain, textbookId, userId]);

  const stopTimeKey = useMemo(() => {
    if (!userId || !textbookId) return undefined;
    return `stopTime${academyDomain?.toLowerCase()}${textbookId}${userId}`;
  }, [academyDomain, textbookId, userId]);

  const getDiffTime = (
    textbook: SimplePreparedTextbookResponse,
    now: string
  ) => {
    let lastAnswerTime = ltAnswerTime || textbook.lastAnswerTime

    const localStopTime = stopTimeKey ? localStorage.getItem(stopTimeKey) : null;
    const stopTime = localStopTime;
      // localStopTime && textbook.stopTime &&
      // moment(localStopTime).isValid() &&
      // moment(localStopTime).isAfter(moment(lastAnswerTime)) &&
      // moment(textbook.stopTime).isAfter(moment(lastAnswerTime))
      //   ? moment(localStopTime).isAfter(moment(textbook.stopTime))
      //     ? localStopTime
      //     : textbook.stopTime
      //   : null;

    if (
      !lastAnswerTime ||
      lastAnswerTime === DATE_TIME_MIN_VALUE ||
      lastAnswerTime === DATE_MIN_VALUE
    ) {
      lastAnswerTime = textbook.startTime;
    }

    if (
      stopTime &&
      moment(stopTime).isAfter(moment(lastAnswerTime)) &&
      moment(startTime).isAfter(moment(stopTime))
    ) {
      const diffBeforeStop = diffFromNow(
        lastAnswerTime,
        "milliseconds",
        stopTime
      );
      const diffAfterStop = diffFromNow(startTime, "milliseconds", now);
      console.log({
        lastAnswerTime: lastAnswerTime,
        stopTime: stopTime,
        startTime: startTime,
        newLastAnswerTime: lastAnswerTime,
      });
      localStorage.removeItem(stopTimeKey || "");
      return (
        (diffBeforeStop === "" ? 0 : diffBeforeStop) +
        (diffAfterStop === "" ? 0 : diffAfterStop)
      );
    }

    return diffFromNow(lastAnswerTime, "milliseconds", now);
  };

  const updateAnswers = async (
    body: StudentAnswerRequest,
    lastAnswerTime: string,
    callback?: Function
  ) => {
    let res: any = null;
    let error: any = null;
    try {
      res = await answerQuestionTextbook(textbookId, body);
      res = res.data;
    } catch (err: any) {
      error = err;
    } finally {
      if (res && res?.status === 1) {
        updateTextbookLastTimeAnswer?.(lastAnswerTime);
      }
      if (
        (error && error.code !== "ERR_NETWORK") ||
        (res && res?.status === 0)
      ) {
        const rollBackQuestions = getRollBackQuestionList();
        if (rollBackQuestions) {
          updateQuestionList?.(rollBackQuestions.questions);
          setLtAnswerTime(rollBackQuestions.lastAnswerTime);
        }

        const errorMessage = error?.response?.data?.title || res?.message;
        if (errorMessage && typeof errorMessage === "string" && !callback)
          toast.error(error?.response?.status === 500 ? `${getErrorMessage(t, error)}: ${errorMessage}` : getErrorMessage(t, error));
      }
      if(res?.status === 0)
        localStorage.removeItem(`${recoverKey}`);
      localStorage.removeItem(`${rollbackKey}`);
      callback?.();
    }
  };

  const handleUpdateAnswer = async (
    questions: PreparedQuestionResponse[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    questionId?: number
  ) => {
    if (!textbook || !recoverKey) return;
    localStorage.setItem(
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
    arrQuestionNew: PreparedQuestionResponse[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    callback?: Function
  ) => {
    if ((!textbookId && !callback) || !rollbackKey) return;

    localStorage.setItem(
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
      totalAnswerTime: totalAnswersTime,
      questions: arrQuestionNew.map((i) => ({
        questionId: i.id,
        selectedAnswers: i.selectedAnswers,
        textualAnswers: i.textualAnswers,
        duration: i.duration,
        isStar: i.isStar,
        answerTime: i.answerTime
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
        () => updateAnswers(body, lastAnswerTime),
        500
      );
    }
  };

  const getRollBackQuestionList = () => {
    if (!rollbackKey) return null;
    const rollBackQuestionsStr = localStorage.getItem(rollbackKey);
    if (!rollBackQuestionsStr) return null;
    try {
      const rollBackQuestions = JSON.parse(rollBackQuestionsStr);
      if (
        !rollBackQuestions.lastAnswerTime ||
        !rollBackQuestions.questions?.length
      ) {
        localStorage.removeItem(rollbackKey);
        return null;
      }
      return rollBackQuestions;
    } catch (error) {
      return null;
    }
  };

  const updateQuestionAnswer = ({ questionId, textualAnswers = [], answer } :  TextbookQuestion) => {
    try {
      if (!textbook) return;
      const time = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const now = toISOString(time);
      const nowTime = moment(now).utc().valueOf();

      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: PreparedQuestionResponse) => {
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
          
          const diff = getDiffTime(textbook, now);
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
      if (!textbook) return;
      const time = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const now = toISOString(time);
      const nowTime = moment(now).utc().valueOf();
      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: PreparedQuestionResponse) => {
        if (item.id === questionId) {
          item.isStar = isStar;
          const diff = getDiffTime(textbook, now);
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
    let data: StoredStudentTextbookAnswer | null = null;
    try {
      const recoverJsonQuestions = localStorage.getItem(recoverKey);
      data = JSON.parse(recoverJsonQuestions || "");
    } catch (error) {
      localStorage.removeItem(recoverKey);
      console.log({ error });
    }
    const currentLastAnswerTime = textbook?.lastAnswerTime
      ? moment.utc(textbook?.lastAnswerTime).valueOf()
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
      callback?.();
    }
  };

  const handleClearStorage = () => {
    recoverKey && localStorage.removeItem(recoverKey);
    rollbackKey && localStorage.removeItem(rollbackKey);
  };

  return {
    stopTimeKey,
    recoverKey,
    updateQuestionAnswer,
    updateQuestionStar,
    handleClearStorage,
    handleRecoverExamAnswer
  };
};

export default useTextbookSolving;
