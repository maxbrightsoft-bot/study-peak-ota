import { useState } from "react";

import { ScheduleFormData, ScheduleResponse } from "../configs/type";
import { createScheduleApi } from "../apiClients/scheduleService";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";
import _ from "lodash";

type Props = {
  getScheduleList: () => void;
  getScheduleListForNoteEvent: () => void;
  onScheduleCountChange: () => void
};

const useCalendar = ({ getScheduleList, getScheduleListForNoteEvent, onScheduleCountChange }: Props) => {
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);
  const [isOpenConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [isOpenConfirmDeleteDialog, setOpenConfirmDeleteDialog] =
    useState<boolean>(false);
  const [openTooltipList, setOpenTooltipList] = useState<number | boolean>(
    false
  );
  const { setLoading } = useAuthStore()
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleResponse>();
  const [scheduleRequest, setScheduleRequest] = useState<ScheduleFormData>();
  const { t } = useTranslation();

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
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleOpenConfirmDialog = (schedule?: ScheduleFormData) => {
    if (schedule) setScheduleRequest(schedule);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDeleteDialog = () => {
    setOpenConfirmDeleteDialog(false);
    clearData()
  };

  const handleOpenConfirmDeleteDialog = (schedule?: ScheduleResponse) => {
    if (schedule) setSelectedSchedule(schedule);
    setOpenConfirmDeleteDialog(true);
  };

  const clearData = () => {
    setSelectedSchedule(undefined);
    setScheduleRequest(undefined);
  };

  const handleCreateSchedule = async () => {
    if (
      !scheduleRequest ||
      !scheduleRequest.date ||
      !scheduleRequest.startTime ||
      !scheduleRequest.endTime ||
      !scheduleRequest.title
    )
      return;
    setLoading(true)
    const schedule: any = _.clone(scheduleRequest)
    const date = schedule.date.isUTC()
      ? schedule.date.format("YYYY-MM-DDTHH:mm:ss")
      : schedule.date
          .startOf("day")
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss");
    try {
      await createScheduleApi({
        ...schedule,
        date,
        startTime: schedule.startTime.utc().format("HH:mm:ss"),
        endTime: schedule.endTime.utc().format("HH:mm:ss")
      });
      getScheduleList();
      getScheduleListForNoteEvent();
      onScheduleCountChange();
      toast.success(t("create_schedule_successfully"));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
    handleCloseConfirmDialog();
  };

  const handleSetSchedule = (values?: ScheduleResponse) => {
    setSelectedSchedule(values);
  };
  const handleSetScheduleRequest = (values?: ScheduleFormData) => {
    setScheduleRequest(values);
  };

  return {
    t,
    selectedSchedule,
    isOpenDialog,
    openTooltipList,
    handleOpenTooltip,
    handleCloseTooltip,
    handleCloseDialog,
    handleOpenDialog,
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    isOpenConfirmDeleteDialog,
    handleCloseConfirmDeleteDialog,
    handleOpenConfirmDeleteDialog,
    handleSetSchedule,
    handleCreateSchedule,
    handleSetScheduleRequest,
    scheduleRequest
  };
};

export default useCalendar;
