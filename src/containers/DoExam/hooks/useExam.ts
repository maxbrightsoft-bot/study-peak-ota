import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getQuestionExam,
  finishExam,
  restartExamApi,
  pauseAndResumeExamApi,
  apiJoinExam,
} from "../apiClients/index";
import {
  Question,
  QuestionGroupResponse,
  QuestionResponse,
} from "../config/types";
import _ from "lodash";
import useExamSolving from "./useExamSolving";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { ExamEvent, ExamStatus } from "@/utils/enums";
import { getErrorMessage, toast } from "@/utils/helpers";
import useCountDownTimer from "@/hooks/useCountDownTimer";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { findNodeHandle, ScrollView, UIManager, View, Alert } from "react-native";
import { Routes } from "@/navigators/RouteName";
import { navigate, currentScreen } from "@/navigators/NavigationHelpers";
import { PusherChannel } from "@pusher/pusher-websocket-react-native";
import { DATE_MIN_VALUE, DATE_TIME_MIN_VALUE, EXAM_CHANNEL } from "@/utils/constants";
import { ExamSessionResponse, PauseOrResumeExamRequest } from "@/utils/types";
import { dialogConfirm } from "@/utils/helpers/dialog";
import useAuthStore from "@/store/useAuthStore";

type Props = {
  examCode: string;
  onExamEnded?: (examCode?: string) => void;
};

