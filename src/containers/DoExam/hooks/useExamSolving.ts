import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExamQuestion,
  Question,
  StoredStudentAnswer,
  StudentAnswerRequest
} from "../config/types";
import { answerQuestionExam } from "../apiClients";
import _ from "lodash";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { diffFromNow, getErrorMessage, toast, toISOString } from "@/utils/helpers";
import { ActivityAction, ActivityResource, AppScreen, ExamStatus, QuestionAnswerType } from "@/utils/enums";
import moment from "moment";
import { ExamSessionResponse } from "@/utils/types";
import NetInfo from '@react-native-community/netinfo';
import { getDataStorage, removeDataStorage, setDataStorage } from "@/utils/storage";
import useServerTime from "@/hooks/useServerTime";
import { logError } from "@/utils/helpers/crashlyticsLogger";
import { useActivityTracking } from "@/hooks/useActivityTracking";
const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ"
const rollBackQuestionList = "rb";
const recoverQuestionList = "rc";
interface Props {
  examId?: number;
  exam?: ExamSessionResponse;
  examCode: string;
  questionList?: Question[];
  isEnding?: boolean;
  isProgressing?: boolean;
  updateExam?: React.Dispatch<React.SetStateAction<ExamSessionResponse | undefined>>
  updateQuestionList?: (questions: Question[]) => void;
  updateExamLastTimeAnswer?: (lastTimeAnswer: string) => void;
  handleExamEnded?: () => void;
  handleUpdateSlider?: (questionId: number) => void;
  handleNextQuestion: (isError?: boolean) => void
}
const useExamSolving = (props: Props) => {
  const {
    examId,
    exam,
    examCode,
    updateExam,
    questionList = [],
    isEnding = false,
    isProgressing = true,
    updateExamLastTimeAnswer,
    updateQuestionList,
    handleExamEnded,
    handleUpdateSlider,
    handleNextQuestion
  } = props;
  const { getServerNow } = useServerTime();
  const { track, trackError } = useActivityTracking({ screen: AppScreen.DoExam })

  const getServerTimeFormatted = useCallback(() => {
    const serverNow = getServerNow();
    const time = moment(serverNow).format(DATE_TIME_FORMAT);
    const now = toISOString(time);
    const nowTime = moment(now).utc().valueOf();
    return { time, now, nowTime };
  }, [getServerNow]);

  const user = useAuthStore(state => state.user)
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const academyId = selectedAcademy?.id
  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const { t } = useTranslation();
  const apiTimeouts = useRef<any>({});

  const ltAnswerTime = useRef<string | undefined>(undefined);
  const runningTimeRef = useRef<number | undefined>(undefined);
  const totalAnsweredTimeRef = useRef<number | undefined>(undefined);
  const isCallingApi = useRef<boolean>(false);
  const pendingApiCall = useRef<any>(null);
  const [recoverExamCode, setRecoveredExamCode] = useState<string>();
  const examRef = useRef(exam);
  useEffect(() => {
    examRef.current = exam;
  }, [exam]);

  const recoverKey = useMemo(() => {
    if (!academyDomain || !userId || !examCode || !academyId) return undefined;
    return `${recoverQuestionList}.${academyId}.${examCode}.${userId}`;
  }, [academyDomain, academyId, examCode, userId]);

  const rollbackKey = useMemo(() => {
    if (!academyDomain || !userId || !examCode || !academyId) return undefined;
    return `${rollBackQuestionList}.${academyId}.${examCode}.${userId}`;
  }, [academyDomain, academyId, examCode, userId]);

  const latestScheduledCall = useRef<{ body: StudentAnswerRequest; lastAnswerTime: string } | null>(null);

  const getDiffTime = (exam: ExamSessionResponse, now: string, totalRunningTime: number) => {
    const prevRunningTime = runningTimeRef.current ?? exam.runningTime ?? 0;
    const diff = Math.max(1000, totalRunningTime - prevRunningTime);
    runningTimeRef.current = Math.max(totalRunningTime, prevRunningTime + diff);
    ltAnswerTime.current = now;
    return diff;
  };

  const processNextPendingCall = () => {
    const pending = pendingApiCall.current;
    if (pending) {
      pendingApiCall.current = null;
      updateAnswers(pending.body, pending.lastAnswerTime, pending.callback);
    }
  };

  const updateAnswers = async (
    body: StudentAnswerRequest,
    lastAnswerTime: string,
    callback?: Function
  ) => {
    isCallingApi.current = true;
    let res: any = null;
    let error: any = null;
    const serverNow = getServerNow();
    try {
      res = await answerQuestionExam(examCode, body);
      res = res.data;
      const examResponse = res?.data;
      if (examResponse) {
        if (!runningTimeRef.current || (examResponse.runningTime && examResponse.runningTime > runningTimeRef.current))
          runningTimeRef.current = examResponse.runningTime;
        if (!totalAnsweredTimeRef.current || (examResponse.totalAnsweredTime && examResponse.totalAnsweredTime > totalAnsweredTimeRef.current))
          totalAnsweredTimeRef.current = examResponse.totalAnsweredTime;
        updateExam?.((prev: any) => {
          return ({ ...prev, questions: examResponse?.questions, rowVersion: examResponse?.rowVersion || prev?.rowVersion, runningTime: examResponse?.runningTime, startTime: examResponse?.startTime, totalAnsweredTime: examResponse?.totalAnsweredTime, totalPausedTime: examResponse?.totalPausedTime })
        })
      }
    } catch (err: any) {
      const { nowTime } = getServerTimeFormatted();
      logError(err, {
        action: 'ANSWER_API_FAIL',
        examCode,
        time: nowTime
      })
      error = err;
    } finally {
      if (res && res?.status === 1) {
        updateExamLastTimeAnswer?.(lastAnswerTime);
      }
      if (
        (error && error.code !== "ERR_NETWORK" && error.message !== "Network Error") ||
        (res && res?.status === 0)
      ) {
        const rollBackQuestions = await getRollBackQuestionList();
        if (rollBackQuestions) {
          updateQuestionList?.(rollBackQuestions.questions);
          if (ltAnswerTime.current && (diffFromNow(rollBackQuestions.lastAnswerTime, serverNow, ltAnswerTime.current) || 0) > 0)
            ltAnswerTime.current = rollBackQuestions.lastAnswerTime;
        }
        handleNextQuestion(true);

        const errorMessage = res?.message || error?.response?.data?.title || error?.response?.data?.message;
        if (errorMessage && typeof errorMessage === "string" && !callback) {
          toast.error(errorMessage);
        } else if (!callback) {
          toast.error(getErrorMessage(t, error));
        }
      }
      if (res?.status === 0)
        await removeDataStorage(`${recoverKey}`);
      await removeDataStorage(`${rollbackKey}`);
      callback?.();
      isCallingApi.current = false;
      processNextPendingCall();
    }
  };

  const handleUpdateAnswer = async (
    questions: Question[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    runningTime: number,
    questionId?: number,
    isStar?: boolean
  ) => {
    if (!exam || !recoverKey) return;
    await setDataStorage(
      recoverKey,
      JSON.stringify({
        lastAnswerTime: lastAnswerTimeNum,
        runningTime,
        questions
      })
    );

    questionId && handleUpdateSlider?.(questionId);

    callApiUpdateAnswers(questions, lastAnswerTime, lastAnswerTimeNum, runningTime, isStar, undefined, questionId);
  };

  const callApiUpdateAnswers = async (
    arrQuestionNew: Question[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    runningTime: number,
    isStar?: boolean,
    callback?: Function,
    questionId?: number
  ) => {
    if ((!examId && !callback) || !rollbackKey) return;
    const serverNow = getServerNow();

    await setDataStorage(
      rollbackKey,
      JSON.stringify({
        lastAnswerTime: lastAnswerTime,
        runningTime,
        questions: questionList
      })
    );
    if (ltAnswerTime.current && (diffFromNow(lastAnswerTime, serverNow, ltAnswerTime.current) || 0) > 0)
      ltAnswerTime.current = lastAnswerTime;
    updateQuestionList?.(arrQuestionNew);

    !isStar && handleNextQuestion()

    const mappedQuestions = arrQuestionNew.map((i) => {
      let duration = Math.max(0, Math.round(i.duration || 0));
      let answerTime = i.answerTime && i.answerTime > 0 ? i.answerTime : 0;

      if (answerTime > 0 && duration === 0) {
        duration = 1000;
      } else if (duration > 0 && answerTime === 0) {
        answerTime = lastAnswerTimeNum;
      }

      return {
        questionId: i.id,
        selectedAnswers: i.selectedAnswers,
        textualAnswers: i.textualAnswers,
        duration,
        isStar: !!i.isStar,
        answerTime,
        unit: i.unit,
        isActivelyAnswered: questionId === undefined ? true : i.id === questionId
      };
    });

    const sumQuestionDuration = mappedQuestions.reduce((acc, q) => acc + (q.duration || 0), 0);
    const finalRunningTime = Math.max(runningTime || 0, sumQuestionDuration);

    const body: StudentAnswerRequest = {
      lastAnswerTime: lastAnswerTimeNum,
      timezoneOffset: new Date().getTimezoneOffset(),
      runningTime: finalRunningTime,
      questions: mappedQuestions,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };
    const prevApiCall = apiTimeouts.current[rollbackKey];
    if (prevApiCall) {
      clearTimeout(apiTimeouts.current[rollbackKey]);
      delete apiTimeouts.current[rollbackKey];
    }
    if (!!callback) {
      if (isCallingApi.current) {
        pendingApiCall.current = { body, lastAnswerTime, callback };
      } else {
        await updateAnswers(body, lastAnswerTime, callback);
      }
    } else {
      latestScheduledCall.current = { body, lastAnswerTime };
      apiTimeouts.current[rollbackKey] = setTimeout(
        () => {
          latestScheduledCall.current = null;
          if (isCallingApi.current) {
            pendingApiCall.current = { body, lastAnswerTime };
          } else {
            updateAnswers(body, lastAnswerTime);
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
  const updateQuestionAnswer = ({ questionId, textualAnswers = [], answer }: ExamQuestion) => {
    const { now, nowTime } = getServerTimeFormatted();

    if (!exam) return;
    const examStatus = exam.isLate ? exam.lateStatus : exam.status
    if (examStatus !== ExamStatus.InProgress) return;

    const calculatedRunningTime = moment(now).diff(
      moment.utc(!exam.isLate ? exam.startTime : exam.startTimeSession).local(),
      "milliseconds"
    ) - (exam.totalPausedTime || 0);

    const totalRunningTime = Math.max(
      exam.runningTime || 0,
      runningTimeRef.current || 0,
      calculatedRunningTime || 0
    );

    const listQuestionNews = _.cloneDeep(questionList);
    const arrQuestionNew = listQuestionNews.map((item: Question) => {
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

        const diff = Math.max(0, getDiffTime(exam, now, totalRunningTime));
        item.duration = Math.max(1000, (item.duration || 0) + diff);
        item.answerTime =
          item.answerTime && item.answerTime > 0
            ? item.answerTime
            : nowTime;
      }
      return item;
    });

    try {
      const answeredQuestion = arrQuestionNew.find(q => q.id === questionId);
      track({
        action: ActivityAction.Answer,
        resourceType: ActivityResource.Exam,
        resourceId: String(exam?.id),
        triggeredAt: now,
        metaData: {
          examId: exam?.examId,
          examSession: exam?.id,
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          examCode: exam?.code || '',
          studentExamSessionId: String(exam?.studentExamSessionId || ''),
          questionId,
          selectedAnswers: answeredQuestion?.selectedAnswers,
          textualAnswers: answeredQuestion?.textualAnswers,
          answerTime: nowTime,
        }
      })

      handleUpdateAnswer(arrQuestionNew, now, nowTime, totalRunningTime, questionId);
    } catch (error) {
      logError(error, {
        action: 'ANSWER_QUESTION',
        questionId,
        examId: String(exam?.id),
        examCode: exam?.code || '',
        status: exam?.isLate ? exam?.lateStatus : exam?.status,
        studentExamSessionId: String(exam?.studentExamSessionId || ''),
      })
      const mappedQuestionsCatch = arrQuestionNew.map((i) => {
        let duration = Math.max(0, Math.round(i.duration || 0));
        let answerTime = i.answerTime && i.answerTime > 0 ? i.answerTime : 0;
        if (answerTime > 0 && duration === 0) {
          duration = 1000;
        } else if (duration > 0 && answerTime === 0) {
          answerTime = nowTime;
        }
        return {
          questionId: i.id,
          selectedAnswers: i.selectedAnswers,
          textualAnswers: i.textualAnswers,
          duration,
          isStar: !!i.isStar,
          answerTime,
          unit: i.unit,
          isActivelyAnswered: questionId === undefined ? true : i.id === questionId
        };
      });

      const sumDurationCatch = mappedQuestionsCatch.reduce((acc, q) => acc + (q.duration || 0), 0);

      const body: StudentAnswerRequest = {
        lastAnswerTime: nowTime,
        timezoneOffset: new Date().getTimezoneOffset(),
        runningTime: Math.max(totalRunningTime || 0, sumDurationCatch),
        questions: mappedQuestionsCatch,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      };
      trackError(error, {
        resourceType: ActivityResource.Question,
        resourceId: String(questionId),
        triggeredAt: now,
        metaData: {
          action: Object.keys(ActivityAction.Answer),
          examId: String(exam?.id),
          body,
          examCode: exam?.code || '',
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          studentExamSessionId: String(exam?.studentExamSessionId || ''),
          questionId,
          selectedAnswers: answer !== undefined ? [answer] : undefined,
          textualAnswers,
          answerTime: nowTime,
        }
      })
    }
  };

  const updateQuestionStar = (questionId: number, isStar: boolean) => {
    if (!exam) return;

    const { now, nowTime } = getServerTimeFormatted();

    const examStatus = exam.isLate ? exam.lateStatus : exam.status
    if (examStatus !== ExamStatus.InProgress) return

    const totalRunningTime = moment(now).diff(moment.utc(!exam.isLate ? exam.startTime : exam.startTimeSession).local(), "milliseconds") - exam.totalPausedTime

    const listQuestionNews = _.cloneDeep(questionList);
    const arrQuestionNew = listQuestionNews.map((item: Question) => {
      if (item.id === questionId) {
        item.isStar = isStar;
        const diff = Math.max(0, getDiffTime(exam, now, totalRunningTime));
        item.duration = (item.duration || 0) + diff;
        if (item.duration > 0 && (!item.answerTime || item.answerTime <= 0)) {
          item.answerTime = nowTime;
        } else if ((!item.duration || item.duration <= 0) && item.answerTime && item.answerTime > 0) {
          item.duration = 1000;
        }
      }
      return item;
    });

    try {
      track({
        action: ActivityAction.StarAnswer,
        resourceType: ActivityResource.Question,
        resourceId: String(questionId),
        triggeredAt: now,
        metaData: {
          examId: exam?.examId,
          examSession: exam?.id,
          examCode: exam?.code || '',
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          studentExamSessionId: String(exam.studentExamSessionId || ''),
          questionId,
          isStar,
          answerTime: nowTime,
        }
      })

      handleUpdateAnswer(arrQuestionNew, now, nowTime, totalRunningTime, questionId, true);
    } catch (error) {
      logError(error, {
        action: 'ANSWER_STAR_QUESTION',
        questionId,
        examId: String(exam?.id),
        status: exam?.isLate ? exam?.lateStatus : exam?.status,
        examCode: exam?.code || '',
        studentExamSessionId: String(exam?.studentExamSessionId || ''),
      })
      const body: StudentAnswerRequest = {
        lastAnswerTime: nowTime,
        runningTime: totalRunningTime,
        questions: arrQuestionNew.map((i) => {
          let duration = Math.max(0, Math.round(i.duration || 0));
          let answerTime = i.answerTime && i.answerTime > 0 ? i.answerTime : 0;
          if (answerTime > 0 && duration === 0) {
            duration = 1000;
          } else if (duration > 0 && answerTime === 0) {
            answerTime = nowTime;
          }
          return {
            questionId: i.id,
            selectedAnswers: i.selectedAnswers,
            duration,
            isStar: i.isStar,
            answerTime,
            textualAnswers: i.textualAnswers,
            unit: i.unit
          };
        })
      };
      trackError(error, {
        resourceType: ActivityResource.Question,
        resourceId: String(questionId),
        triggeredAt: now,
        metaData: {
          action: Object.keys(ActivityAction.StarAnswer),
          examId: exam?.examId,
          body,
          examSession: exam?.id,
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          examCode: exam?.code || '',
          studentExamSessionId: String(exam?.studentExamSessionId || ''),
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
    const currentExam = examRef.current;
    if (!currentExam) return
    let data: StoredStudentAnswer | null = null;
    try {
      const recoverJsonQuestions = await getDataStorage(recoverKey);
      data = JSON.parse(recoverJsonQuestions || "");
    } catch (error) {
      await removeDataStorage(recoverKey);
    }
    const currentLastAnswerTime = currentExam.lastAnswerTime
      ? moment.utc(currentExam.lastAnswerTime).valueOf()
      : 0;

    const examRunningTime = currentExam.runningTime || 0;

    if (
      !!data &&
      data.questions.length &&
      data.lastAnswerTime &&
      currentLastAnswerTime < data.lastAnswerTime &&
      examRunningTime <= data.runningTime
    ) {
      const lastAnswerTime = moment(data.lastAnswerTime)
        .toDate()
        .toISOString();
      await callApiUpdateAnswers(
        data.questions,
        lastAnswerTime,
        data.lastAnswerTime,
        data.runningTime || 0,
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
    setRecoveredExamCode(undefined);
    if (!recoverKey) {
      setRecoveredExamCode(recoverKey);
      return;
    }
    try {
      await handleRecoverExamAnswer(recoverKey, () => {
        handleClearStorage()
      })
    } catch (e: any) {
      console.log({ error: e.message });
    }
    setRecoveredExamCode(recoverKey);
  }

  useEffect(() => {
    if (!recoverKey || !examId) return;
    const endExam = async () => {
      if (isEnding) {
        await removeDataStorage(recoverKey);
        handleExamEnded?.();
      }
    };

    handleRecoverExamAnswer(recoverKey, endExam);
  }, [recoverKey, examId, isEnding, handleExamEnded]);

  useEffect(() => {
    !isProgressing && recoverAnswers()
  }, [recoverKey, isProgressing])

  useEffect(() => {
    let unsubscribe: any;

    if (isProgressing) {
      unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable) {
          recoverAnswers();
        }
      });
    }

    return () => {
      unsubscribe?.();
    };
  }, [isProgressing, recoverKey]);

  const handleResetExamSolving = useCallback(() => {
    Object.values(apiTimeouts.current).forEach((timeout: any) => clearTimeout(timeout));
    apiTimeouts.current = {};
    ltAnswerTime.current = undefined;
    runningTimeRef.current = undefined;
    totalAnsweredTimeRef.current = undefined;
    setRecoveredExamCode(undefined);
  }, []);

  useEffect(() => {
    ltAnswerTime.current = undefined
    runningTimeRef.current = undefined
    totalAnsweredTimeRef.current = undefined
  }, [exam?.id])

  const flushPendingAnswers = useCallback(async () => {
    if (rollbackKey && apiTimeouts.current[rollbackKey]) {
      clearTimeout(apiTimeouts.current[rollbackKey]);
      delete apiTimeouts.current[rollbackKey];
      const call = latestScheduledCall.current;
      latestScheduledCall.current = null;
      if (call) {
        if (isCallingApi.current) {
          pendingApiCall.current = call;
        } else {
          await updateAnswers(call.body, call.lastAnswerTime);
        }
      }
    }

    const startTime = Date.now();
    while ((isCallingApi.current || pendingApiCall.current) && Date.now() - startTime < 3000) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }, [rollbackKey]);

  return {
    recoverExamCode,
    recoverKey,
    updateQuestionAnswer,
    updateQuestionStar,
    handleClearStorage,
    handleRecoverExamAnswer,
    handleResetExamSolving,
    flushPendingAnswers
  };
};

export default useExamSolving;
