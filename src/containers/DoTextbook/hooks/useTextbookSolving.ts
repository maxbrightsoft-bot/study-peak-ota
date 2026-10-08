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
  handleNextQuestion: (isError?: boolean) => void;
  totalLocalPausedMs?: number;
  isMockTimeOut?: boolean
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
    handleNextQuestion,
    totalLocalPausedMs = 0,
    isMockTimeOut
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

  const ltAnswerTime = useRef<string | undefined>(undefined);
  const totalAnsweredTimeRef = useRef<number | undefined>(undefined);
  const pausedMsConsumedRef = useRef<number>(0);
  const isCallingApi = useRef<boolean>(false);
  const pendingApiCall = useRef<any>(null);

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
    if (!textbook?.isMock) {
      diff = +diffFromNow(moment(lastAnswerTime).format(DATE_TIME_FORMAT), nowTime, now)
      if (totalLocalPausedMs > 0) {
        const pausedSinceLastDiff = totalLocalPausedMs - pausedMsConsumedRef.current;
        if (pausedSinceLastDiff > 0) {
          diff -= pausedSinceLastDiff;
          pausedMsConsumedRef.current = totalLocalPausedMs;
        }
      }
    } else {
      diff = totalRunningTime - (totalAnsweredTimeRef.current ?? textbook.totalAnswerTime) - textbook.totalPausedTime;
    }
    diff = Math.max(0, diff)
    ltAnswerTime.current = now;
    if (!totalAnsweredTimeRef.current) totalAnsweredTimeRef.current = textbook.totalAnswerTime
    totalAnsweredTimeRef.current += diff

    return diff;
  };

  const processNextPendingCall = () => {
    const pending = pendingApiCall.current;
    if (pending) {
      pendingApiCall.current = null;
      updateAnswers(pending.body, pending.callback);
    }
  };

  const updateAnswers = async (
    body: StudentTextbookAnswerRequest,
    callback?: Function
  ) => {
    isCallingApi.current = true;
    let resData: any = null;
    let error: any = null;
    try {
      const axiosRes = await answerQuestionTextbook(textbookId, body);
      resData = axiosRes.data;
      const responseData = resData?.data;
      if (resData && resData.status === 1 && responseData) {
        if (!totalAnsweredTimeRef.current || (responseData.totalAnswerTime && responseData.totalAnswerTime > totalAnsweredTimeRef.current))
          totalAnsweredTimeRef.current = responseData.totalAnswerTime;
        updateTextbook?.((prev: any) => ({
          ...prev,
          rowVersion: responseData?.rowVersion,
          questions: responseData.questions,
          lastAnswerTime: responseData.lastAnswerTime,
          totalPausedTime: responseData.totalPausedTime,
          ...(textbook?.isMock && { totalAnswerTime: responseData.totalAnswerTime })
        }));
      }
    } catch (err: any) {
      error = err;
    } finally {
      if (
        (error && error.code !== "ERR_NETWORK" && error.message !== "Network Error") ||
        (resData && resData?.status === 0)
      ) {
        const rollBackQuestions = await getRollBackQuestionList();
        if (rollBackQuestions) {
          updateQuestionList?.(rollBackQuestions.questions);
          const rollBackLastAnswerTime = rollBackQuestions.lastAnswerTime;
          const isValid = moment.invalid(rollBackLastAnswerTime);

          if (ltAnswerTime.current && isValid && moment(rollBackLastAnswerTime).isAfter(startTime) && moment(rollBackLastAnswerTime).isAfter(ltAnswerTime.current))
            ltAnswerTime.current = rollBackLastAnswerTime;
        }
        handleNextQuestion(true);

        const errorMessage = resData?.message || error?.response?.data?.title || error?.response?.data?.message;
        if (errorMessage && typeof errorMessage === "string" && !callback) {
          toast.error(errorMessage);
        } else if (!callback) {
          toast.error(getErrorMessage(t, error));
        }
      }
      if (resData?.status === 1) {
        await handleClearStorage();
      }
      if (resData?.status === 0)
        await removeDataStorage(`${recoverKey}`);
      await removeDataStorage(`${rollbackKey}`);
      callback?.();
      isCallingApi.current = false;
      processNextPendingCall();
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

    callApiUpdateAnswers(questions, lastAnswerTime, lastAnswerTimeNum, isStar, undefined, questionId);
  };

  const callApiUpdateAnswers = async (
    arrQuestionNew: PreparedQuestionResponse[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    isStar?: boolean,
    callback?: Function,
    questionId?: number
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
      timezoneOffset: new Date().getTimezoneOffset(),
      questions: arrQuestionNew.map((i) => ({
        questionId: i.id,
        selectedAnswers: i.selectedAnswers,
        textualAnswers: i.textualAnswers,
        duration: i.duration,
        isStar: !!i.isStar,
        answerTime: i.answerTime,
        unit: i.unit,
        isActivelyAnswered: questionId === undefined ? true : i.id === questionId
      })),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };
    const prevApiCall = apiTimeouts.current[rollbackKey];
    if (prevApiCall) {
      clearTimeout(apiTimeouts.current[rollbackKey]);
      delete apiTimeouts.current[rollbackKey];
    }
    if (!!callback) {
      if (isCallingApi.current) {
        pendingApiCall.current = { body, callback };
      } else {
        await updateAnswers(body, callback);
      }
    } else {
      apiTimeouts.current[rollbackKey] = setTimeout(
        () => {
          if (isCallingApi.current) {
            pendingApiCall.current = { body };
          } else {
            updateAnswers(body);
          }
        },
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
    if (!textbook || isMockTimeOut) return;
    const { now, nowTime } = getServerTimeFormatted();

    const listQuestionNews = _.cloneDeep(questionList);
    const arrQuestionNew = listQuestionNews.map((item: PreparedQuestionResponse) => {
      if (item.id === questionId) {
        switch (item.questionAnswerType) {
          case QuestionAnswerType.SingleChoice:
          case QuestionAnswerType.MultipleCorrectAnswers:
            if (answer === undefined) break;
            item.selectedAnswers = item.selectedAnswers?.includes(answer)
              ? item.selectedAnswers.filter((i: number) => i != answer)
              : [answer];
            break;
          case QuestionAnswerType.MultipleChoice:
            if (answer === undefined) break;
            if (item.selectedAnswers?.includes(answer)) {
              item.selectedAnswers = item.selectedAnswers.filter((i: number) => i != answer);
            } else {
              const maxAllowed = (item.answerCount || 0) > 0 ? (item.answerCount || 0) - 1 : 0;
              if (maxAllowed > 0 && (item.selectedAnswers?.length ?? 0) >= maxAllowed) {
                item.selectedAnswers = [...(item.selectedAnswers ?? []).slice(1), answer];
              } else {
                item.selectedAnswers = [...(item.selectedAnswers ?? []), answer];
              }
            }
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
        if (item.answerTime && item.answerTime > 0 && (!item.duration || item.duration <= 0)) {
          item.duration = 1000;
        }
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
        timezoneOffset: new Date().getTimezoneOffset(),
        questions: arrQuestionNew.map((i) => ({
          questionId: i.id,
          selectedAnswers: i.selectedAnswers,
          textualAnswers: i.textualAnswers,
          duration: i.duration,
          isStar: !!i.isStar,
          answerTime: i.answerTime,
          unit: i.unit,
          isActivelyAnswered: questionId === undefined ? true : i.id === questionId
        })),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
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
      if (item.id === questionId) {
        item.isStar = isStar;
        const diff = getDiffTime(now, nowTime);
        item.duration = (item.duration || 0) + +diff;
        item.answerTime =
          item.answerTime && item.answerTime !== 0
            ? item.answerTime
            : nowTime;
        if (item.answerTime && item.answerTime > 0 && (!item.duration || item.duration <= 0)) {
          item.duration = 1000;
        }
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
    pausedMsConsumedRef.current = 0;
  }, []);

  useEffect(() => {
    ltAnswerTime.current = undefined
    totalAnsweredTimeRef.current = undefined
    pausedMsConsumedRef.current = 0;
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
