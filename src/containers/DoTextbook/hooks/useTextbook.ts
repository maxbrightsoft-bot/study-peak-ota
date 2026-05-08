import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import {
  getQuestionsTextbookApi,
  pauseAndResumeTextbookApi,
  pauseOrFinished,
  restartTextbookApi,
} from "../apiClients";
import {
  ChangeAnswerTimeRequest,
  PreparedQuestionGroupResponse,
  PreparedQuestionResponse,
  ScrollType,
  SimplePreparedTextbookResponse,
} from "../config/types";
import useTextbookSolving from "./useTextbookSolving";
import { useTextbookTimer } from "./useTextbookTimer";
import { isNull } from "../config/helpers";
import { Routes } from "@/navigators/RouteName";
import { navigate } from "@/navigators/NavigationHelpers";
import { Alert, findNodeHandle, FlatList, UIManager, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { PauseOrResumeExamRequest, RestartTextbookRequest } from "@/utils/types";
import { ActivityAction, ActivityResource, AppScreen, ExamStatus, SubjectType } from "@/utils/enums";
import moment from "moment";
import { formatMinutesToTime, getErrorMessage, toast } from "@/utils/helpers";
import _ from "lodash";
import useCountDownTimer from "@/hooks/useCountDownTimer";
import useTimers from "@/layouts/hooks/useTimer";
import useAlarm from "@/layouts/hooks/useAlarm";
import useServerTime from "@/hooks/useServerTime";
import { useKeepAwake } from 'expo-keep-awake';
import { useActivityTracking } from "@/hooks/useActivityTracking";

type Props = {
  handleOpenDrawer?: () => void;
  textbookId?: string;
  page?: string;
  reqTime?: string
  restart?: boolean;
};

const useTextbook = ({
  handleOpenDrawer,
  textbookId,
  reqTime,
  restart
}: Props = {}) => {
  const { t } = useTranslation();
  const { setLoading, alarm, setLoadingWithoutOverlay } = useAuthStore();
  const firstLoadRef = useRef<boolean>(true);
  const [textbook, setTextbook] = useState<SimplePreparedTextbookResponse>();
  const [questionGroupList, setQuestionGroupList] = useState<
    PreparedQuestionGroupResponse[]
  >([]);
  const [questionList, setQuestionList] = useState<PreparedQuestionResponse[]>(
    []
  );
  const navigation = useNavigation();
  const scrollViewRef = useRef<FlatList>(null)
  const questionRefs = useRef<Array<View | null>>([])
  const [isNotFoundTextbook, setNotFoundTextbook] = useState<boolean>();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [startTime, setStartTime] = useState<moment.Moment>();
  const [currentQuestionId, setCurrentQuestionId] = useState<number>();
  const [openRestartTextbookDialog, setOpenRestartTextbookDialog] = useState(false);
  const [restartTextbookData, setRestartTextbookData] = useState<RestartTextbookRequest>({});
  const [isOpenConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAnswerSheet, setOpenAnswerSheet] = useState(false);
  const [openTimerDialog, setOpenTimerDialog] = useState<boolean>(false)
  const [openLeaveDialog, setOpenLeaveDialog] = useState<boolean>(false)
  const [openExpiredQuestionDialog, setOpenExpiredQuestionDialog] = useState<boolean>(false)
  const [openTextbookResultDialog, setOpenTextbookResultDialog] = useState(false)
  const { getServerNow } = useServerTime();
  const handleTimerDialogToggle = useCallback(() => {
    setOpenTimerDialog(state => !state)
  }, [])

  const {
    timers,
    studyTimerProps,
    timeUpdateDialogProps,
    isTimerRunning,
  } = useTimers(openTimerDialog, handleTimerDialogToggle)

  const {
    audioGuideModalProps,
    isAlarmRunning,
    speaker,
    disabledSpeaker,
    audioPopupProps,
    handleToggleSpeaker,
    alarmClockProps,
    handleStopAlarm,
    handleStartSelectedSubjectAlarm
  } = useAlarm(openTimerDialog, timers)
  const { track, trackError } = useActivityTracking({ screen: AppScreen.DoTextbook })
  useKeepAwake();

  const handleCloseTextbookResultDialog = useCallback(() => {
    setOpenTextbookResultDialog(false)
  }, [])

  const handleOpenTextbookResultDialog = useCallback(() => {
    handleCloseExpiredQuestionDialog()
    setOpenTextbookResultDialog(true)
  }, [])

  const handleCloseExpiredQuestionDialog = useCallback(() => {
    setOpenExpiredQuestionDialog(false)
  }, [])

  const handleOpenExpiredQuestionDialog = useCallback(() => {
    setOpenExpiredQuestionDialog(true)
  }, [])

  const handleOpenLeaveDialog = useCallback(() => {
    setOpenLeaveDialog(true)
  }, [])

  const handleCloseLeaveDialog = useCallback(() => {
    setOpenLeaveDialog(false)
  }, [])

  const handleOpenAnswerSheet = useCallback((id?: number) => {
    id && setCurrentQuestionId(id);
    setOpenAnswerSheet(true);
  }, [])

  const handleCloseAnswerSheet = useCallback(() => {
    setOpenAnswerSheet(false);
  }, [])


  const nav1 = useRef<any>(null);
  const nav2 = useRef<any>(null);

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleOpenConfirmDialog = (data?: RestartTextbookRequest) => {
    data && setRestartTextbookData(data);
    setOpenConfirmDialog(true);
  };

  const handleCloseRestartTextbookDialog = () => {
    setOpenRestartTextbookDialog(false);
  };

  const handleOpenRestartTextbookDialog = () => {
    setOpenRestartTextbookDialog(true);
  };

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
    if (!currentQuestionId) return

    const index = questionList.findIndex(
      q => q.id === currentQuestionId
    )

    if (index === -1) return

    requestAnimationFrame(() => onScrollToIndex(index))
  }, [currentQuestionId])

  const getQuestionsTextbook = async (showErrorMessage: boolean = false) => {
    if (!textbookId) return;

    setNotFoundTextbook(false);
    setLoadingWithoutOverlay(true);
    setStartTime(undefined);
    const nowTime = getServerNow();

    try {
      const res = await getQuestionsTextbookApi(Number(textbookId));
      const data = res.data?.data;

      const responseTextbook: SimplePreparedTextbookResponse = {
        id: data?.id ?? 0,
        studentTextbookId: data?.studentTextbookId ?? 0,
        name: data?.name ?? "",
        lastAnswerTime: data?.lastAnswerTime ?? new Date(0).toISOString(),
        lastPausedAt: data?.lastPausedAt ?? new Date(0).toISOString(),
        lastResumedAt: data?.lastResumedAt ?? new Date(0).toISOString(),
        lastPausedTime: data?.LastPausedTime ?? new Date(0).toISOString(),
        lastResumedTime: data?.LastResumedTime ?? new Date(0).toISOString(),
        totalPausedTime: data?.totalPausedTime ?? 0,
        startTime: data?.startTime ?? new Date(0).toISOString(),
        totalAnswerTime: data?.totalAnswerTime ?? 0,
        stopTime: data?.stopTime ?? new Date(0).toISOString(),
        type: data?.type ?? SubjectType.Default,
        duration: data?.duration,
        isMock: data?.isMock,
        status: data?.status,
        subject: data?.subject,
        rowVersion: data?.rowVersion,
        timestamp: nowTime
      };

      setTextbook(responseTextbook);
      setStartTime(moment(getServerNow()));

      const questions = _.flatMap(data?.questionGroups || [], "questions").map((i, index) => ({ ...i, questionIndex: index }));
      setQuestionGroupList(data?.questionGroups || []);
      setQuestionList(questions);
    } catch (err) {
      (firstLoadRef.current || showErrorMessage) &&
        toast.error(getErrorMessage(t, err));
      setNotFoundTextbook(true);
      trackError(err, {
        resourceType: ActivityResource.Textbook,
        triggeredAt: new Date(nowTime).toISOString(),
        resourceId: textbook?.id,
        metaData: {
          textbookId: textbook?.id || '',
          studentTextbookId: String(textbook?.studentTextbookId || ''),
        }
      });
    }

    setLoadingWithoutOverlay(false);
    scrollViewRef.current?.scrollToOffset({
      offset: 0,
      animated: true
    })
    if (firstLoadRef.current) firstLoadRef.current = false;
  };

  const handleUpdateQuestionList = (questions: PreparedQuestionResponse[]) => {
    setQuestionList(questions);
  };

  const checkEndStatus = useCallback(() => {
    if (textbook?.isMock && handleOpenDrawer) {
      handleOpenDrawer();
    }
    handleStopAlarm()
    setTextbook(state => !state ? state : ({
      ...state,
      status: ExamStatus.Completed
    }));
  }, [handleOpenDrawer, textbook?.isMock]);

  const remainTime = useCountDownTimer({
    lastResumedAt: textbook?.lastResumedAt,
    lastResumedTime: textbook?.lastResumedTime,
    totalPausedTime: textbook?.totalPausedTime,
    lastPausedAt: textbook?.lastPausedAt,
    lastPausedTime: textbook?.lastPausedTime,
    startTime: textbook?.startTime,
    status: textbook?.status,
    duration: (textbook?.duration || 0) * 60,
    textbookId: textbook?.id,
    onFinish: checkEndStatus
  });

  const remainTimeString = useMemo(() => {
    return formatMinutesToTime((remainTime || 0) / 60);
  }, [remainTime, t]);

  const totalTimeString = useMemo(() => {
    if (!textbook?.duration) return "";
    return `${textbook.duration}${t("minutes")}`;
  }, [textbook?.duration, t]);

  const totalAnswerTime = textbook?.totalAnswerTime ?? 0;

  const { formattedTime } = useTextbookTimer({
    startTime,
    studyTime: totalAnswerTime,
    textbookId: Number(textbookId),
    status: textbook?.status
  });

  const { updateQuestionAnswer, updateQuestionStar, recoverAnswers, handleResetTextbookSolving } =
    useTextbookSolving({
      startTime,
      textbook: textbook,
      textbookId: Number(textbookId),
      updateTextbook: setTextbook,
      questionList,
      updateQuestionList: handleUpdateQuestionList,
      handleNextQuestion
    });

  const questionPage = questionGroupList.length;

  const totalTasks = questionList.length;

  const completedTasks = useMemo(() => {
    return questionList.filter(
      (q) => q.selectedAnswers?.length || !isNull(q.textualAnswers)
    ).length;
  }, [questionList]);

  const startPageOptions = useMemo(() => {
    const arrOptions: { label: string; value: number }[] = [];
    const obj: any = {};

    questionGroupList.forEach((group) => {
      if (group.pageFrom) {
        arrOptions.push({
          label: t("page_number", { number: group.pageFrom }),
          value: group.pageFrom
        });
      }
      if (group.chapterPageFrom) {
        arrOptions.push({
          label: t("page_number", { number: group.chapterPageFrom }),
          value: group.chapterPageFrom
        });
      }
      if (group.parentChapterPageFrom) {
        arrOptions.push({
          label: t("page_number", { number: group.parentChapterPageFrom }),
          value: group.parentChapterPageFrom
        });
      }
    });

    return arrOptions
      .filter((option) => {
        if (!obj[option.label]) {
          obj[option.label] = 1;
          return true;
        }
        return false;
      })
      .sort((a, b) => a.value - b.value);
  }, [questionGroupList, t]);

  const onFinishedTextbook = async () => {
    if (!textbook || !textbookId) return;

    setLoading(true);
    const nowTime = new Date(getServerNow()).toISOString();
    try {
      const req: ChangeAnswerTimeRequest = {
        stopTime: nowTime
      };
      await recoverAnswers();
      await pauseOrFinished(Number(textbookId), req);
      await handleStopAlarm()
      handleCloseLeaveDialog()
      navigate(Routes.Auth.Textbook);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
      trackError(error, {
        resourceType: ActivityResource.Textbook,
        triggeredAt: new Date(nowTime).toISOString(),
        resourceId: textbook?.id,
        metaData: {
          textbookId: textbook?.id || '',
          studentTextbookId: String(textbook?.studentTextbookId || ''),
        }
      });
    }
    setLoading(false);
  };


  useEffect(() => {
    if (questionList.length > 0) {
      const noAnswer = questionList.find(i => i.questionAnswerType < 2 ? !i.selectedAnswers?.length : !i.textualAnswers?.length)
      setCurrentQuestionId(noAnswer?.id || questionList[0].id);
    }
  }, [questionList.length]);

  const handlePauseAndResumeTextbook = async (status: ExamStatus) => {
    if (!textbook || !textbookId) return;

    setLoading(true);
    const nowTime = getServerNow();
    try {
      const req: PauseOrResumeExamRequest = {
        rowVersion: textbook.rowVersion,
        status,
        pauseTime: nowTime
      };

      const res = await pauseAndResumeTextbookApi(Number(textbook.id), req);

      if (alarmClockProps.panelProps.onPauseOrResume && alarm?.subject?.id === textbook.subject.id && alarm?.duration === textbook.duration * 60000) {
        alarmClockProps.panelProps.onPauseOrResume()
      }
      const data = res.data;

      setTextbook((prev) => {
        if (!prev) return undefined;
        return ({
          ...prev,
          status: data?.status,
          totalPausedTime: data?.totalPausedTime,
          startTime: data?.startTime,
          lastPausedAt: data?.lastPausedAt,
          lastResumedAt: data?.lastResumedAt,
          rowVersion: data?.rowVersion
        });
      });
      track({
        action: status === ExamStatus.Paused ? ActivityAction.Pause : ActivityAction.Resume,
        resourceType: ActivityResource.Textbook,
        resourceId: String(textbook?.id),
        triggeredAt: new Date(nowTime).toISOString(),
        metaData: {
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId
        }
      })
      toast.info(t(status === ExamStatus.Paused ? "textbook_has_been_paused" : "textbook_has_been_resumed"));
    } catch (error) {
      toast.error(getErrorMessage(t, error));
      trackError(error, {
        resourceType: ActivityResource.Textbook,
        triggeredAt: new Date(nowTime).toISOString(),
        resourceId: textbook?.id,
        metaData: {
          studentTextbookId: String(textbook?.studentTextbookId || ''),
        }
      });
    }
    setLoading(false);
  };

  const handleRestartTextbook = async () => {
    if (!textbook || !textbookId) return;

    setLoadingWithoutOverlay(true);
    const nowTime = getServerNow();
    try {
      const req: RestartTextbookRequest = {
        rowVersion: textbook.rowVersion,
        startPage: restartTextbookData?.startPage,
        endPage: restartTextbookData?.endPage
      };

      console.log({ req });
      

      track({
        action: ActivityAction.Restart,
        resourceType: ActivityResource.Textbook,
        resourceId: String(textbook?.id),
        triggeredAt: new Date(nowTime).toISOString(),
        metaData: {
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId
        }
      })

      handleResetTextbookSolving();
      await restartTextbookApi(Number(textbook.id), req);
      getQuestionsTextbook();
      toast.info(t("textbook_has_been_restarted"));
    } catch (error) {
      toast.error(getErrorMessage(t, error));
      trackError(error, {
        resourceType: ActivityResource.Textbook,
        triggeredAt: new Date(nowTime).toISOString(),
        resourceId: textbook?.id,
        metaData: {
          studentTextbookId: String(textbook?.studentTextbookId || ''),
        }
      });
    }
    setLoadingWithoutOverlay(false);
    handleCloseConfirmDialog();
  };

  const clearData = () => {
    handleResetTextbookSolving();
    setTextbook(undefined);
    setQuestionList([]);
    handleCloseExpiredQuestionDialog()
    setQuestionGroupList([]);
    setCurrentQuestionId(undefined);
    setStartTime(undefined);
    setOpenAnswerSheet(false);
    setOpenConfirmDialog(false);
    handleCloseLeaveDialog()
    handleCloseConfirmDialog()
    setOpenRestartTextbookDialog(false);
    setOpenTimerDialog(false);
    questionRefs.current = [];
    scrollViewRef.current?.scrollToOffset({
      offset: 0,
      animated: true
    })
    toast.dismiss()
  }

  useFocusEffect(
    useCallback(() => {
      if (!textbookId) return;
      const nowTime = getServerNow();

      getQuestionsTextbook();
      track({
        action: ActivityAction.Start,
        resourceType: ActivityResource.Textbook,
        resourceId: String(textbookId),
        triggeredAt: new Date(nowTime).toISOString(),
        metaData: {
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId
        }
      })
      return () => {
        clearData()
      }
    }, [textbookId, restart, reqTime])
  );

  // useEffect(() => {
  //   if (!page || questionGroupList.length === 0) return;

  //   const pageNumber = +page;
  //   if (Number.isNaN(pageNumber)) return;

  //   let index = questionGroupList.findIndex(
  //     (i) =>
  //       (i.pageFrom ? i.pageFrom <= pageNumber : i.chapterPageFrom <= pageNumber) &&
  //       (i.pageTo ? i.pageTo >= pageNumber : i.chapterPageTo >= pageNumber)
  //   );

  //   if (index === -1) {
  //     index = questionGroupList.findIndex(
  //       (i) =>
  //         i.parentChapterPageFrom &&
  //         i.parentChapterPageTo &&
  //         i.parentChapterPageFrom <= pageNumber &&
  //         i.parentChapterPageTo >= pageNumber
  //     );
  //   }

  //   if (index === -1) {
  //     index = questionGroupList.findIndex(
  //       (i) => i.chapterPageFrom <= pageNumber && i.chapterPageTo >= pageNumber
  //     );
  //   }

  //   const slideIndex = index === -1 ? 0 : index;
  //   nav2.current?.slickGoTo?.(slideIndex);
  //   nav1.current?.slickGoTo?.(slideIndex);
  //   setCurrentSlide(slideIndex);
  // }, [page, questionGroupList]);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (textbook?.status !== ExamStatus.InProgress) return;

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
  }, [navigation, textbook?.status, t]);

  return {
    t,
    currentQuestionId,
    questionRefs,
    scrollViewRef,
    questionGroupList,
    questionPage,
    textbook,
    currentSlide,
    setCurrentSlide,
    updateQuestionAnswer,
    updateQuestionStar,
    nav1,
    nav2,
    openTextbookResultDialog,
    handleCloseTextbookResultDialog,
    handleOpenTextbookResultDialog,
    questionList,
    openExpiredQuestionDialog,
    handleCloseExpiredQuestionDialog,
    handleOpenExpiredQuestionDialog,
    remainTimeString,
    scrollToQuestion,
    totalTimeString,
    startPageOptions,
    isNotFoundTextbook,
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handlePauseAndResumeTextbook,
    formattedTime,
    totalTasks,
    speaker,
    disabledSpeaker,
    openTimerDialog,
    questionStarList,
    handleNextStar,
    handlePrevStar,
    audioPopupProps,
    openLeaveDialog,
    handleCloseLeaveDialog,
    handleOpenLeaveDialog,
    handleTimerDialogToggle,
    alarmClockProps,
    audioGuideModalProps,
    isAlarmRunning,
    isTimerRunning,
    studyTimerProps,
    timeUpdateDialogProps,
    handleToggleSpeaker,
    handleStartSelectedSubjectAlarm,
    openAnswerSheet,
    handleOpenAnswerSheet,
    handleCloseAnswerSheet,
    completedTasks,
    onFinishedTextbook,
    handleRestartTextbook,
    openRestartTextbookDialog,
    handleCloseRestartTextbookDialog,
    handleOpenRestartTextbookDialog,
    getQuestionsTextbook,
    textbookId: textbookId,
    remainTime,
    isPaused: textbook?.status === ExamStatus.Paused,
    isCompleted: textbook?.status === ExamStatus.Completed,
    isInProgress: textbook?.status === ExamStatus.InProgress,
  };
};

export default useTextbook;
