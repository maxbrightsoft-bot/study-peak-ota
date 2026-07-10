import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiJoinExam, getCheckInLessonsApi, getExamInfoApi } from "../apiClients/index";
import { EVENT_DELETED_MEMBER, ExamStatus } from "../configs/constants";
import { InfoLesson, ScheduleResponse, ScheduleSortBy, ScheduleStatus, ScheduleStatusRequest, ScheduleType } from "../configs/type";
import { getScheduleCountApi, getSchedulesApi, updateScheduleStatusApi } from "../apiClients/scheduleService";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { navigate } from "@/navigators/NavigationHelpers";
import { getErrorMessage, timeSpanToLocalMoment, toast } from "@/utils/helpers";
import { ExamEvent } from "@/utils/enums/exam";
import { PusherChannel } from "@pusher/pusher-websocket-react-native";
import { EXAM_CHANNEL, EXAM_STUDENT_CHANNEL } from "@/utils/constants";
import { Routes } from "@/navigators/RouteName";
import { InfoExamSessionByCode, Textbook } from "@/utils/types";
import { useFocusEffect } from "@react-navigation/native";
import { startTextbook } from "@/containers/Textbook/apiClients/textbookService";
import { AlarmType, OrderBy } from "@/utils/enums";
import useAlarm from "@/layouts/hooks/useAlarm";
import { ScrollView } from "react-native";

