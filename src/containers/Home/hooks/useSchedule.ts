import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScheduleFormData,
  ScheduleQuery,
  ScheduleRequest,
  ScheduleResponse,
  ScheduleStatus,
  ScheduleStatusRequest,
  ScheduleType
} from "../configs/type";
import {
  createScheduleApi,
  deleteScheduleApi,
  getScheduleCountApi,
  getSchedulesApi,
  updateScheduleApi,
  updateScheduleStatusApi
} from "../apiClients/scheduleService";
import { DefaultScheduleFilter } from "../configs/constants";
import { getCheckInLessonsApi } from "../apiClients";
import useAuthStore from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { getErrorMessage, timeSpanToLocalMoment, toast } from "@/utils/helpers";
import _ from "lodash";
import { convertScheduleFormToRequest } from "../configs/helpers";

const useSchedule = () => {
  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
  const isDemoMode = useAuthStore(state => state.isDemoMode)
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);
  const [isOpenConfirmDeleteDialog, setOpenConfirmDeleteDialog] =
    useState<boolean>(false);
  const [scheduleCount, setScheduleCount] = useState<{
    totalSchedules: number;
    totalCompletedSchedules: number;
  }>();
  const [openTooltipList, setOpenTooltipList] = useState<number | boolean>(
    false
  );
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleResponse>();
  const [scheduleList, setScheduleList] = useState<ScheduleResponse[]>();
  const [schedules, setSchedules] = useState<ScheduleResponse[]>();

  const [filter, setFilter] = useState<ScheduleQuery>(DefaultScheduleFilter);
  const textSearchRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState<any>(moment());
  const { t } = useTranslation();
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

  const handleUpdateGroupSchedule = (data: string) => {
    const item = JSON.parse(data);
    if (!item) return;
    const endTime = timeSpanToLocalMoment(
      item.lesson.endTime,
      item.lesson.date
    );
    const now = moment();
    setSchedules((schedules) =>
      schedules?.map((s) => {
        if (s.type === ScheduleType.Group && s.lessonId === item.lesson?.id)
          return {
            ...s,
            status:
              item.status === 1
                ? endTime?.isBefore(now)
                  ? ScheduleStatus.Missed
                  : ScheduleStatus.Default
                : ScheduleStatus.Completed
          };
        return s;
      })
    );
  };
  const handleCloseTooltip = () => {
    setOpenTooltipList(false);
  };

  const handleOpenTooltip = (index: number) => {
    setOpenTooltipList(index);
  };

  const handleCloseDialog = () => {
    setSelectedSchedule(undefined);
    setOpenDialog(false);
  };

  const handleOpenDialog = (schedule?: ScheduleResponse) => {
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }
    if (schedule) setSelectedSchedule(schedule);
    handleCloseTooltip();
    setOpenDialog(true);
  };

  const handleCloseConfirmDeleteDialog = () => {
    setOpenConfirmDeleteDialog(false);
  };

  const handleOpenConfirmDeleteDialog = (schedule?: any) => {
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }
    if (schedule) {
      setSelectedSchedule(schedule);
    }
    handleCloseTooltip();
    setOpenConfirmDeleteDialog(true);
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

  const getScheduleList = async (isLoading = true) => {
    if (!user?.academyDomain && !user?.isLearningSpace) {
      setSchedules([])
      return
    }

    isLoading && setLoading(true)
    try {
      const { data } = await getSchedulesApi({
        ...filter,
        startDate: moment(selectedDate?.currentDate)
          .startOf("day")
          .utc()
          .toISOString(),
        endDate: moment(selectedDate?.currentDate)
          .endOf("day")
          .utc()
          .toISOString(),
        textSearch: textSearchRef.current?.value
      });

      const { items = [] } = data;
      setSchedules(items);
      if (items.length === 0 && filter.currentPage > 1) {
        setFilter((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1
        }));
      }
    } catch (error) {
      setSchedules([]);
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
  };

  const getScheduleListForNoteEvent = async () => {
    if (!user?.academyDomain && !user?.isLearningSpace) {
      setScheduleList([])
      return
    }
    try {
      const { data } = await getSchedulesApi({
        ...filter,
        startDate: moment(selectedDate?.startDate).utc().toISOString(),
        endDate: moment(selectedDate?.endDate).utc().toISOString(),
        textSearch: textSearchRef.current?.value
      });

      const { items = [] } = data;

      setScheduleList(items);
    } catch (error) {
      setScheduleList([]);
      toast.error(getErrorMessage(t, error));
    }
  };


  const clearData = () => {
    setSelectedSchedule(undefined);
    setOpenDialog(false);
    setOpenConfirmDeleteDialog(false)
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

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule?.id) return;
    setLoadingWithoutOverlay(true)
    clearData()

    try {
      await deleteScheduleApi(selectedSchedule?.id);
      await getScheduleList();
      await getScheduleListForNoteEvent();
      handleGetScheduleCount();
      toast.success(t("delete_schedule_successfully"));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  const handleCreateSchedule = async (values: ScheduleFormData) => {
    if (
      !values.date ||
      !values.startTime ||
      !values.endTime ||
      !values.title
    )
      return;
    setLoadingWithoutOverlay(true)
    try {
      const schedule: ScheduleRequest = convertScheduleFormToRequest(values)
      if (values.id)
        await updateScheduleApi(values.id, schedule);
      else
        await createScheduleApi(schedule);
      await getScheduleList(false);
      await getScheduleListForNoteEvent();
      handleGetScheduleCount();
      toast.success(t(values.id ? "update_schedule_successfully" : "create_schedule_successfully"));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      setLoadingWithoutOverlay(false)
    }
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
    clearData()
  };

  useEffect(() => {
    getScheduleList();
  }, [
    JSON.stringify(filter),
    selectedDate?.currentDate,
    user?.id,
    user?.academyDomain,
    user?.isLearningSpace
  ]);

  useEffect(() => {
    getScheduleListForNoteEvent();
  }, [
    JSON.stringify(filter),
    selectedDate?.startDate,
    selectedDate?.endDate,
    user?.id,
    user?.academyDomain,
    user?.isLearningSpace
  ]);

  const highlightedDays = useMemo(() => {
    return (
      scheduleList?.map(
        (schedule) =>
          timeSpanToLocalMoment(schedule.startTime, schedule.date)?.get("D") ||
          0
      ) || []
    );
  }, [JSON.stringify(scheduleList)]);

  const handleSetSchedule = (values?: ScheduleResponse) => {
    setSelectedSchedule(values);
  };

  return {
    t,
    date,
    setDate,
    selectedDate,
    schedules,
    highlightedDays,
    selectedSchedule,
    isOpenDialog,
    openTooltipList,
    handleOpenTooltip,
    handleCloseTooltip,
    handleCloseDialog,
    handleOpenDialog,
    getScheduleList,
    handleSelectDate,
    handleGetScheduleCount,
    handleCheckInLesson,
    getScheduleListForNoteEvent,
    handleCreateSchedule,
    isOpenConfirmDeleteDialog,
    handleCloseConfirmDeleteDialog,
    handleOpenConfirmDeleteDialog,
    handleSetSchedule,
    handleDeleteSchedule,
    handleUpdateScheduleStatus,
    handleUpdateGroupSchedule,
  };
};

export default useSchedule;
