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
import { ActivityAction, ExamStatus, QuestionAnswerType } from "@/utils/enums";
import moment from "moment";
import { isTextType } from "@/utils/helpers/textbook";
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
  const { track } = useActivityTracking()

  const getServerTimeFormatted = useCallback(() => {
    const serverNow = getServerNow();
    const time = moment(serverNow).format(DATE_TIME_FORMAT);
    const now = toISOString(time);
    const nowTime = moment(now).utc().valueOf();
    return { time, now, nowTime };
  }, [getServerNow]);

  const { user, selectedAcademy } = useAuthStore()
  const academyId = selectedAcademy?.id
  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const { t } = useTranslation();
  const apiTimeouts = useRef<any>({});

  const ltAnswerTime = useRef<string>();
  const runningTimeRef = useRef<number>();
  const totalAnsweredTimeRef = useRef<number>();
  const [recoverExamCode, setRecoveredExamCode] = useState<string>();

  const recoverKey = useMemo(() => {
    if (!academyDomain || !userId || !examCode || !academyId) return undefined;
    return `${recoverQuestionList}.${academyId}.${examCode}.${userId}`;
  }, [academyDomain, academyId, examCode, userId]);

  const rollbackKey = useMemo(() => {
    if (!academyDomain || !userId || !examCode || !academyId) return undefined;
    return `${rollBackQuestionList}.${academyId}.${examCode}.${userId}`;
  }, [academyDomain, academyId, examCode, userId]);

  const getDiffTime = (exam: ExamSessionResponse, now: string, totalRunningTime: number) => {
    let diff = 0;
    if ((exam.runningTime != 0 || (!!runningTimeRef.current)) && !exam.isLate)
      diff = totalRunningTime - (runningTimeRef.current ?? exam.runningTime);
    else
      diff = totalRunningTime - (totalAnsweredTimeRef.current ?? exam.totalAnsweredTime) - exam.totalPausedTime;
    diff = Math.max(0, diff)
    runningTimeRef.current = totalRunningTime;
    ltAnswerTime.current = now;
    if (!totalAnsweredTimeRef.current) totalAnsweredTimeRef.current = exam.totalAnsweredTime
    totalAnsweredTimeRef.current += diff
    return diff;
  };

  const updateAnswers = async (
    body: StudentAnswerRequest,
    lastAnswerTime: string,
    callback?: Function
  ) => {
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
          return ({ ...prev, questions: examResponse?.questions, rowVersion: examResponse?.rowVersion, runningTime: examResponse?.runningTime, startTime: examResponse?.startTime, totalAnsweredTime: examResponse?.totalAnsweredTime, totalPausedTime: examResponse?.totalPausedTime })
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
      handleNextQuestion(true)
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
          if (ltAnswerTime.current && (diffFromNow(rollBackQuestions.lastAnswerTime, serverNow, ltAnswerTime.current) || 0) > 0)
            ltAnswerTime.current = rollBackQuestions.lastAnswerTime;
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
        questions
      })
    );

    questionId && handleUpdateSlider?.(questionId);

    callApiUpdateAnswers(questions, lastAnswerTime, lastAnswerTimeNum, runningTime, isStar);
  };

  const callApiUpdateAnswers = async (
    arrQuestionNew: Question[],
    lastAnswerTime: string,
    lastAnswerTimeNum: number,
    runningTime: number,
    isStar?: boolean,
    callback?: Function
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

    const body: StudentAnswerRequest = {
      lastAnswerTime: lastAnswerTimeNum,
      runningTime: runningTime,
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
        () => updateAnswers(body, lastAnswerTime),
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
    try {
      if (!exam) return;
      const examStatus = exam.isLate ? exam.lateStatus : exam.status
      if (examStatus !== ExamStatus.InProgress) return
      const { now, nowTime } = getServerTimeFormatted();

      const totalRunningTime = moment(now).diff(moment.utc(!exam.isLate ? exam.startTime : exam.startTimeSession).local(), "milliseconds") - exam.totalPausedTime

      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: Question) => {
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

          const diff = getDiffTime(exam, now, totalRunningTime)
          item.duration = (item.duration || 0) + diff;

          item.answerTime =
            item.answerTime && item.answerTime !== 0
              ? item.answerTime
              : nowTime;
        }
        return item;
      });

      track({
        action: ActivityAction.Answer,
        metaData: {
          questionId,
          examId: String(exam?.id),
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          examCode: exam?.code || '',
          studentExamSessionId: String(exam?.studentExamSessionId || ''),
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
      track({
        action: ActivityAction.Error,
        metaData: {
          type: ActivityAction.Answer,
          questionId,
          examId: String(exam?.id),
          examCode: exam?.code || '',
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          studentExamSessionId: String(exam?.studentExamSessionId || ''),
        }
      })
    }
  };

  const updateQuestionStar = (questionId: number, isStar: boolean) => {
    try {
      if (!exam) return;
      const examStatus = exam.isLate ? exam.lateStatus : exam.status
      if (examStatus !== ExamStatus.InProgress) return
      const { now, nowTime } = getServerTimeFormatted();

      const totalRunningTime = moment(now).diff(moment.utc(!exam.isLate ? exam.startTime : exam.startTimeSession).local(), "milliseconds") - exam.totalPausedTime

      const listQuestionNews = _.cloneDeep(questionList);
      const arrQuestionNew = listQuestionNews.map((item: Question) => {
        if (item.id === questionId) {
          item.isStar = isStar;
          const diff = getDiffTime(exam, now, totalRunningTime)
          item.duration = (item.duration || 0) + diff;
          item.answerTime =
            item.answerTime && item.answerTime !== 0
              ? item.answerTime
              : nowTime;
        }
        return item;
      });

      track({
        action: ActivityAction.StarAnswer,
        metaData: {
          questionId,
          examId: String(exam.id),
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          examCode: exam.code || '',
          studentExamSessionId: String(exam.studentExamSessionId || ''),
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
      track({
        action: ActivityAction.Error,
        metaData: {
          type: ActivityAction.StarAnswer,
          questionId,
          examId: String(exam?.id),
          status: exam?.isLate ? exam?.lateStatus : exam?.status,
          examCode: exam?.code || '',
          studentExamSessionId: String(exam?.studentExamSessionId || ''),
        }
      })
    }
  };

  const handleRecoverExamAnswer = async (
    recoverKey: string,
    callback?: Function
  ) => {
    if (!exam) return
    let data: StoredStudentAnswer | null = null;
    try {
      const recoverJsonQuestions = await getDataStorage(recoverKey);
      data = JSON.parse(recoverJsonQuestions || "");
    } catch (error) {
      await removeDataStorage(recoverKey);
    }
    const currentLastAnswerTime = exam.lastAnswerTime
      ? moment.utc(exam.lastAnswerTime).valueOf()
      : 0;

    if (
      !!data &&
      data.questions.length &&
      data.lastAnswerTime &&
      currentLastAnswerTime < data.lastAnswerTime &&
      exam.runningTime <= data.runningTime
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

  useEffect(() => {
    ltAnswerTime.current = undefined
    runningTimeRef.current = undefined
    totalAnsweredTimeRef.current = undefined
  }, [exam?.timestamp])
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
