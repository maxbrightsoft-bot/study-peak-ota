import NetInfo from '@react-native-community/netinfo';
import { useEffect, useMemo, useRef } from "react";
import { PreparedQuestionResponse, SimplePreparedTextbookResponse, StoredStudentTextbookAnswer, StudentTextbookAnswerRequest, TextbookQuestion } from "../config/types";
import { answerQuestionTextbook } from "../apiClients";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import moment from "moment";
import { diffFromNow, getErrorMessage, toast, toISOString } from "@/utils/helpers";
import { DATE_TIME_MIN_VALUE } from "@/utils/constants";
import { isTextType } from "@/utils/helpers/textbook";
import { QuestionAnswerType } from "@/utils/enums";
import { getDataStorage, removeDataStorage, setDataStorage } from "@/utils/storage";

const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ"
const rollBackQuestionList = "trb";
const recoverQuestionList = "trc";
interface Props {
  startTime?: moment.Moment
  textbook?: SimplePreparedTextbookResponse;
  textbookId: number;
  updateTextbook: React.Dispatch<React.SetStateAction<SimplePreparedTextbookResponse | undefined>>
  questionList?: PreparedQuestionResponse[];
  updateQuestionList?: (questions: PreparedQuestionResponse[]) => void;
  handleUpdateSlider?: (questionId: number) => void;
}
const useTextbookSolving = (props: Props) => {
  const {
    startTime,
    textbook,
    textbookId,
    updateTextbook,
    questionList = [],
    updateQuestionList,
    handleUpdateSlider
  } = props;
  const { user, selectedAcademy } = useAuthStore()
  const academyId = selectedAcademy?.id
  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const { t } = useTranslation();

  const apiTimeouts = useRef<any>({});

  const ltAnswerTime = useRef<moment.Moment>();
  const totalAnsweredTimeRef = useRef<number>();

  const recoverKey = useMemo(() => {
    if (!userId || !textbookId || !academyId) return undefined;
    return `${recoverQuestionList}.${academyId}.${textbookId}.${userId}`;
  }, [academyDomain, academyId, textbookId, userId]);

  const rollbackKey = useMemo(() => {
    if (!userId || !textbookId || !academyId) return undefined;
    return `${rollBackQuestionList}.${academyId}.${textbookId}.${userId}`;
  }, [academyDomain, academyId, textbookId, userId]);

  const getDiffTime = (nowMoment: moment.Moment) => {
    if (!textbook) return 0
    const time = moment(nowMoment).format(DATE_TIME_FORMAT);
    const now = toISOString(time);
    let lastAnswerTime = textbook.isMock ?
      (ltAnswerTime.current || (textbook.lastAnswerTime === DATE_TIME_MIN_VALUE ? textbook.startTime : textbook.lastAnswerTime)) :
      ltAnswerTime.current && ltAnswerTime.current.isAfter(startTime) ? ltAnswerTime.current : startTime;
    let diff = 0

    const totalRunningTime = +diffFromNow(textbook?.startTime || "", "milliseconds", now)
    if (!textbook?.isMock)
      diff = +diffFromNow(moment(lastAnswerTime).format(DATE_TIME_FORMAT), "milliseconds", now)
    else
      diff = totalRunningTime - (totalAnsweredTimeRef.current ?? textbook.totalAnswerTime) - textbook.totalPausedTime;
    diff = Math.max(0, diff)
    ltAnswerTime.current = nowMoment;
    if (!totalAnsweredTimeRef.current) totalAnsweredTimeRef.current = textbook.totalAnswerTime
    totalAnsweredTimeRef.current += diff

    return diff;
  };

  const updateAnswers = async (
    body: StudentTextbookAnswerRequest,
    callback?: Function
  ) => {
    let res: any = null;
    let error: any = null;
    try {
      res = await answerQuestionTextbook(textbookId, body);
      res = res.data.data;
      if (res && !res.message) {
        if (!totalAnsweredTimeRef.current || (res.totalAnswerTime && res.totalAnswerTime > totalAnsweredTimeRef.current))
          totalAnsweredTimeRef.current = res.totalAnswerTime;
        updateTextbook?.((prev: any) => {
          return ({ ...prev, questions: res.questions, lastAnswerTime: res.lastAnswerTime, totalAnswerTime: res.totalAnswerTime, totalPausedTime: res.totalPausedTime })
        })
      }
    } catch (err: any) {
      error = err;
    } finally {
      if (
        (error && error.code !== "ERR_NETWORK") ||
        (res && res?.status === 0)
      ) {
        const rollBackQuestions = await getRollBackQuestionList();
        if (rollBackQuestions) {
          updateQuestionList?.(rollBackQuestions.questions);
          const rollBackLastAnswerTime = rollBackQuestions.lastAnswerTime
          const isValid = moment.invalid(rollBackLastAnswerTime)

          if (ltAnswerTime.current && isValid && moment(rollBackLastAnswerTime).isAfter(startTime) && moment(rollBackLastAnswerTime).isAfter(ltAnswerTime.current))
            ltAnswerTime.current = moment(rollBackLastAnswerTime)
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
    updateQuestionList?.(arrQuestionNew);

    const body: StudentTextbookAnswerRequest = {
      lastAnswerTime: lastAnswerTimeNum,
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
      await updateAnswers(body, callback);
    } else {
      apiTimeouts.current[rollbackKey] = setTimeout(
        () => updateAnswers(body),
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

  const updateQuestionAnswer = ({ questionId, textualAnswers = [], answer }: TextbookQuestion) => {
    try {
      if (!textbook) return;
      const nowMoment = moment()
      const time = nowMoment.format(DATE_TIME_FORMAT);
      const now = toISOString(time);
      const nowTime = moment(now).utc().valueOf();

      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: PreparedQuestionResponse) => {
        const isTextAnswerType = isTextType(item.questionAnswerType)
        if (item.textualAnswers !== undefined && !isTextAnswerType) {
          delete item.textualAnswers
        }
        if (item.selectedAnswers !== undefined && isTextAnswerType) {
          delete item.selectedAnswers
        }
        if (item.id === questionId) {
          switch (item.questionAnswerType) {
            case QuestionAnswerType.SingleChoice:
              if (answer === undefined) break;
              item.selectedAnswers = item.selectedAnswers?.includes(answer)
                ? item.selectedAnswers.filter((i: number) => i != answer)
                : [answer];
              break;
            case QuestionAnswerType.MultipleChoice:
              if (answer === undefined) break;
              item.selectedAnswers = item.selectedAnswers?.includes(answer)
                ? item.selectedAnswers.filter((i: number) => i != answer)
                : [...(item.selectedAnswers ?? []), answer];
              break;
            default:
              item.textualAnswers = textualAnswers
              break;
          }

          const diff = getDiffTime(nowMoment);
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
      const nowMoment = moment();
      const time = nowMoment.format(DATE_TIME_FORMAT);
      const now = toISOString(time);
      const nowTime = moment(now).utc().valueOf();
      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: PreparedQuestionResponse) => {
        const isTextAnswerType = isTextType(item.questionAnswerType)
        if (item.textualAnswers !== undefined && !isTextAnswerType) {
          delete item.textualAnswers
        }
        if (item.selectedAnswers !== undefined && isTextAnswerType) {
          delete item.selectedAnswers
        }
        if (item.id === questionId) {
          item.isStar = isStar;
          const diff = getDiffTime(nowMoment);
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
      const recoverJsonQuestions = await getDataStorage(recoverKey);
      data = JSON.parse(recoverJsonQuestions || "");
    } catch (error) {
      await removeDataStorage(recoverKey);
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

  const recoverAnswers = async () => {
    if (!recoverKey)
      return;
    try {
      await handleRecoverExamAnswer(recoverKey, () => {
        handleClearStorage()
      })
    } catch (e: any) {
      console.log({ error: e.message });
    }
  }

  useEffect(() => {
    let unsubscribe: any;

    unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        recoverAnswers();
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [recoverKey]);

  useEffect(() => {
    ltAnswerTime.current = undefined
    totalAnsweredTimeRef.current = undefined
  }, [textbook?.timestamp])

  return {
    recoverKey,
    updateQuestionAnswer,
    updateQuestionStar,
    recoverAnswers
  };
};

export default useTextbookSolving;