const useExam = ({ examCode, onExamEnded }: Props) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [questionListMapped, setQuestionListMapped] = useState<QuestionGroupResponse[]>([]);
  const [exam, setExam] = useState<ExamSessionResponse>();
  const firstLoadRef = useRef<boolean>(true);
  const [endExam, setEndExam] = useState<boolean>();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isEnding, setEnding] = useState<boolean>(false);
  const [isNotFoundExam, setNotFoundExam] = useState<boolean>();
  const [liveResultDialog, setLiveResultDialog] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [isOpenConfirmDialog, setOpenConfirmDialog] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const questionRefs = useRef<Array<View | null>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const channel = useRef<PusherChannel>();
  const channelName = useRef<string>();
  const pendingScrollIndex = useRef<number | null>(null);

  const { user, setLoading, pusher,
    subscribeChannel } = useAuthStore()

  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const toggleExpand = useCallback((id: number | null) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const scrollToNextQuestion = useCallback(
    (index: number) => {
      const nextIndex = index + 1;
      if (nextIndex >= questionList.length) return;

      pendingScrollIndex.current = nextIndex;

      toggleExpand(questionList[nextIndex].id);
      setCurrentIndex(questionList[nextIndex].questionOrder);
    },
    [questionList, toggleExpand, setCurrentIndex]
  );

  const handleQuestionLayout = (index: number) => {
    if (pendingScrollIndex.current !== index) return;

    const ref = questionRefs.current[index];
    const scrollViewNode = scrollViewRef.current
      ? findNodeHandle(scrollViewRef.current)
      : null;

    if (!ref || !scrollViewNode) return;

    const node = findNodeHandle(ref);
    if (!node) return;

    UIManager.measureLayout(
      node,
      scrollViewNode,
      () => { },
      (_left, top) => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, top - 16),
          animated: true,
        });
      }
    );

    pendingScrollIndex.current = null;
  };

  const handleCloseResultDialog = () => {
    setOpenResultDialog(false);
  };

  const handleOpenResultDialog = () => {
    setOpenResultDialog(true);
  };

  const handleCloseLiveResultDialog = () => {
    setLiveResultDialog(false);
  };

  const handleOpenLiveResultDialog = () => {
    setLiveResultDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleExamEnd = () => {
    setQuestionList([]);
    handleCloseLiveResultDialog();
    handleCloseResultDialog();

    navigate(Routes.Auth.Home);
  };

  const handleDetailExamResult = () => {
    handleCloseLiveResultDialog();
    handleOpenResultDialog();
  };

  const getQuestionExams = async (showErrorMessage: boolean = false) => {
    if (!examCode || !academyDomain || !userId) return;

    setEnding(false);
    setNotFoundExam(false);
    firstLoadRef.current && setLoading(true);

    try {
      const res = await getQuestionExam(examCode);
      const data = res.data?.data;
      const isCompleted = data?.isLate
        ? data?.lateStatus === ExamStatus.Completed
        : data?.status === ExamStatus.Completed;

      const examData = data

      setExam(examData);

      if (isCompleted) {
        handleTeacherFinishExam();
        setLoading(false);
        return;
      }

      const questionGroupsResponse: QuestionGroupResponse[] = data?.questionGroups || [];
      const responseQuestions: QuestionResponse[] = questionGroupsResponse.reduce(
        (acc: QuestionResponse[], item: QuestionGroupResponse) => {
          return acc.concat(item.questions);
        }, []
      );

      const questions = responseQuestions.map((i, index) => ({
        ...i,
        questionIndex: index,
        answerTime:
          i.answerTime !== DATE_MIN_VALUE && i.answerTime
            ? moment.utc(i.answerTime).valueOf()
            : 0,
      }));

      setQuestionList(questions);
      setQuestionListMapped(questionGroupsResponse);
      setEndExam(!!data?.finishTime && data?.finishTime !== DATE_TIME_MIN_VALUE);
    } catch (err) {
      (firstLoadRef.current || showErrorMessage) &&
        showToast("error", getErrorMessage(t, err));
      setNotFoundExam(true);
    }

    setLoading(false);
    if (firstLoadRef.current) firstLoadRef.current = false;
  };

  const getCheckStatus = useCallback(() => {
    setEnding(true);
    setExam((state) => !state ? state : ({
      ...state,
      lateStatus: state.isLate ? ExamStatus.Completed : state.lateStatus,
      status: !state.isLate ? ExamStatus.Completed : state.status,
    }));
  }, []);

  const handleExamEnded = useCallback(() => {
    currentScreen() === Routes.Auth.DoExam && isEnding && setLiveResultDialog(true);
  }, [examCode, isEnding, onExamEnded]);

  const callFinishExam = useCallback(async () => {
    setLoading(true);
    try {
      await finishExam(examCode);
      showToast("success", t("finish_exam_successful"));
      setEndExam(true);
      exam && exam.isLate && getCheckStatus();
    } catch (error: any) {
      showToast("error", getErrorMessage(t, error));
      setEndExam(false);
    }
    setLoading(false);
  }, [examCode, exam, getCheckStatus]);

  const onFishedExam = useCallback(() => {
    if (endExam) return;

    dialogConfirm(
      t,
      "do_you_want_to_quit_your_exam",
      () => setEndExam(false),
      () => callFinishExam()
    );
  }, [endExam, callFinishExam]);

  const handlePauseAndResumeExam = async (status: ExamStatus) => {
    if (!exam) return;

    setLoading(true);
    try {
      const nowTime = new Date().valueOf();
      const req: PauseOrResumeExamRequest = {
        status,
        rowVersion: exam.rowVersion,
        pauseTime: nowTime
      };

      const res = await pauseAndResumeExamApi(exam?.code || '', req);
      const data = res.data;
      const isCompleted = data?.status === ExamStatus.Completed;

      setExam((prev) => {
        if (!prev) return undefined;
        return {
          ...prev,
          lateStatus: data?.status,
          totalPausedTime: data?.totalPausedTime,
          duration: data?.duration,
          startTimeSession: data?.startTime,
          lastPausedAt: data?.lastPausedAt,
          lastResumedAt: data?.lastResumedAt,
          rowVersion: data?.rowVersion
        };
      });

      if (isCompleted) {
        handleTeacherFinishExam();
        setLoading(false);
        return;
      }
    } catch (error) {
      showToast("error", getErrorMessage(t, error));
    }
    setLoading(false);
  };

  const handleRestartExam = async () => {
    if (!exam || (!exam.isLate && exam.lateStatus !== ExamStatus.Completed)) return;

    setLoading(true);
    try {
      await restartExamApi(exam?.code || '');
      handleClear()
      getQuestionExams();
    } catch (error) {
      showToast("error", getErrorMessage(t, error));
    }
    setLoading(false);
  };

  const handleTeacherAddDurationExam = (data: any) => {
    const duration = data.Duration;
    setExam((state?: ExamSessionResponse) =>
      state ? { ...state, duration } : undefined
    );
  };

  const handleTeacherRestartExam = async (data: any) => {
    if (!data) return;

    const item = JSON.parse(data);
    await apiJoinExam(item?.code, true);
    handleClear()
    await getQuestionExams();
    showToast("info", t("exam_has_been_restarted"));
  };

  const handleTeacherPauseResumeExam = (data: any) => {
    if (!data) return;

    const item = JSON.parse(data);
    showToast("info", t(item.status === ExamStatus.Paused ? "exam_has_been_paused" : "exam_has_been_resumed"));

    setExam((state?: ExamSessionResponse) =>
      state ? { ...state, ...item } : undefined
    );
  };

  const handleTeacherFinishExam = (data?: any) => {
    if (data?.isDelete) {
      handleCloseLiveResultDialog();
      setEnding(true)
      showToast("info", t("exam_has_been_cancelled"));

      navigate(Routes.Auth.Home);
    } else {
      getCheckStatus();
    }
  };

  const handleUpdateQuestionList = (questions: Question[]) => {
    setQuestionList(questions);
  };

  const handleExamLastAnswerTime = (answerTime: string) => {
    setExam((state?: ExamSessionResponse) => {
      if (!state) return undefined;
      return { ...state, lastAnswerTime: answerTime };
    });
  };

  const { updateQuestionAnswer, updateQuestionStar } = useExamSolving({
    examId: exam?.id,
    exam,
    examCode: examCode,
    questionList,
    isEnding,
    updateQuestionList: handleUpdateQuestionList,
    updateExamLastTimeAnswer: handleExamLastAnswerTime,
    handleExamEnded: handleExamEnded,
  });

  const handleListenerEvent = async () => {
    try {
      if (!pusher || !exam || !academyDomain) return;

      channelName.current = `${EXAM_CHANNEL}-${exam.code}-${academyDomain.trim().toUpperCase()}`;

      const examHandlers = {
        [ExamEvent.AddExtraDuration]: handleTeacherAddDurationExam,
        [ExamEvent.TerminateExam]: handleTeacherFinishExam,
        [ExamEvent.PauseResumeExam]: handleTeacherPauseResumeExam,
        [ExamEvent.RestartExam]: handleTeacherRestartExam
      };


      channel.current = await subscribeChannel(
        pusher,
        channelName.current,
        Object.entries(examHandlers).map(([eventName, handler]) => ({ eventName, handler }))
      );

    } catch (err) {
      console.error("Pusher subscription failed", err);
    }
  };

  const handleClear = () => {
    setExpandedId(null);
    handleCloseLiveResultDialog()
    handleCloseResultDialog()
    setQuestionList([])
    pendingScrollIndex.current = null;
    firstLoadRef.current = true
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }

  useEffect(() => {
    const unsubscribe = navigation?.addListener('beforeRemove', (e) => {
      if (exam?.status !== ExamStatus.InProgress) return;

      e.preventDefault();
      Alert.alert(
        t('warning'),
        t('are_you_sure_you_want_to_quit_yours_changes_may_not_be_saved'),
        [
          { text: t('cancel'), style: 'cancel', onPress: () => { } },
          {
            text: t('leave'),
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action)
          }
        ]
      );
    });

    return unsubscribe;
  }, [navigation, exam?.status, t]);

  useEffect(() => {
    handleListenerEvent();

  }, [exam?.code, academyDomain, pusher]);

  useFocusEffect(
    useCallback(() => {
      if (!examCode || !academyDomain || !userId) return;
      if (firstLoadRef.current) {
        getQuestionExams();
        firstLoadRef.current = false;
      }

      scrollViewRef.current?.scrollTo({ y: 0, animated: false });

      return () => {
        handleClear()
      };
    }, [examCode, academyDomain, userId])
  );

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    toast[type](message);
  };

  const convertHHMMSStoSeconds = (timeString?: string): number | undefined => {
    if (!timeString) return undefined;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + (seconds || 0);
  };

  const remainTime = useCountDownTimer({
    ...exam,
    startTime: exam?.isLate ? exam.startTimeSession : exam?.startTime,
    status: exam?.isLate ? exam.lateStatus : exam?.status,
    duration: convertHHMMSStoSeconds(exam?.duration),
    onFinish: getCheckStatus
  });

  const remainTimeString = useMemo(() => {
    const secondsToTimeSpan = (sec?: number) => {
      if (sec === undefined)
        return t("mins_mins_seconds_seconds", { mins: "00", seconds: "00" });
      const min = Math.floor(sec / 60);
      const seconds = sec - min * 60;
      return t("mins_mins_seconds_seconds", {
        mins: min.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0")
      });
    };
    return secondsToTimeSpan(remainTime !== undefined && remainTime < 0 ? 0 : remainTime);
  }, [remainTime, t]);

  const totalTimeString = useMemo(() => {
    if (!exam?.duration) return "";

    const times = exam.duration.split(":");
    return `${+times[0] * 60 + +times[1]}${t("minutes")}`;

  }, [exam?.duration, t]);

  const page = questionList.length

  return {
    t,
    page,
    exam,
    isEnding,
    examCode,
    endExam,
    questionListMapped,
    openResultDialog,
    questionList,
    isNotFoundExam,
    currentSlide,
    remainTimeString,
    remainTime,
    totalTimeString,
    updateQuestionAnswer,
    updateQuestionStar,
    onFishedExam,
    getCheckStatus,
    setCurrentSlide,
    handleQuestionLayout,
    handleRestartExam,
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handlePauseAndResumeExam,
    handleCloseResultDialog,
    handleOpenResultDialog,
    currentIndex,
    expandedId,
    toggleExpand,
    scrollViewRef,
    questionRefs,
    scrollToNextQuestion,
    liveResultDialog,
    handleExamEnd,
    handleDetailExamResult,
    handleCloseLiveResultDialog,
    handleOpenLiveResultDialog
  };
};

export default useExam;