const useProblemSolving = () => {
  const user = useAuthStore(state => state.user)
  const academy = useAuthStore(state => state.selectedAcademy)
  const isDemoMode = useAuthStore(state => state.isDemoMode)
  const setLoading = useAuthStore(state => state.setLoading)
  const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
  const pusher = useAuthStore(state => state.pusher)
  const subscribeChannel = useAuthStore(state => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore(state => state.unsubscribeChannelSafe)

  const [open, setOpen] = useState<boolean>(false);
  const [openSchedule, setOpenSchedule] = useState<boolean>(false);
  const [codeExam, setCodeExam] = useState<string>("");
  const [isCheckTeacherStart, setIsCheckTeacherStart] =
    useState<boolean>(false);
  const { t } = useTranslation();
  const userId = user?.id
  const channel = useRef<PusherChannel>(null);
  const channelName = useRef<string>(null)
  const studentChannel = useRef<PusherChannel>(null);
  const studentChannelName = useRef<string>(null);
  const isBelongAcademy = !!user && user.academyDomain && !user.isLearningSpace;
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [openExamHistoryDialog, setOpenExamHistoryDialog] = useState<boolean>(false);
  const [examSession, setExamSession] = useState<InfoExamSessionByCode>();
  const [schedules, setSchedules] = useState<ScheduleResponse[]>();
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
  const { alarmClockProps: { panelProps: { onStart } } } = useAlarm(false, [], false)
  const scrollRef = useRef<ScrollView>(null)
  const academyDomain = user?.academyDomain


  const handleOpenExamHistoryDialog = () => {
    setOpenExamHistoryDialog(true);
  }

  const handleCloseExamHistoryDialog = () => {
    setOpenExamHistoryDialog(false);
  }

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  }

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  }

  const handleGetInfoExam = async (code: string) => {
    try {
      setLoadingWithoutOverlay(true);
      const response = await getExamInfoApi(code);
      setExamSession(response.data);
      setOpen(false)
      handleOpenConfirmDialog();
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    } finally {
      setLoadingWithoutOverlay(false);
    }
  };


  const handleToggleSchedule = () => {
    setOpenSchedule(prev => {
      if (prev) {
        getScheduleList()
      }
      return !prev
    }
    )
  }

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

  const openCloseModal = (bool?: boolean) => {
    setCodeExam("");
    setOpen(bool !== undefined ? bool : prev => !prev);
    setIsCheckTeacherStart(false);
  };

  const callApiCheckExam = async (code: string) => {
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }

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

  const handleCodeExam = async (code: string, callback?: Function) => {
    setLoadingWithoutOverlay(true)
    try {
      await callApiCheckExam(code);
      callback && callback()
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  const handleTeacherKickStudent = () => {
    toast.error(t("you_has_been_kicked_out"));
    openCloseModal();
  };

  const handleTeacherStartExam = (data: any) => {
    openCloseModal(false)
    if (data.Status === ExamStatus.Pending) {
      setIsCheckTeacherStart(true);
    } else if (data.Status === ExamStatus.InProgress) {
      navigate(Routes.Auth.DoExam, { examCode: codeExam });
    } else if (data.Status === ExamStatus.Completed) {
      navigate(Routes.Auth.ExamResult, { examCode: codeExam });
    }
  };

  const handleMemberRemoved = (member: any) => {
    const isCheckTeacherOut =
      member?.id && member?.info && member.info.isTeacher;
    if (isCheckTeacherOut) {
      toast.warning(t("the_teacher_has_closed_or_deleted_the_exam"));
      setIsCheckTeacherStart(false);
    }
  };

  const cleanupPusher = () => {
    if (!academyDomain || !userId || !pusher) return
    if (studentChannelName.current) {
      unsubscribeChannelSafe(pusher, studentChannelName.current)
    }
    if (channelName.current) {
      unsubscribeChannelSafe(pusher, channelName.current)
    }
  };

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

  const examHandlersRef = useRef<{ [event: string]: (data: any) => void }>({})
  const studentHandlersRef = useRef<{ [event: string]: (data: any) => void }>({})

  examHandlersRef.current = {
    [ExamEvent.StartExam]: handleTeacherStartExam,
    [EVENT_DELETED_MEMBER]: handleMemberRemoved,
  }
  studentHandlersRef.current = {
    [ExamEvent.TeacherKickOutStudent]: handleTeacherKickStudent,
  }

  const handleListenerEvent = async () => {
    try {
      if (!codeExam || !isCheckTeacherStart || !academyDomain || !userId || !pusher) return

      channelName.current = `${EXAM_CHANNEL}-${codeExam}-${academyDomain.trim().toUpperCase()}`
      studentChannelName.current = EXAM_STUDENT_CHANNEL
        .replace('{examCode}', `${codeExam}-${academyDomain.trim().toUpperCase()}`)
        .replace('{studentId}', userId.toString())

      channel.current = await subscribeChannel(
        pusher,
        channelName.current,
        () => Object.entries(examHandlersRef.current).map(([eventName, handler]) => ({ eventName, handler }))
      )

      studentChannel.current = await subscribeChannel(
        pusher,
        studentChannelName.current,
        () => Object.entries(studentHandlersRef.current).map(([eventName, handler]) => ({ eventName, handler }))
      )
    } catch (err) {
      console.error('Pusher subscription failed', err)
    }
  }

  const handleStartAudio = async (textbook: Textbook, skipPreAlarm?: boolean) => {
    onStart(AlarmType.Subject, textbook.limitedTimeInMinutes, textbook.subject as any, skipPreAlarm)
  }

  const handleStartTextbook = async (enable: boolean, textbook: Textbook, skipPreAlarm?: boolean) => {
    try {
      setLoadingWithoutOverlay(true)
      await startTextbook(textbook.id)
      if (enable && !textbook.isMock)
        await handleStartAudio(textbook, skipPreAlarm)
      handleCloseAudioGuide()
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      navigate(Routes.Auth.DoTextbook, { textbookId: selectedTextbook?.id, restart: true })
      setLoadingWithoutOverlay(false)
    }
  }

  const handleStartTextbookFromGuideModal = (enable: boolean, skipPreAlarm?: boolean) => {
    if (!selectedTextbook) return
    handleStartTextbook(enable, selectedTextbook, skipPreAlarm)
  }

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true })
      return () => {
        setSelectedTextbook(undefined)
        handleCloseTextbookResult()
        setOpen(false)
        handleCloseExamHistoryDialog()
      };
    }, [])
  );

  useEffect(() => {
    let isStart = true;

    const initPusher = async () => {
      if (!isStart) return;
      await handleListenerEvent();
    };

    initPusher()

    return () => {
      isStart = false;
      cleanupPusher()
    };
  }, [
    pusher,
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

  const getScheduleList = async (isLoading = true) => {
    if (!user?.academyDomain && !user?.isLearningSpace) {
      setSchedules([])
      return
    }

    isLoading && setLoading(true)
    try {
      const { data } = await getSchedulesApi({
        currentPage: 1,
        pageSize: 3,
        sortColumnDirection: OrderBy.DESC,
        sortColumnName: ScheduleSortBy.CreatedAt,
        startDate: moment()
          .startOf("day")
          .utc()
          .toISOString(),
        endDate: moment()
          .endOf("day")
          .utc()
          .toISOString(),
      });

      const { items = [] } = data;
      setSchedules(items);
    } catch (error) {
      setSchedules([]);
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
  };

  const handleCheckInLesson = async (schedule: ScheduleResponse) => {
    if (!schedule?.lessonId) return;
    setLoadingWithoutOverlay(true)
    try {
      await getCheckInLessonsApi(schedule?.lessonId);
      await getScheduleList();
      toast.success(t("check_in_lesson_successfully"));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  const handleUpdateScheduleStatus = async (schedule: ScheduleResponse) => {
    if (schedule.type !== ScheduleType.Personal || !schedule.id) return;
    setLoadingWithoutOverlay(true)
    const endTime = timeSpanToLocalMoment(schedule.endTime, schedule.date);
    const now = moment();
    try {
      const status =
        schedule.status == ScheduleStatus.Completed
          ? ScheduleStatusRequest.Default
          : ScheduleStatusRequest.Completed;
      await updateScheduleStatusApi(schedule.id, status);
      setSchedules((schedules) =>
        schedules?.map((s) =>
          s.id === schedule.id
            ? {
              ...s,
              status:
                status === ScheduleStatusRequest.Default
                  ? endTime?.isBefore(now)
                    ? ScheduleStatus.Missed
                    : ScheduleStatus.Default
                  : ScheduleStatus.Completed
            }
            : s
        )
      );
      handleGetScheduleCount();
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };


  const selectedSchedule = useMemo(() => {
    if (!schedules?.length) return undefined;

    const now = moment();

    return schedules
      .filter((i) => {
        const start = timeSpanToLocalMoment(i.startTime, i.date);
        const end = timeSpanToLocalMoment(i.endTime, i.date);

        return (
          start?.isSame(now, 'day') &&
          now.isSameOrBefore(end)
        );
      })
      .sort((a, b) =>
        timeSpanToLocalMoment(a.startTime, a.date)!.valueOf() -
        timeSpanToLocalMoment(b.startTime, b.date)!.valueOf()
      )[0];

  }, [schedules]);

  const enableCheckSchedule = selectedSchedule?.type === ScheduleType.Personal || selectedSchedule?.status === ScheduleStatus.Default

  const handleCheckSchedule = () => {
    if (!enableCheckSchedule) return
    if (selectedSchedule?.type === ScheduleType.Personal) {
      handleUpdateScheduleStatus(selectedSchedule)
    } else {
      handleCheckInLesson(selectedSchedule)
    }
  }

  useEffect(() => {
    getScheduleList();
  }, [user?.academyDomain, user?.isLearningSpace]);

  return {
    t,
    open,
    user,
    scrollRef,
    openCloseModal,
    handleCodeExam,
    codeExam,
    schedules,
    selectedDate,
    handleSelectDate,
    setCodeExam,
    handleGetInfoExam,
    handleToggleSchedule,
    openSchedule,
    isCheckTeacherStart,
    selectedTextbook,
    isOpenAudioGuide,
    openConfirmDialog,
    examSession,
    getScheduleList,
    openExamHistoryDialog,
    handleOpenExamHistoryDialog,
    handleCloseExamHistoryDialog,
    selectedSchedule,
    enableCheckSchedule,
    handleCheckSchedule,
    handleCloseConfirmDialog,
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
