import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScheduleFormData,
  ScheduleQuery,
  ScheduleResponse,
  ScheduleStatus,
  ScheduleStatusRequest,
  ScheduleType
} from "../configs/type";
import {
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

const useSchedule = () => {
  const { user, setLoading } = useAuthStore()
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);
  const [isOpenConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
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
  const [scheduleRequest, setScheduleRequest] = useState<ScheduleFormData>();
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
    setOpenDialog(false);
  };

  const handleOpenDialog = (schedule?: ScheduleResponse) => {
    if (schedule) setSelectedSchedule(schedule);
    setOpenDialog(true);
    handleCloseTooltip();
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleOpenConfirmDialog = (schedule?: ScheduleResponse) => {
    if (schedule) setSelectedSchedule(schedule);
    setOpenConfirmDialog(true);
    handleCloseTooltip();
  };

  const handleCloseConfirmDeleteDialog = () => {
    setOpenConfirmDeleteDialog(false);
  };

  const handleOpenConfirmDeleteDialog = (schedule?: ScheduleResponse) => {
    if (schedule) setSelectedSchedule(schedule);
    setOpenConfirmDeleteDialog(true);
    handleCloseTooltip();
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

  const getScheduleList = async () => {
    setLoading(true)
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
    setLoading(false)
  };

  const handleEditSchedule = async () => {
    if (
      !scheduleRequest?.id ||
      !scheduleRequest.date ||
      !scheduleRequest.startTime ||
      !scheduleRequest.endTime ||
      !scheduleRequest.title
    )
      return;
    setLoading(true)
    try {
      const schedule: any = _.clone(scheduleRequest)
      const date = schedule?.date?.isUTC()
        ? schedule.date?.format("YYYY-MM-DDTHH:mm:ss")
        : schedule?.date
            ?.startOf("day")
            .utc()
            .format("YYYY-MM-DDTHH:mm:ss");
      await updateScheduleApi(schedule?.id, {
        ...schedule,
        date,
        startTime: schedule?.startTime?.utc().format("HH:mm:ss"),
        endTime: schedule?.endTime?.utc().format("HH:mm:ss")
      });
      getScheduleList();
      toast.success(t("update_schedule_successfully"));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
    handleCloseConfirmDialog();
  };

  const handleUpdateScheduleStatus = async (schedule: ScheduleResponse) => {
    if (schedule.type !== ScheduleType.Personal || !schedule.id) return;
    setLoading(true)
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
    setLoading(false)
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule?.id) return;
    setLoading(true)

    try {
      await deleteScheduleApi(selectedSchedule?.id);
      getScheduleList();
      getScheduleListForNoteEvent();
      handleGetScheduleCount();
      toast.success(t("delete_schedule_successfully"));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
    handleCloseConfirmDeleteDialog();
  };

  const handleChangeScheduleRequest = (val?: ScheduleFormData) => {
    setScheduleRequest(val);
  };
  const handleSetSchedule = (values?: ScheduleResponse) => {
    setSelectedSchedule(values);
  };

  const handleCheckInLesson = async (schedule: ScheduleResponse) => {
    if (!schedule?.lessonId) return;
    setLoading(true)
    try {
      await getCheckInLessonsApi(schedule?.lessonId);
      getScheduleList();
      toast.success(t("check_in_lesson_successfully"));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
    handleCloseDialog();
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
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    isOpenConfirmDeleteDialog,
    handleCloseConfirmDeleteDialog,
    handleOpenConfirmDeleteDialog,
    handleSetSchedule,
    handleEditSchedule,
    handleDeleteSchedule,
    handleChangeScheduleRequest,
    handleUpdateScheduleStatus,
    handleUpdateGroupSchedule,
    scheduleRequest
  };
};

export default useSchedule;
