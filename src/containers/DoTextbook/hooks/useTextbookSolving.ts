import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useMemo, useRef } from "react";
import { PreparedQuestionResponse, SimplePreparedTextbookResponse, StoredStudentTextbookAnswer, StudentTextbookAnswerRequest, TextbookQuestion } from "../config/types";
import { answerQuestionTextbook } from "../apiClients";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import moment from "moment";
import { diffFromNow, getErrorMessage, toast, toISOString } from "@/utils/helpers";
import { DATE_TIME_MIN_VALUE } from "@/utils/constants";
import { isTextType } from "@/utils/helpers/textbook";
import { ActivityAction, ActivityResource, AppScreen, QuestionAnswerType } from "@/utils/enums";
import { getDataStorage, removeDataStorage, setDataStorage } from "@/utils/storage";
import useServerTime from '@/hooks/useServerTime';
import { logError } from '@/utils/helpers/crashlyticsLogger';
import { useActivityTracking } from '@/hooks/useActivityTracking';

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
  handleNextQuestion: (isError?: boolean) => void
}
const useTextbookSolving = (props: Props) => {
  const {
    startTime,
    textbook,
    textbookId,
    updateTextbook,
    questionList = [],
    updateQuestionList,
    handleUpdateSlider,
    handleNextQuestion
  } = props;
  const user = useAuthStore(state => state.user)
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const academyId = selectedAcademy?.id
  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;
  const { t } = useTranslation();
  const { getServerNow } = useServerTime();
  const { track, trackError } = useActivityTracking({ screen: AppScreen.DoTextbook })

  const getServerTimeFormatted = useCallback(() => {
    const serverNow = getServerNow();
    const time = moment(serverNow).format(DATE_TIME_FORMAT);
    const now = toISOString(time);
    const nowTime = moment(now).utc().valueOf();
    return { time, now, nowTime };
  }, [getServerNow]);


  const apiTimeouts = useRef<any>({});

  const ltAnswerTime = useRef<string>();
  const totalAnsweredTimeRef = useRef<number>();

  const studentTextbookId = textbook?.studentTextbookId;

  const recoverKey = useMemo(() => {
    if (!userId || !textbookId || !studentTextbookId) return undefined;
    const scope = academyId ? `${academyId}` : 'local';
    return `${recoverQuestionList}.${scope}.${textbookId}.${studentTextbookId}.${userId}`;
  }, [academyId, textbookId, userId, studentTextbookId]);

  const rollbackKey = useMemo(() => {
    if (!userId || !textbookId || !studentTextbookId) return undefined;
    const scope = academyId ? `${academyId}` : 'local';
    return `${rollBackQuestionList}.${scope}.${textbookId}.${studentTextbookId}.${userId}`;
  }, [academyId, textbookId, userId, studentTextbookId]);

  const getDiffTime = (now: string, nowTime: number) => {
    if (!textbook) return 0;

    let lastAnswerTime = textbook.isMock
      ? (ltAnswerTime.current || (textbook.lastAnswerTime === DATE_TIME_MIN_VALUE
        ? textbook.startTime
        : textbook.lastAnswerTime))
      : ltAnswerTime.current && moment(ltAnswerTime.current).isAfter(startTime)
        ? ltAnswerTime.current
        : startTime;
    let diff = 0

    const totalRunningTime = +diffFromNow(textbook?.startTime || "", nowTime, now)
    if (!textbook?.isMock)
      diff = +diffFromNow(moment(lastAnswerTime).format(DATE_TIME_FORMAT), nowTime, now)
    else
      diff = totalRunningTime - (totalAnsweredTimeRef.current ?? textbook.totalAnswerTime) - textbook.totalPausedTime;
    diff = Math.max(0, diff)
    ltAnswerTime.current = now;
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
          return ({ ...prev, rowVersion: res?.rowVersion, questions: res.questions, lastAnswerTime: res.lastAnswerTime, totalAnswerTime: res.totalAnswerTime, totalPausedTime: res.totalPausedTime })
        })
      }
    } catch (err: any) {
      error = err;
    } finally {
      if (
        (error && error.code !== "ERR_NETWORK" && error.message !== "Network Error") ||
        (res && res?.status === 0)
      ) {
        const rollBackQuestions = await getRollBackQuestionList();
        if (rollBackQuestions) {
          updateQuestionList?.(rollBackQuestions.questions);
          const rollBackLastAnswerTime = rollBackQuestions.lastAnswerTime
          const isValid = moment.invalid(rollBackLastAnswerTime)

          if (ltAnswerTime.current && isValid && moment(rollBackLastAnswerTime).isAfter(startTime) && moment(rollBackLastAnswerTime).isAfter(ltAnswerTime.current))
            ltAnswerTime.current = rollBackLastAnswerTime
        }
        handleNextQuestion(true);

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
    questionId?: number,
    isStar?: boolean
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

    callApiUpdateAnswers(questions, lastAnswerTime, lastAnswerTimeNum, isStar);
  };

  const callApiUpdateAnswers = async (
    arrQuestionNew: PreparedQuestionResponse[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    isStar?: boolean,
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

    !isStar && handleNextQuestion()

    const body: StudentTextbookAnswerRequest = {
      lastAnswerTime: lastAnswerTimeNum,
      questions: arrQuestionNew.map((i) => ({
        questionId: i.id,
        selectedAnswers: i.selectedAnswers,
        textualAnswers: i.textualAnswers,
        duration: i.duration,
        isStar: i.isStar,
        answerTime: i.answerTime,
        unit: i.unit
      })),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
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
    if (!textbook) return;
    const { now, nowTime } = getServerTimeFormatted();

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

        const diff = getDiffTime(now, nowTime);
        item.duration = (item.duration || 0) + +diff;
        item.answerTime =
          item.answerTime && item.answerTime !== 0
            ? item.answerTime
            : nowTime;
      }
      return item;
    });
    try {
      const answeredQuestion = arrQuestionNew.find(q => q.id === questionId);
      track({
        action: ActivityAction.Answer,
        resourceId: String(questionId),
        resourceType: ActivityResource.Question,
        triggeredAt: now,
        metaData: {
          textbookId: String(textbook?.id),
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId,
          questionId,
          selectedAnswers: answeredQuestion?.selectedAnswers,
          textualAnswers: answeredQuestion?.textualAnswers,
          answerTime: nowTime,
        }
      })

      handleUpdateAnswer(arrQuestionNew, now, nowTime, questionId);
    } catch (error) {
      logError(error, {
        action: 'ANSWER_QUESTION',
        questionId,
        textbookId: String(textbook?.id),
        status: textbook?.status,
        studentTextbookId: textbook?.studentTextbookId
      })
      const body: StudentTextbookAnswerRequest = {
        lastAnswerTime: nowTime,
        questions: arrQuestionNew.map((i) => ({
          questionId: i.id,
          selectedAnswers: i.selectedAnswers,
          textualAnswers: i.textualAnswers,
          duration: i.duration,
          isStar: i.isStar,
          answerTime: i.answerTime,
          unit: i.unit
        }))
      };
      trackError(error, {
        resourceId: String(questionId),
        resourceType: ActivityResource.Question,
        triggeredAt: now,
        metaData: {
          action: Object.keys(ActivityAction.Answer),
          body,
          textbookId: String(textbook?.id),
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId,
          questionId,
          selectedAnswers: answer !== undefined ? [answer] : undefined,
          textualAnswers,
          answerTime: nowTime,
        }
      })
    }
  };


  const updateQuestionStar = (questionId: number, isStar: boolean) => {
    if (!textbook) return;
    const { now, nowTime } = getServerTimeFormatted();
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
        const diff = getDiffTime(now, nowTime);
        item.duration = (item.duration || 0) + +diff;
        item.answerTime =
          item.answerTime && item.answerTime !== 0
            ? item.answerTime
            : nowTime;
      }
      return item;
    });
    try {
      track({
        action: ActivityAction.StarAnswer,
        resourceId: String(questionId),
        resourceType: ActivityResource.Question,
        triggeredAt: now,
        metaData: {
          textbookId: String(textbook?.id),
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId,
          questionId,
          isStar,
          answerTime: nowTime,
        }
      })

      handleUpdateAnswer(arrQuestionNew, now, nowTime, questionId, true);
    } catch (error) {
      console.log({ error });
      logError(error, {
        action: 'ANSWER_STAR_QUESTION',
        questionId,
        textbookId: String(textbook?.id),
        status: textbook?.status,
        studentTextbookId: textbook?.studentTextbookId
      })
      const body: StudentTextbookAnswerRequest = {
        lastAnswerTime: nowTime,
        questions: arrQuestionNew.map((i) => ({
          questionId: i.id,
          selectedAnswers: i.selectedAnswers,
          textualAnswers: i.textualAnswers,
          duration: i.duration,
          isStar: i.isStar,
          answerTime: i.answerTime,
          unit: i.unit
        }))
      };
      trackError(error, {
        resourceId: String(questionId),
        resourceType: ActivityResource.Question,
        triggeredAt: now,
        metaData: {
          action: Object.keys(ActivityAction.StarAnswer),
          textbookId: String(textbook?.id),
          body,
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId,
          questionId,
          isStar,
          answerTime: nowTime,
        }
      })
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
        false,
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

  const handleResetTextbookSolving = useCallback(() => {
    Object.values(apiTimeouts.current).forEach((timeout: any) => clearTimeout(timeout));
    apiTimeouts.current = {};
    ltAnswerTime.current = undefined;
    totalAnsweredTimeRef.current = undefined;
  }, []);

  useEffect(() => {
    ltAnswerTime.current = undefined
    totalAnsweredTimeRef.current = undefined
  }, [textbook?.id])

  return {
    recoverKey,
    updateQuestionAnswer,
    updateQuestionStar,
    recoverAnswers,
    handleClearStorage,
    handleResetTextbookSolving
  };
};

export default useTextbookSolving;
