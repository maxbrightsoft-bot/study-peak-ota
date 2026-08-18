import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import {
  getQuestionsTextbookApi,
  pauseAndResumeTextbookApi,
  pauseOrFinished,
  restartTextbookApi,
  getTextbookByIdApi,
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
import { triggerOfflineSync } from '@/services/offlineSync';

type Props = {
  handleOpenDrawer?: () => void;
  textbookId?: string;
  page?: string;
  reqTime?: string
  restart?: boolean;
};

const isQuestionAnswered = (q: any) => {
  if (!q) return false;
  const hasSelected = Boolean(q.selectedAnswers && Array.isArray(q.selectedAnswers) && q.selectedAnswers.length > 0);
  const hasTextual = Boolean(q.textualAnswers && Array.isArray(q.textualAnswers) && q.textualAnswers.length > 0 && !isNull(q.textualAnswers));
  return hasSelected || hasTextual;
};

const findTargetQuestionForPageRange = (
  pageNum: number,
  questions: PreparedQuestionResponse[],
  groupList: PreparedQuestionGroupResponse[],
  textbook?: SimplePreparedTextbookResponse,
  isRestart?: boolean
): number | undefined => {
  if (!pageNum || pageNum <= 0 || !questions.length) return undefined;

  let rangeFrom = pageNum;
  let rangeTo = pageNum;

  // 1. Collect all chapter, subchapter, and group page range candidates
  const candidates: { pageFrom: number; pageTo: number }[] = [];

  textbook?.chapters?.forEach((ch) => {
    if (ch.pageFrom) {
      candidates.push({ pageFrom: ch.pageFrom, pageTo: ch.pageTo || ch.pageFrom });
    }
    ch.subChapters?.forEach((sub) => {
      if (sub.pageFrom) {
        candidates.push({ pageFrom: sub.pageFrom, pageTo: sub.pageTo || sub.pageFrom });
      }
    });
  });

  groupList.forEach((g) => {
    const pFrom = g.parentChapterPageFrom || g.chapterPageFrom || g.pageFrom;
    const pTo = g.parentChapterPageTo || g.chapterPageTo || g.pageTo || pFrom;
    if (pFrom) {
      candidates.push({ pageFrom: pFrom, pageTo: pTo || pFrom });
    }
  });

  // 2. Find matching candidate: prioritize exact pageFrom === pageNum FIRST
  let match = candidates.find((c) => c.pageFrom === pageNum);

  // If not matched by exact pageFrom, search for range where pageFrom <= pageNum && pageNum < pageTo (strict < pageTo)
  if (!match) {
    match = candidates.find((c) => c.pageFrom <= pageNum && pageNum < c.pageTo);
  }

  // Final fallback
  if (!match) {
    match = candidates.find((c) => c.pageFrom <= pageNum && pageNum <= c.pageTo);
  }

  if (match) {
    rangeFrom = match.pageFrom;
    rangeTo = match.pageTo;
  }

  // 3. Filter questions strictly falling within [rangeFrom, rangeTo]
  const rangeQuestions = questions.filter((q: any) => {
    const qPage = q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0;
    return qPage >= rangeFrom && qPage <= rangeTo;
  });

  if (rangeQuestions.length > 0) {
    if (isRestart) {
      return rangeQuestions[0].id;
    }

    const answeredPages = rangeQuestions
      .filter(isQuestionAnswered)
      .map((q: any) => q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0);

    if (answeredPages.length > 0) {
      const maxAnsweredPage = Math.max(...answeredPages);
      const forwardUnanswered = rangeQuestions.find((q: any) => {
        const qPage = q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0;
        return qPage >= maxAnsweredPage && !isQuestionAnswered(q);
      });

      if (forwardUnanswered) {
        return forwardUnanswered.id;
      }

      const anyUnanswered = rangeQuestions.find((q: any) => !isQuestionAnswered(q));
      if (anyUnanswered) {
        return anyUnanswered.id;
      }

      return rangeQuestions[rangeQuestions.length - 1].id;
    } else {
      return rangeQuestions[0].id;
    }
  }

  const questionsBefore = questions
    .filter((q: any) => (q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0) <= pageNum)
    .sort((a: any, b: any) => {
      const pA = a.pageFrom || a.chapterPageFrom || a.parentChapterPageFrom || 0;
      const pB = b.pageFrom || b.chapterPageFrom || b.parentChapterPageFrom || 0;
      return pB - pA;
    });

  if (questionsBefore.length > 0) {
    return questionsBefore[0].id;
  }

  const questionsAfter = questions
    .filter((q: any) => (q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0) >= pageNum)
    .sort((a: any, b: any) => {
      const pA = a.pageFrom || a.chapterPageFrom || a.parentChapterPageFrom || 0;
      const pB = b.pageFrom || b.chapterPageFrom || b.parentChapterPageFrom || 0;
      return pA - pB;
    });

  if (questionsAfter.length > 0) {
    return questionsAfter[0].id;
  }

  return questions[0]?.id;
};

const useTextbook = ({
  handleOpenDrawer,
  textbookId,
  page,
  reqTime,
  restart
}: Props = {}) => {
  const { t } = useTranslation();
  const { setLoading, alarm, setLoadingWithoutOverlay, isLoadingWithoutOverlay } = useAuthStore();
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
  const isJustRestartedRef = useRef<boolean>(false)
  const lastHandledPageParamRef = useRef<string | undefined>(undefined)
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

  const onScrollToIndex = useCallback((index: number) => {
    if (!questionList || !questionList[index]) return;

    if (index === 0) {
      scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
      return;
    }

    const targetQ = questionList[index];
    const groupIndex = questionGroupList.findIndex(g => g.id === targetQ.questionGroupId);

    if (groupIndex !== -1 && scrollViewRef.current) {
      try {
        scrollViewRef.current.scrollToIndex({
          index: groupIndex,
          animated: true,
          viewPosition: 0
        });
        isJustRestartedRef.current = false;
      } catch (e: any) {
        scrollViewRef.current?.scrollToOffset({ offset: groupIndex * 400, animated: true });
        isJustRestartedRef.current = false;
      }
    }

    const tryMeasure = () => {
      const ref = questionRefs.current[index];
      const scrollResponder = (scrollViewRef.current as any)?.getScrollResponder
        ? (scrollViewRef.current as any).getScrollResponder()
        : scrollViewRef.current;
      const scrollViewNode = scrollResponder ? findNodeHandle(scrollResponder) : null;

      if (ref && scrollViewNode) {
        const node = findNodeHandle(ref);
        if (node) {
          UIManager.measureLayout(
            node,
            scrollViewNode,
            () => {},
            (_left, top) => {
              if (top >= 0) {
                scrollViewRef.current?.scrollToOffset({
                  offset: Math.max(0, top - 20),
                  animated: true
                });
              }
            }
          );
          return true;
        }
      }
      return false;
    };

    setTimeout(() => {
      tryMeasure();
    }, 100);
  }, [questionList, questionGroupList]);

  useEffect(() => {
    if (!currentQuestionId || !questionList.length) return;

    const index = questionList.findIndex(q => q.id === currentQuestionId);
    if (index === -1) return;

    const timer = setTimeout(() => onScrollToIndex(index), 50);

    return () => {
      clearTimeout(timer);
    };
  }, [currentQuestionId, questionList, questionGroupList, onScrollToIndex]);

  const getQuestionsTextbook = async (showErrorMessage: boolean = false, overrideStartPage?: number) => {
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

      const questions = (data?.questionGroups || []).flatMap((group: any) =>
        (group.questions || []).map((q: any) => ({
          ...q,
          pageFrom: group.pageFrom || group.chapterPageFrom || group.parentChapterPageFrom,
          pageTo: group.pageTo || group.chapterPageTo || group.parentChapterPageTo,
          chapterPageFrom: group.chapterPageFrom,
          chapterPageTo: group.chapterPageTo,
          parentChapterPageFrom: group.parentChapterPageFrom,
          parentChapterPageTo: group.parentChapterPageTo
        }))
      ).map((i: any, index: number) => ({ ...i, questionIndex: index }));

      setQuestionGroupList(data?.questionGroups || []);
      setQuestionList(questions);

      const targetStartPage = overrideStartPage || restartTextbookData?.startPage;
      const isRestarting = isJustRestartedRef.current || !!targetStartPage;
      const targetPageNum = targetStartPage || (isRestarting ? 1 : (page ? Number(page) : 0));
      if (targetPageNum > 0) {
        const targetId = findTargetQuestionForPageRange(
          targetPageNum,
          questions,
          data?.questionGroups || [],
          responseTextbook,
          isRestarting
        );
        if (targetId) {
          setCurrentQuestionId(targetId);
        } else if (questions.length > 0) {
          setCurrentQuestionId(questions[0].id);
        }
      } else if (questions.length > 0) {
        setCurrentQuestionId(questions[0].id);
      }
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
    if (!page && !restartTextbookData?.startPage) {
      scrollViewRef.current?.scrollToOffset({
        offset: 0,
        animated: true
      });
    }
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

  const { updateQuestionAnswer, updateQuestionStar, recoverAnswers, handleResetTextbookSolving, handleClearStorage } =
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
      const pageFrom = group.parentChapterPageFrom || group.chapterPageFrom || group.pageFrom;
      const pageTo = group.parentChapterPageTo || group.chapterPageTo || group.pageTo;

      if (pageFrom) {
        const label = pageTo && pageTo > pageFrom
          ? `${pageFrom}~${pageTo}`
          : `${pageFrom}`;

        arrOptions.push({
          label,
          value: pageFrom
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
  }, [questionGroupList]);

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
      track({
        action: ActivityAction.End,
        resourceType: ActivityResource.Textbook,
        resourceId: String(textbook?.id),
        triggeredAt: new Date(nowTime).toISOString(),
        metaData: {
          textbookId: textbook?.id || '',
          studentTextbookId: textbook?.studentTextbookId
        }
      })
      navigate(Routes.Auth.Textbook);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
      trackError(error, {
        resourceType: ActivityResource.Textbook,
        triggeredAt: new Date(nowTime).toISOString(),
        resourceId: textbook?.id,
        metaData: {
          action: Object.keys(ActivityAction.End),
          textbookId: textbook?.id || '',
          studentTextbookId: String(textbook?.studentTextbookId || ''),
        }
      });
    }
    setLoading(false);
  };


  useEffect(() => {
    if (questionList.length > 0 && !page) {
      const noAnswer = questionList.find(i => i.questionAnswerType < 2 ? !i.selectedAnswers?.length : !i.textualAnswers?.length)
      setCurrentQuestionId(noAnswer?.id || questionList[0].id);
    }
  }, [questionList.length, page]);

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
          action: status === ExamStatus.Paused ? Object.keys(ActivityAction.Pause) : Object.keys(ActivityAction.Resume),
          status: textbook?.status,
          studentTextbookId: String(textbook?.studentTextbookId || ''),
        }
      });
    }
    setLoading(false);
  };

  const handleRestartTextbook = async () => {
    if (!textbook || !textbookId) return;

    handleCloseConfirmDialog();
    handleCloseRestartTextbookDialog();
    
    isJustRestartedRef.current = true;
    const nowTime = getServerNow();
    try {
      const latestRes = await getTextbookByIdApi(Number(textbookId));
      const latestData = latestRes?.data?.data;
      const freshRowVersion = latestData?.rowVersion || textbook.rowVersion;

      const startPageTarget = restartTextbookData?.startPage;
      const req: RestartTextbookRequest = {
        rowVersion: freshRowVersion,
        startPage: startPageTarget,
        endPage: restartTextbookData?.endPage
      };

      track({
        action: ActivityAction.Restart,
        resourceType: ActivityResource.Textbook,
        resourceId: String(textbook?.id),
        triggeredAt: new Date(nowTime).toISOString(),
        metaData: {
          status: textbook?.status,
          studentTextbookId: textbook?.studentTextbookId
        }
      });

      await handleClearStorage();
      handleResetTextbookSolving();
      await restartTextbookApi(Number(textbook.id), req);
      clearData(true);
      isJustRestartedRef.current = true;
      lastHandledPageParamRef.current = String(startPageTarget || 'restarted');
      try {
        (navigation as any)?.setParams?.({ page: undefined });
      } catch (e) {}
      await getQuestionsTextbook(false, startPageTarget);
      toast.info(t("textbook_has_been_restarted"));
    } catch (error) {
      toast.error(getErrorMessage(t, error));
      trackError(error, {
        resourceType: ActivityResource.Textbook,
        triggeredAt: new Date(nowTime).toISOString(),
        resourceId: textbook?.id,
        metaData: {
          action: Object.keys(ActivityAction.Restart),
          status: textbook?.status,
          studentTextbookId: String(textbook?.studentTextbookId || ''),
        }
      });
    }
  };

  const clearData = (keepLoading: boolean = false) => {
    if (!keepLoading) {
      setLoading(false);
      setLoadingWithoutOverlay(false);
    }
    isJustRestartedRef.current = false;
    lastHandledPageParamRef.current = undefined;
    setRestartTextbookData({});
    handleResetTextbookSolving();
    triggerOfflineSync();
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
      isJustRestartedRef.current = false;
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
    }, [textbookId, restart, reqTime, page])
  );

  useEffect(() => {
    if (!page || questionGroupList.length === 0 || isJustRestartedRef.current || !!restartTextbookData?.startPage) return;
    if (lastHandledPageParamRef.current === page) return;

    const pageNumber = +page;
    if (Number.isNaN(pageNumber) || pageNumber <= 0) return;

    lastHandledPageParamRef.current = page;

    let groupIndex = questionGroupList.findIndex(
      (i) =>
        i.parentChapterPageFrom === pageNumber ||
        i.chapterPageFrom === pageNumber ||
        i.pageFrom === pageNumber
    );

    if (groupIndex === -1) {
      groupIndex = questionGroupList.findIndex(
        (i) =>
          (i.pageFrom ? i.pageFrom <= pageNumber : i.chapterPageFrom <= pageNumber) &&
          (i.pageTo ? i.pageTo > pageNumber : i.chapterPageTo > pageNumber)
      );
    }

    if (groupIndex === -1) {
      groupIndex = questionGroupList.findIndex(
        (i) =>
          i.parentChapterPageFrom &&
          i.parentChapterPageTo &&
          i.parentChapterPageFrom <= pageNumber &&
          i.parentChapterPageTo >= pageNumber
      );
    }

    if (groupIndex === -1) {
      groupIndex = questionGroupList.findIndex(
        (i) => i.chapterPageFrom <= pageNumber && i.chapterPageTo >= pageNumber
      );
    }

    if (groupIndex === -1) {
      const validGroupIndices = questionGroupList
        .map((g, idx) => ({ g, idx }))
        .filter(({ g }) => (g.pageFrom && g.pageFrom <= pageNumber) || (g.chapterPageFrom && g.chapterPageFrom <= pageNumber));
      if (validGroupIndices.length > 0) {
        groupIndex = validGroupIndices.reduce((prev, curr) => {
          const prevPage = prev.g.pageFrom || prev.g.chapterPageFrom || 0;
          const currPage = curr.g.pageFrom || curr.g.chapterPageFrom || 0;
          return currPage > prevPage ? curr : prev;
        }).idx;
      } else {
        groupIndex = 0;
      }
    }

    const targetQId = findTargetQuestionForPageRange(pageNumber, questionList, questionGroupList, textbook);
    if (targetQId) {
      setCurrentQuestionId(targetQId);
      const targetIndex = questionList.findIndex(q => q.id === targetQId);
      if (targetIndex !== -1) {
        onScrollToIndex(targetIndex);
      }
    } else if (groupIndex !== -1) {
      const targetGroup = questionGroupList[groupIndex];
      if (targetGroup && targetGroup.questions && targetGroup.questions.length > 0) {
        setCurrentQuestionId(targetGroup.questions[0].id);
      }
    }
  }, [page, questionGroupList, questionList, onScrollToIndex, textbook]);

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

  const navigateToPageRange = useCallback(
    (pageNum: number) => {
      if (!pageNum || pageNum <= 0 || !questionList.length) return;
      isJustRestartedRef.current = false;
      setRestartTextbookData({});
      lastHandledPageParamRef.current = String(pageNum);
      try {
        (navigation as any)?.setParams?.({ page: undefined });
      } catch (e) {}
      const targetId = findTargetQuestionForPageRange(pageNum, questionList, questionGroupList, textbook);
      if (targetId) {
        setCurrentQuestionId(targetId);
        const targetIndex = questionList.findIndex((q) => q.id === targetId);
        if (targetIndex !== -1) {
          onScrollToIndex(targetIndex);
        }
      }
    },
    [questionList, questionGroupList, onScrollToIndex, textbook, navigation]
  );

  return {
    t,
    isLoadingWithoutOverlay,
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
    handleStopAlarm,
    onFinishedTextbook,
    completedTasks,
    openAnswerSheet,
    handleOpenAnswerSheet,
    handleCloseAnswerSheet,
    handleRestartTextbook,
    openRestartTextbookDialog,
    handleCloseRestartTextbookDialog,
    handleOpenRestartTextbookDialog,
    navigateToPageRange,
    getQuestionsTextbook,
    textbookId: textbookId,
    remainTime,
    isPaused: textbook?.status === ExamStatus.Paused,
    isCompleted: textbook?.status === ExamStatus.Completed,
    isInProgress: textbook?.status === ExamStatus.InProgress,
  };
};

export default useTextbook;
