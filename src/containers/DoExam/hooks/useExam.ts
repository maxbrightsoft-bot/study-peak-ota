import { ScrollType } from './../config/types';
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
import { ExamEvent, ExamStatus, QuestionAnswerType } from "@/utils/enums";
import { formatMinutesToTime, getErrorMessage, toast } from "@/utils/helpers";
import useCountDownTimer from "@/hooks/useCountDownTimer";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { findNodeHandle, ScrollView, UIManager, View, Alert, FlatList } from "react-native";
import { Routes } from "@/navigators/RouteName";
import { navigate, currentScreen } from "@/navigators/NavigationHelpers";
import { PusherChannel } from "@pusher/pusher-websocket-react-native";
import { DATE_MIN_VALUE, DATE_TIME_MIN_VALUE, EXAM_CHANNEL } from "@/utils/constants";
import { ExamSessionResponse, InfoExamSessionByCode, PauseOrResumeExamRequest } from "@/utils/types";
import useAuthStore from "@/store/useAuthStore";
import { getExamInfoApi } from '@/containers/Home/apiClients';

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
  const [isEnding, setEnding] = useState<boolean>(false);
  const [isNotFoundExam, setNotFoundExam] = useState<boolean>();
  const [liveResultDialog, setLiveResultDialog] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);

  const { user, setLoading, pusher,
    subscribeChannel, setLoadingWithoutOverlay, unsubscribeChannelSafe } = useAuthStore()

  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const [isOpenConfirmDialog, setOpenConfirmDialog] = useState(false);
  const scrollViewRef = useRef<FlatList>(null);
  const questionRefs = useRef<Array<View | null>>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<number>();
  const channel = useRef<PusherChannel>();
  const channelName = useRef<string>();
  const [openConfirmFinishDialog, setOpenConfirmFinishDialog] = useState(false);
  const [openAnswerSheet, setOpenAnswerSheet] = useState(false);
  const [openInfoExamDialog, setOpenInfoExamDialog] = useState<boolean>(false);
  const [examSession, setExamSession] = useState<InfoExamSessionByCode>();
  const [openLeaveDialog, setOpenLeaveDialog] = useState<boolean>(false)

  const handleOpenLeaveDialog = () => {
    setOpenLeaveDialog(true)
  }

  const handleCloseLeaveDialog = () => {
    setOpenLeaveDialog(false)
  }

  const handleOpenInfoExamDialog = () => {
    setOpenInfoExamDialog(true);
  }

  const handleCloseInfoExamDialog = () => {
    setOpenInfoExamDialog(false);
  }

  const handleGetInfoExam = async () => {
    try {
      setLoadingWithoutOverlay(true);
      const response = await getExamInfoApi(examCode);
      setExamSession(response.data);
    } catch (error) {
    } finally {
      setLoadingWithoutOverlay(false);
    }
  };

  const handleOpenFinishConfirmDialog = () => {
    setOpenConfirmFinishDialog(true);
  }

  const handleCloseFinishConfirmDialog = () => {
    setOpenConfirmFinishDialog(false);
  }

  const handleOpenAnswerSheet = (id?: number) => {
    id && setCurrentQuestionId(id);
    setOpenAnswerSheet(true);
  }

  const handleCloseAnswerSheet = () => {
    setOpenAnswerSheet(false);
  }

  const handleNextQuestion = (isError?: boolean) => {
    if (!questionList?.length) return

    const currentIndex = questionList.findIndex(
      (q) => q.id === currentQuestionId
    )

    if (currentIndex === -1) return

    let targetIndex = currentIndex

    if (!isError) {
      targetIndex = Math.min(
        questionList.length - 1,
        currentIndex + 1
      )
    }
    else {
      targetIndex = Math.max(0, currentIndex - 1)
    }

    if (targetIndex === currentIndex) return

    setCurrentQuestionId(questionList[targetIndex].id)
    onScrollToIndex(targetIndex)
  }

  const scrollToQuestion = useCallback(
    (type: ScrollType) => {
      if (!questionList?.length) return

      const currentIndex = questionList.findIndex(
        (q) => q.id === currentQuestionId
      )

      if (currentIndex === -1) return

      let targetIndex = currentIndex

      switch (type) {
        case ScrollType.FIRST:
          targetIndex = 0
          break

        case ScrollType.LAST:
          targetIndex = questionList.length - 1
          break

        case ScrollType.PREV:
          targetIndex = Math.max(0, currentIndex - 1)
          break

        case ScrollType.NEXT:
          targetIndex = Math.min(
            questionList.length - 1,
            currentIndex + 1
          )
          break
      }

      if (targetIndex === currentIndex) return

      setCurrentQuestionId(questionList[targetIndex].id)
    },
    [questionList, currentQuestionId]
  )

  const onScrollToIndex = (index: number) => {
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
        scrollViewRef.current?.scrollToOffset({
          offset: top - 50,
          animated: true
        })
      }
    );
  };

  useEffect(() => {
    handleGetInfoExam()
  }, [])

  useEffect(() => {
    if (!currentQuestionId) return

    const index = questionList.findIndex(
      q => q.id === currentQuestionId
    )

    if (index === -1) return

    onScrollToIndex(index)
  }, [currentQuestionId])


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

  const questionStarList = useMemo(() => {
    return questionList.filter(q => q.isStar).map(q => q.id)
  }, [questionList])

  const handleNextStar = () => {
    const index = questionStarList.indexOf(currentQuestionId || 0)
    if (index === -1) return setCurrentQuestionId(questionStarList[0])

    const nextIndex = index + 1

    if (nextIndex < questionStarList.length) {
      setCurrentQuestionId(questionStarList[nextIndex])
    }
  }

  const handlePrevStar = () => {
    const index = questionStarList.indexOf(currentQuestionId || 0)
    if (index === -1) return setCurrentQuestionId(questionStarList[questionStarList.length - 1])

    const prevIndex = index - 1

    if (prevIndex >= 0) {
      setCurrentQuestionId(questionStarList[prevIndex])
    }
  }

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

  const handleFinishExam = useCallback(async () => {
    setLoadingWithoutOverlay(true);
    try {
      await finishExam(examCode);
      showToast("success", t("finish_exam_successful"));
      setEndExam(true);
      exam && exam.isLate && getCheckStatus();
    } catch (error: any) {
      showToast("error", getErrorMessage(t, error));
      setEndExam(false);
    }
    handleCloseFinishConfirmDialog()
    setLoadingWithoutOverlay(false);
  }, [examCode, exam, getCheckStatus]);

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

  useEffect(() => {
    if (questionList.length > 0) {
      setCurrentQuestionId(questionList[0].id);
    }
  }, [questionList.length]);

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
      handleCloseAnswerSheet()
      handleCloseConfirmDialog()
      handleCloseFinishConfirmDialog()
      handleCloseLeaveDialog()
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
    handleNextQuestion
  });

  const handleListenerEvent = async () => {
    try {
      if (!pusher || !exam?.code || !academyDomain) return;

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
    handleCloseLiveResultDialog()
    handleCloseResultDialog()
    handleCloseLeaveDialog()
    handleCloseFinishConfirmDialog()
    handleCloseConfirmDialog()
    setQuestionList([])
    setEnding(false)
    firstLoadRef.current = true
    scrollViewRef.current?.scrollToOffset({
      offset: 0,
      animated: true
    })
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

  useFocusEffect(
    useCallback(() => {
      if (!exam?.code) return;

      handleListenerEvent();
    }, [exam?.code, academyDomain, pusher])
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (channelName.current && pusher) {
          const channelNameText = channelName.current;
          unsubscribeChannelSafe(pusher, channelNameText);
        }

        channel.current = undefined;
        channelName.current = undefined;
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (!examCode || !academyDomain || !userId) return;
      if (firstLoadRef.current) {
        getQuestionExams();
        firstLoadRef.current = false;
      }

      scrollViewRef.current?.scrollToOffset({
        offset: 0,
        animated: true
      })

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

  const isAllQuestionsAnswered = (
    questionList: Question[]
  ): boolean => {
    if (!questionList?.length) return false

    return questionList.every((question) => {
      const { questionAnswerType, selectedAnswers, textualAnswers } = question

      if (questionAnswerType === QuestionAnswerType.SingleChoice || questionAnswerType === QuestionAnswerType.MultipleChoice) {
        return !!selectedAnswers?.length
      }

      return !!textualAnswers?.length &&
        textualAnswers.some(answer => answer?.trim() !== '')
    })
  }

  const remainTimeString = useMemo(() => {
    return formatMinutesToTime((remainTime || 0) / 60);
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
    openLeaveDialog,
    handleOpenLeaveDialog,
    handleCloseLeaveDialog,
    questionStarList,
    handleNextStar,
    handlePrevStar,
    questionListMapped,
    openResultDialog,
    questionList,
    isNotFoundExam,
    remainTimeString,
    remainTime,
    totalTimeString,
    updateQuestionAnswer,
    updateQuestionStar,
    handleFinishExam,
    getCheckStatus,
    handleRestartExam,
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handlePauseAndResumeExam,
    handleCloseResultDialog,
    handleOpenResultDialog,
    currentQuestionId,
    examSession,
    openInfoExamDialog,
    handleOpenInfoExamDialog,
    handleCloseInfoExamDialog,
    handleOpenFinishConfirmDialog,
    handleCloseFinishConfirmDialog,
    openConfirmFinishDialog,
    openAnswerSheet,
    handleOpenAnswerSheet,
    handleCloseAnswerSheet,
    isAllQuestionsAnswered,
    scrollViewRef,
    questionRefs,
    scrollToQuestion,
    liveResultDialog,
    handleExamEnd,
    handleDetailExamResult,
    handleCloseLiveResultDialog,
    handleOpenLiveResultDialog
  };
};

export default useExam;