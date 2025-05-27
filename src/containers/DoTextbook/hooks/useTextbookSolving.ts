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
import { getDataStorage, removeDataStorage, setDataStorage } from "@/utils/storage";

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

  const getDiffTime = async (
    textbook: SimplePreparedTextbookResponse,
    now: string
  ) => {
    let lastAnswerTime = ltAnswerTime || textbook.lastAnswerTime

    const localStopTime = stopTimeKey ? await getDataStorage(stopTimeKey) : null;
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
      await removeDataStorage(stopTimeKey || "");
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
        const rollBackQuestions = await getRollBackQuestionList();
        if (rollBackQuestions) {
          updateQuestionList?.(rollBackQuestions.questions);
          setLtAnswerTime(rollBackQuestions.lastAnswerTime);
        }

        const errorMessage = error?.response?.data?.title || res?.message;
        if (errorMessage && typeof errorMessage === "string" && !callback)
          toast.error(error?.response?.status === 500 ? `${getErrorMessage(t, error)}: ${errorMessage}` : getErrorMessage(t, error));
      }
      if (res?.status === 0)
        await removeDataStorage(`${recoverKey}`);
      await removeDataStorage(`${rollbackKey}`);
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
    arrQuestionNew: PreparedQuestionResponse[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    callback?: Function
  ) => {
    if ((!textbookId && !callback) || !rollbackKey) return;

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
        async() => await updateAnswers(body, lastAnswerTime),
        500
      );
    }
  };

  const getRollBackQuestionList = async () => {
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

  const updateQuestionAnswer = async ({ questionId, textualAnswers = [], answer }: TextbookQuestion) => {
    try {
      if (!textbook) return;
      const time = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const now = toISOString(time);
      const nowTime = moment(now).utc().valueOf();

      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew: PreparedQuestionResponse[] = [];
      for (const item of listQuestionNews) {
        const isTextAnswerType = isTextType(item.questionAnswerType);

        if (item.textualAnswers !== undefined && !isTextAnswerType) {
          delete item.textualAnswers;
        }
        if (item.selectedAnswers !== undefined && isTextAnswerType) {
          delete item.selectedAnswers;
        }

        if (item.id === questionId) {
          switch (item.questionAnswerType) {
            case QuestionAnswerType.SingleChoice:
              if (answer !== undefined) {
                item.selectedAnswers = item.selectedAnswers?.includes(answer)
                  ? item.selectedAnswers.filter((i: number) => i !== answer)
                  : [answer];
              }
              break;
            case QuestionAnswerType.MultipleChoice:
              if (answer !== undefined) {
                item.selectedAnswers = item.selectedAnswers?.includes(answer)
                  ? item.selectedAnswers.filter((i: number) => i !== answer)
                  : [...(item.selectedAnswers ?? []), answer];
              }
              break;
            default:
              item.textualAnswers = textualAnswers;
              break;
          }

          const diff = await getDiffTime(textbook, now);
          item.duration = (item.duration || 0) + Number(diff);
          item.answerTime = item.answerTime && item.answerTime !== 0
            ? item.answerTime
            : nowTime;
        }

        arrQuestionNew.push(item);
      }

      await handleUpdateAnswer(arrQuestionNew, now, nowTime, questionId);
    } catch (error) {
      console.log({ error });
    }
  };


  const updateQuestionStar = async (questionId: number, isStar: boolean) => {
    try {
      if (!textbook) return;
      const time = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const now = toISOString(time);
      const nowTime = moment(now).utc().valueOf();
      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = [];
      for (const item of listQuestionNews) {
        if (item.id === questionId) {
          item.isStar = isStar;
          const diff = await getDiffTime(textbook, now);
          item.duration = (item.duration || 0) + Number(diff);
          item.answerTime = item.answerTime && item.answerTime !== 0
            ? item.answerTime
            : nowTime;
        }
        arrQuestionNew.push(item);
      }

      await handleUpdateAnswer(arrQuestionNew, now, nowTime, questionId);
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
      const recoverJsonQuestions = await getDataStorage(recoverKey);
      data = JSON.parse(recoverJsonQuestions || "");
    } catch (error) {
      await removeDataStorage(recoverKey);
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

  const handleClearStorage = async () => {
    recoverKey && await removeDataStorage(recoverKey);
    rollbackKey && await removeDataStorage(rollbackKey);
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
