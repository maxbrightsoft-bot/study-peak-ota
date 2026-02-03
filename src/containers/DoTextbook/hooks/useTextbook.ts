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
  SimplePreparedTextbookResponse,
} from "../config/types";
import useTextbookSolving from "./useTextbookSolving";
import { useTextbookTimer } from "./useTextbookTimer";
import { isNull } from "../config/helpers";
import { Routes } from "@/navigators/RouteName";
import { navigate } from "@/navigators/NavigationHelpers";
import { Alert, findNodeHandle, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, UIManager, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { PauseOrResumeExamRequest, RestartTextbookRequest } from "@/utils/types";
import { ExamStatus, SubjectType } from "@/utils/enums";
import moment from "moment";
import { getErrorMessage, toast } from "@/utils/helpers";
import _ from "lodash";
import useCountDownTimer from "@/hooks/useCountDownTimer";

type Props = {
  handleOpenDrawer?: () => void;
  onPauseOrResume?: () => void;
  textbookId?: string;
  page?: string;
  reqTime?: string
  restart?: boolean;
};

const useTextbook = ({
  handleOpenDrawer,
  onPauseOrResume,
  textbookId,
  page,
  reqTime,
  restart
}: Props = {}) => {
  const { t } = useTranslation();
  const { setLoading, alarm } = useAuthStore();
  const firstLoadRef = useRef<boolean>(true);
  const [textbook, setTextbook] = useState<SimplePreparedTextbookResponse>();
  const [questionGroupList, setQuestionGroupList] = useState<
    PreparedQuestionGroupResponse[]
  >([]);
  const [questionList, setQuestionList] = useState<PreparedQuestionResponse[]>(
    []
  );
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null)
  const questionRefs = useRef<Array<View | null>>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const sectionPositions = useRef<Record<number, number>>({}).current;
  const [activePage, setActivePage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isNotFoundTextbook, setNotFoundTextbook] = useState<boolean>();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [startTime, setStartTime] = useState<moment.Moment>();
  const [openRestartTextbookDialog, setOpenRestartTextbookDialog] = useState(false);
  const [restartTextbookData, setRestartTextbookData] = useState<RestartTextbookRequest>({});
  const [isOpenConfirmDialog, setOpenConfirmDialog] = useState(false);
  const pendingScrollIndex = useRef<number | null>(null);


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

  const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    sectionPositions[index] = y;
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const sortedSections = Object.entries(sectionPositions)
      .map(([index, position]) => ({
        index: parseInt(index),
        position
      }))
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < sortedSections.length; i++) {
      const currentSection = sortedSections[i];
      const nextSection = sortedSections[i + 1];

      if (offsetY >= currentSection.position &&
        (nextSection === undefined || offsetY < nextSection.position)) {
        if (activePage !== currentSection.index) {
          setActivePage(currentSection.index);
        }
        break;
      }
    }
  };

  const scrollToPage = (page: string) => {
    if (scrollViewRef.current && sectionPositions[page as any] !== undefined) {
      setActivePage(parseInt(page))
      scrollViewRef.current.scrollTo({
        y: sectionPositions[page as any],
        animated: true
      });
    }
  };

  useEffect(() => {
    if (!!page) scrollToPage(page)
  }, [page])

  const toggleExpand = (id: number | null) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

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


  const getQuestionsTextbook = async (showErrorMessage: boolean = false) => {
    if (!textbookId) return;

    setNotFoundTextbook(false);
    setLoading(true);
    setStartTime(undefined);

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
        timestamp: Date.now()
      };

      setTextbook(responseTextbook);
      setStartTime(moment());

      const questions = _.flatMap(data?.questionGroups || [], "questions").map((i, index) => ({ ...i, questionIndex: index }));
      setQuestionGroupList(data?.questionGroups || []);
      setQuestionList(questions);
    } catch (err) {
      (firstLoadRef.current || showErrorMessage) &&
        toast.error(getErrorMessage(t, err));
      setNotFoundTextbook(true);
    }

    setLoading(false);
    if (firstLoadRef.current) firstLoadRef.current = false;
  };

  const handleUpdateQuestionList = (questions: PreparedQuestionResponse[]) => {
    setQuestionList(questions);
  };

  const checkEndStatus = useCallback(() => {
    if (textbook?.isMock && handleOpenDrawer) {
      handleOpenDrawer();
    }
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
    const secondsToTimeSpan = (sec?: number) => {
      if (sec === undefined)
        return t("mins_mins_seconds_seconds", { mins: "00", seconds: "00" });
      const min = Math.floor(sec / 60);
      const seconds = sec - min * 60;
      const time = t("mins_mins_seconds_seconds", {
        mins: min.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0")
      });
      return time;
    };
    return secondsToTimeSpan(
      remainTime !== undefined && remainTime < 0 ? 0 : remainTime
    );
  }, [remainTime, t]);

  const totalTimeString = useMemo(() => {
    if (!textbook?.duration) return "";
    return `${textbook.duration}${t("minutes")}`;
  }, [textbook?.duration, t]);

  const totalAnswerTime = textbook?.totalAnswerTime ?? 0;

  const { formattedTime } = useTextbookTimer({
    startTime,
    studyTime: totalAnswerTime,
    textbookId: Number(textbookId)
  });

  const { updateQuestionAnswer, updateQuestionStar, recoverAnswers } =
    useTextbookSolving({
      startTime,
      textbook: textbook,
      textbookId: Number(textbookId),
      updateTextbook: setTextbook,
      questionList,
      updateQuestionList: handleUpdateQuestionList,
    });

  const questionPage = questionGroupList.length;

  const totalTasks = questionList.length;

  useEffect(() => {
    const completedTasksCount = questionList.filter(
      (q) => q.selectedAnswers?.length || !isNull(q.textualAnswers)
    ).length;
    setCompletedTasks(completedTasksCount);
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

    return arrOptions.filter((option) => {
      if (!obj[option.label]) {
        obj[option.label] = 1;
        return true;
      }
      return false;
    });
  }, [questionGroupList, t]);

  const onFinishedTextbook = async () => {
    if (!textbook || !textbookId) return;

    setLoading(true);
    try {
      const nowTime = new Date().toISOString();
      const req: ChangeAnswerTimeRequest = {
        stopTime: nowTime
      };
      await recoverAnswers();
      await pauseOrFinished(Number(textbookId), req);
      navigate(Routes.Auth.Home);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false);
  };

  const handlePauseAndResumeTextbook = async (status: ExamStatus) => {
    if (!textbook || !textbookId) return;

    setLoading(true);
    try {
      const nowTime = Date.now();
      const req: PauseOrResumeExamRequest = {
        rowVersion: textbook.rowVersion,
        status,
        pauseTime: nowTime
      };
      const res = await pauseAndResumeTextbookApi(Number(textbook.id), req);

      if (onPauseOrResume && alarm?.subject?.id === textbook.subject.id && alarm?.duration === textbook.duration * 60000){
        onPauseOrResume()
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
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false);
  };

  const handleRestartTextbook = async () => {
    if (!textbook || !textbookId) return;

    setLoading(true);
    try {
      const req: RestartTextbookRequest = {
        rowVersion: textbook.rowVersion,
        startPage: restartTextbookData?.startPage,
        endPage: restartTextbookData?.endPage
      };
      await restartTextbookApi(Number(textbook.id), req);
      getQuestionsTextbook();
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false);
    handleCloseConfirmDialog();
  };

  useEffect(() => {
    if (!textbookId) return;
    getQuestionsTextbook();
  }, [textbookId, restart, reqTime]);

  useFocusEffect(
    useCallback(() => {
      scrollViewRef?.current?.scrollTo({ y: 0 });
      setExpandedId(null)

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
    currentIndex,
    expandedId,
    toggleExpand,
    questionRefs,
    scrollViewRef,
    questionGroupList,
    questionPage,
    textbook,
    handleLayout,
    activePage,
    handleScroll,
    setCurrentIndex,
    scrollToNextQuestion,
    currentSlide,
    setCurrentSlide,
    updateQuestionAnswer,
    updateQuestionStar,
    nav1,
    nav2,
    questionList,
    remainTimeString,
    totalTimeString,
    startPageOptions,
    isNotFoundTextbook,
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handlePauseAndResumeTextbook,
    formattedTime,
    totalTasks,
    completedTasks,
    onFinishedTextbook,
    handleQuestionLayout,
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