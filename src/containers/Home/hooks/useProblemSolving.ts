import { useCallback, useEffect, useRef, useState } from "react";
import { apiJoinExam, getInfoAcademyApi } from "../apiClients/index";
import { EVENT_DELETED_MEMBER, ExamStatus, FormatDate } from "../configs/constants";
import { InfoLesson } from "../configs/type";
import { getScheduleCountApi } from "../apiClients/scheduleService";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { navigate } from "@/navigators/NavigationHelpers";
import { getErrorMessage, toast } from "@/utils/helpers";
import { ExamEvent } from "@/utils/enums/exam";
import { PusherChannel } from "@pusher/pusher-websocket-react-native";
import { EXAM_CHANNEL, EXAM_STUDENT_CHANNEL } from "@/utils/constants";
import { Routes } from "@/navigators/RouteName";
import { Textbook } from "@/utils/types";
import { useFocusEffect } from "@react-navigation/native";
import { startTextbook } from "@/containers/Textbook/apiClients/textbookService";
import { AlarmType } from "@/utils/enums";
import useAlarm from "@/layouts/hooks/useAlarm";

const useProblemSolving = () => {
  const { user, selectedAcademy: academy, setLoading, pusher, subscribeChannel, unsubscribeChannelSafe } = useAuthStore()
  const [open, setOpen] = useState<boolean>(false);
  const [codeExam, setCodeExam] = useState<string>("");
  const [isCheckTeacherStart, setIsCheckTeacherStart] =
    useState<boolean>(false);
  const { t } = useTranslation();
  const userId = user?.id
  const channel = useRef<PusherChannel>();
  const channelName = useRef<string>()
  const studentChannel = useRef<PusherChannel>();
  const studentChannelName = useRef<string>();
  const [isLoadingCodeExam, setLoadingCodeExam] = useState(false)
  const isBelongAcademy = !!user && user.academyDomain && !user.isLearningSpace;
  const [selectedDate, setSelectedDate] = useState<{
    startDate: string;
    endDate: string;
    currentDate: string;
    isTotalMonth: boolean;
  }>({
    startDate: moment().startOf("M").startOf("D").toISOString(),
    endDate: moment().endOf("M").endOf("D").toISOString(),
    currentDate: moment().toISOString(),
    isTotalMonth: false
  });
  const [scheduleCount, setScheduleCount] = useState<{
    totalSchedules: number;
    totalCompletedSchedules: number;
  }>();
  const [infoLesson, setInfoLesson] = useState<InfoLesson>({
    totalCheckedInLessons: 0,
    totalLessons: 0
  });
  const [isOpenTextbookResult, setOpenTextbookResult] = useState(false)
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook>()
  const [isOpenAudioGuide, setOpenAudioGuide] =
    useState<boolean>(false);
  const { alarmClockProps: { panelProps: { onStart } } } = useAlarm(false, [], true)

  const academyDomain = user?.academyDomain

  const handleSelectDate = ({
    startDate,
    endDate,
    currentDate,
    isTotalMonth = false
  }: {
    startDate: string;
    endDate: string;
    currentDate: string;
    isTotalMonth?: boolean;
  }) => {
    setSelectedDate({ startDate, endDate, currentDate, isTotalMonth });
  };

  const handleOpenTextbookResult = (textbook?: Textbook) => {
    if (textbook) setSelectedTextbook(textbook)
    setOpenTextbookResult(true)
  }

  const handleCloseTextbookResult = () => {
    setOpenTextbookResult(false)
  }

  const handleOpenAudioGuide = () => {
    handleCloseTextbookResult()
    setOpenAudioGuide(true)
  }
  const handleCloseAudioGuide = () => {
    setOpenAudioGuide(false)
  }

  const openCloseModal = () => {
    setCodeExam("");
    setOpen(!open);
    setIsCheckTeacherStart(false);
  };

  const callApiCheckExam = async (code: string) => {
    try {
      const res = await apiJoinExam(code);
      let status = res.data?.data?.status;
      const lateStatus = res.data?.data?.lateStatus;
      if (!status) status = lateStatus;
      if (status === ExamStatus.Pending) {
        setIsCheckTeacherStart(true);
      } else {
        navigate(Routes.Auth.DoExam, { examCode: code });
      }
    } catch (error: any) {
      console.log({ error });
      toast.error(getErrorMessage(t, error));
    }
  };

  const handleCodeExam = async (code: string) => {
    setLoadingCodeExam(true)
    try {
      await callApiCheckExam(code);
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingCodeExam(false)
  };

  const handleGetInfoLesson = async (isLoading: boolean = true) => {
    const todayStart = moment().startOf("day").utc().format(FormatDate);
    const todayEnd = moment().endOf("day").utc().format(FormatDate);
    isLoading && setLoading(true)
    try {
      const res = await getInfoAcademyApi(todayStart, todayEnd);
      setInfoLesson(res.data);
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    isLoading && setLoading(false)
  };

  const handleTeacherKickStudent = () => {
    toast.error(t("you_has_been_kicked_out"));
    openCloseModal();
  };

  const handleTeacherStartExam = (data: any) => {
    if (data.Status === ExamStatus.Pending) {
      setIsCheckTeacherStart(true);
    } else if (data.Status === ExamStatus.InProgress) {
      navigate(Routes.Auth.DoExam, { examCode: codeExam });
    } else if (data.Status === ExamStatus.Completed) {
      navigate(Routes.Auth.ExamResult, { examCode: codeExam });
    }
  };

  const handleUnload = function (event: any) {
    event.preventDefault();
    event.returnValue = "";
  };

  const handleMemberRemoved = (member: any) => {
    const isCheckTeacherOut =
      member?.id && member?.info && member.info.isTeacher;
    if (isCheckTeacherOut) {
      toast.warning(t("the_teacher_has_closed_or_deleted_the_exam"));
      setIsCheckTeacherStart(false);
    }
  };

  // const cleanupPusher = () => {
  //   if (!academyDomain || !userId || !pusher) return
  //   if (studentChannelName.current) {
  //     unsubscribeChannelSafe(pusher, studentChannelName.current)
  //   }
  //   if (channelName.current) {
  //     unsubscribeChannelSafe(pusher, channelName.current)
  //   }

  //   // isCheckTeacherStart &&
  //   //   codeExam &&
  //   //   window.removeEventListener("beforeunload", handleUnload);
  // };

  const handleGetScheduleCount = async () => {
    try {
      const { data } = await getScheduleCountApi({
        startDate: moment().startOf("D").toISOString(),
        endDate: moment().endOf("D").toISOString()
      });
      setScheduleCount(data);
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
  };

  useEffect(() => {
    handleGetScheduleCount();
  }, [user?.id, user?.academyDomain, user?.isLearningSpace]);

  const handleListenerEvent = async () => {
    try {
      if (
        !codeExam ||
        !isCheckTeacherStart ||
        !open ||
        !academyDomain ||
        !userId ||
        !pusher
      ) return
      // cleanupPusher()

      const examHandlers = {
        [ExamEvent.StartExam]: handleTeacherStartExam,
        [EVENT_DELETED_MEMBER]: handleMemberRemoved,
      };

      const studentExamHandlers = {
        [ExamEvent.TeacherKickOutStudent]: handleTeacherKickStudent,
      };
      channelName.current = `${EXAM_CHANNEL}-${codeExam}-${academyDomain
        .trim()
        .toUpperCase()}`;
      studentChannelName.current = EXAM_STUDENT_CHANNEL.replace(
        "{examCode}",
        `${codeExam}-${academyDomain.trim().toUpperCase()}`
      ).replace("{studentId}", userId.toString());

      channel.current = await subscribeChannel(pusher, channelName.current, Object.entries(examHandlers).map(([eventName, handler]) => ({ eventName, handler })))

      studentChannel.current = await subscribeChannel(pusher, studentChannelName.current, Object.entries(studentExamHandlers).map(([eventName, handler]) => ({ eventName, handler })))
    } catch (err) {
      console.error("Pusher subscription failed", err);
    }
  }

  const handleStartAudio = async (textbook: Textbook) => {
    onStart(AlarmType.Subject, textbook.limitedTimeInMinutes, textbook.subject as any, true)
  }

  const handleStartTextbook = async (enable: boolean, textbook: Textbook) => {
    try {
      setLoading(true)
      await startTextbook(textbook.id)
      if (enable)
        await handleStartAudio(textbook)
      handleCloseAudioGuide()
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      navigate(Routes.Auth.DoTextbook, { textbookId: selectedTextbook?.id, restart: true })
      setLoading(false)
    }
  }


  const handleStartTextbookFromGuideModal = (enable: boolean) => {
    if (!selectedTextbook) return
    handleStartTextbook(enable, selectedTextbook)
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedTextbook(undefined)
        handleCloseTextbookResult()
        setOpen(false)
      };
    }, [])
  );

  useEffect(() => {
    const initPusher = async () => {
      await handleListenerEvent();
    };

    initPusher()

    // return cleanupPusher;
  }, [
    pusher,
    open,
    codeExam,
    isCheckTeacherStart,
    userId,
    academyDomain,
  ]);

  const handleUpdateAttendance = (data: string) => {
    const item = JSON.parse(data);
    if (!item) return;
    setInfoLesson((state) => ({
      totalCheckedInLessons: state.totalCheckedInLessons + (item.status === 0 ? 0 : item.status !== 1 ? 1 : -1),
      totalLessons: state.totalLessons
    }));
  };

  useEffect(() => {
    if (!academy?.id) return;
    handleGetInfoLesson();
  }, [academy?.id]);

  return {
    t,
    open,
    isLoadingCodeExam,
    openCloseModal,
    handleCodeExam,
    codeExam,
    selectedDate,
    handleSelectDate,
    setCodeExam,
    isCheckTeacherStart,
    selectedTextbook,
    isOpenAudioGuide,
    handleOpenAudioGuide,
    handleCloseAudioGuide,
    isOpenTextbookResult,
    handleCloseTextbookResult,
    handleOpenTextbookResult,
    academyInfo: { academy, scheduleInfo: scheduleCount, infoLesson },
    isBelongAcademy,
    handleGetScheduleCount,
    handleUpdateAttendance,
    handleStartTextbookFromGuideModal
  };
};

export default useProblemSolving;
