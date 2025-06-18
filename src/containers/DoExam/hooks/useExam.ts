import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  getQuestionExam,
  finishExam
} from "../apiClients/index";
import { ExamResponse, Question, QuestionGroupResponse, QuestionResponse } from "../config/types";
import _ from "lodash";
import useExamSolving from "./useExamSolving";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { DATE_MIN_VALUE, DATE_TIME_MIN_VALUE, EXAM_CHANNEL } from "@/utils/constants";
import moment from "moment";
import { ExamEvent, ExamStatus, QuestionAnswerType } from "@/utils/enums";
import { getErrorMessage, toast } from "@/utils/helpers";
import { currentScreen, navigate } from "@/navigators/NavigationHelpers";
import useCountDownTimer from "@/hooks/useCountDownTimer";
import { PusherChannel } from "@pusher/pusher-websocket-react-native";
import { dialogConfirm } from "@/utils/helpers/dialog";
import { Routes } from "@/navigators/RouteName";
import { useFocusEffect } from "@react-navigation/native";
import { findNodeHandle, ScrollView, UIManager, View } from "react-native";

type Props = {
  examCode: string
}
const useExam = ({ examCode }: Props) => {
  const { user, setLoading, pusher, subscribeChannel, unsubscribeChannelSafe } = useAuthStore()
  const { t } = useTranslation();
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [exam, setExam] = useState<ExamResponse>();
  const firstLoadRef = useRef<boolean>(true);
  const [endExam, setEndExam] = useState<boolean>();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isEnding, setEnding] = useState<boolean>(false);
  const [isNotFoundExam, setNotFoundExam] = useState<boolean>();
  const channel = useRef<PusherChannel>();
  const channelName = useRef<string>();
  const [liveResultDialog, setLiveResultDialog] = useState(false)
  const [openResultDialog, setOpenResultDialog] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const [questionListMapped, setQuestionListMapped] = useState<QuestionGroupResponse[]>([]);
  const questionRefs = useRef<Array<View | null>>([])

  const scrollToNextQuestion = (index: number) => {
    const nextRef = questionRefs.current[index + 1]
    const scrollViewNode = scrollViewRef.current && findNodeHandle(scrollViewRef.current)

    if (nextRef && scrollViewNode) {
      toggleExpand(questionList[index + 1].id)
      setCurrentIndex(questionList[index + 1].questionOrder)
      UIManager.measureLayout(
        findNodeHandle(nextRef)!,
        scrollViewNode,
        () => {
          console.warn('MeasureLayout error')
        },
        (left, top, width, height) => {
          scrollViewRef.current?.scrollTo({ y: top - height, animated: true })
        }
      )
    }
  }

  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number | null) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        setExpandedId(null)
        getQuestionExams()
      }
    }, [])
  )

  const handleCloseResultDialog = () => {
    setOpenResultDialog(false)
  }

  const handleOpenResultDialog = () => {
    setOpenResultDialog(true)
  }

  const handleCloseLiveResultDialog = () => {
    setLiveResultDialog(false)
  }

    const handleOpenLiveResultDialog = () => {
    setLiveResultDialog(true)
  }

  const handleExamEnd = () => {
    setQuestionList([])
    handleCloseLiveResultDialog()
    handleCloseResultDialog()
    navigate(Routes.Auth.Home)
  }

  const handleDetailExamResult = () => {
    handleCloseLiveResultDialog()
    handleOpenResultDialog()
  }

  const academyDomain: string | undefined = user?.academyDomain;
  const userId: number | undefined = user?.id;

  const nav1 = useRef<any>(null);
  const nav2 = useRef<any>(null);

  const getQuestionExams = async (showErrorMessage: boolean = false) => {
    if (!examCode || !academyDomain || !userId) return;
    setEnding(false);
    setNotFoundExam(false);
    firstLoadRef.current && setLoading(true)
    try {
      const res = await getQuestionExam(examCode);
      const data = res.data?.data;
      const isCompleted = data?.isLate
        ? data?.lateStatus === ExamStatus.Completed
        : data?.status === ExamStatus.Completed;
      setExam(data);
      if (isCompleted) {
        handleTeacherFinishExam();
        setLoading(false)
        return;
      }

      const questionGroupsResponse: QuestionGroupResponse[] = data?.questionGroups || []
      const responseQuestions: QuestionResponse[] = questionGroupsResponse.reduce((acc: QuestionResponse[], item: QuestionGroupResponse) => {
        const selected = item.questions;
        return acc.concat(selected);
      }, []);;
      const questions = responseQuestions.map((i, index) => ({
        ...i,
        questionIndex: index,
        answerTime:
          i.answerTime !== DATE_MIN_VALUE && i.answerTime
            ? moment.utc(i.answerTime).valueOf()
            : 0,
      }));

      setQuestionList(questions);
      setQuestionListMapped(questionGroupsResponse)
      setEndExam(
        !!data?.finishTime && data?.finishTime !== DATE_TIME_MIN_VALUE
      );
    } catch (err) {
      (firstLoadRef.current || showErrorMessage) &&
        toast.error(getErrorMessage(t, err));
      setNotFoundExam(true);
    }
    setLoading(false)
    if (firstLoadRef.current) firstLoadRef.current = false;
  };

  const getCheckStatus = useCallback(() => {
    setEnding(true);
    setExam((state) => !state ? state : ({
      ...state,
      lateStatus: state.isLate ? ExamStatus.Completed : state.lateStatus,
      status: !state.isLate ? ExamStatus.Completed : state.status,
    }))
  }, []);

  const callFinishExam = useCallback(async () => {
    setLoading(true)
    try {
      await finishExam(examCode);
      toast.success(t("finish_exam_successful"));
      setEndExam(true);
      exam && exam.isLate && getCheckStatus();
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
      setEndExam(false);
    }
    setLoading(false)
  }, [finishExam, JSON.stringify(exam), getCheckStatus, getErrorMessage]);

  const onFishedExam = useCallback(() => {
    if (endExam) {
      return;
    }

    dialogConfirm(t, "do_you_want_to_quit_your_exam", () => setEndExam(false), () => callFinishExam())
  }, [endExam, callFinishExam]);

  const handleTeacherAddDurationExam = (data: any) => {
    const duration = data.Duration;

    setExam((state?: ExamResponse) =>
      state
        ? {
          ...state,
          duration
        }
        : undefined
    );
  };

  const handleTeacherFinishExam = (data?: any) => {
    if (data?.isDelete) {
      handleCloseLiveResultDialog()
      toast.info(t("exam_has_been_cancelled"));
      navigate(Routes.Auth.Home);
    } else getCheckStatus();
  };

  const handleUpdateQuestionList = (questions: Question[]) => {
    setQuestionList(questions);
  };

    const handleRedirectResult = useCallback(() => {
      currentScreen() === Routes.Auth.DoExam && isEnding && setLiveResultDialog(true)
  }, [isEnding, currentScreen]);

  const handleExamExamLastAnswerTime = (answerTime: string) => {
    setExam((state?: ExamResponse) => {
      if (!state) return undefined;
      return {
        ...state,
        lastAnswerTime: answerTime
      };
    });
  };
  const { updateQuestionAnswer, updateQuestionStar } = useExamSolving({
    examId: exam?.id,
    exam,
    examCode: examCode,
    questionList,
    isEnding,
    updateQuestionList: handleUpdateQuestionList,
    updateExamLastTimeAnswer: handleExamExamLastAnswerTime,
    handleExamEnded: handleRedirectResult,
  });

  useEffect(() => {
    getQuestionExams();
  }, [examCode, academyDomain, userId]);

  const handleListenerEvent = async () => {
    try {
      if (
        !pusher ||
        !exam ||
        !academyDomain
      ) return
      cleanupPusher()

      channelName.current = `${EXAM_CHANNEL}-${exam.code}-${academyDomain
        .trim()
        .toUpperCase()}`;
      const examHandlers = {
        [ExamEvent.AddExtraDuration]: handleTeacherAddDurationExam,
        [ExamEvent.TerminateExam]: handleTeacherFinishExam
      }

      channel.current = await subscribeChannel(pusher, channelName.current, Object.entries(examHandlers).map(([eventName, handler]) => ({ eventName, handler })))
    } catch (err) {
      console.error("Pusher subscription failed", err);
    }
  }

  const cleanupPusher = () => {
    if (!academyDomain || !userId || !pusher || !exam?.code) return

    if (channelName.current) {
      unsubscribeChannelSafe(pusher, channelName.current)
    }

  };

  useEffect(() => {
    const initPusher = async () => {
      await handleListenerEvent();
    };

    initPusher();

    return cleanupPusher
  }, [exam?.code, academyDomain, pusher]);

  useFocusEffect(
    useCallback(() => {
      isEnding && handleCloseLiveResultDialog()
      setExam(undefined);
      return () => {
        setExam(undefined);
        setQuestionList([])
        handleCloseLiveResultDialog()
        handleCloseResultDialog()
      };
    }, [])
  );
  
  const remainTime = useCountDownTimer({
    isEnding,
    startTime: exam?.isLate ? exam.startTimeSession : exam?.startTime,
    status: exam?.isLate ? exam.lateStatus : exam?.status,
    code: exam?.code,
    duration: exam?.duration,
    onFinish: getCheckStatus
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
    if (!exam?.duration) return "";
    const times = exam?.duration.split(":");
    const time = `${+times[0] * 60 + +times[1]}${t("minutes")}`;
    return time;
  }, [exam?.duration, t]);

  const page = questionList.length;

  return {
    t,
    page,
    nav2,
    nav1,
    exam,
    isEnding,
    examCode,
    endExam,
    currentIndex,
    expandedId,
    questionListMapped,
    toggleExpand,
    scrollViewRef,
    questionRefs,
    scrollToNextQuestion,
    openResultDialog,
    questionList,
    liveResultDialog,
    handleExamEnd,
    handleCloseResultDialog,
    handleDetailExamResult,
    handleCloseLiveResultDialog,
    isNotFoundExam,
    currentSlide,
    remainTimeString,
    remainTime,
    totalTimeString,
    updateQuestionAnswer,
    updateQuestionStar,
    onFishedExam,
    getCheckStatus,
    setCurrentSlide
  };
};

export default useExam;
