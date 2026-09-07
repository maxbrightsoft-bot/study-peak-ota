import { BASE_URL } from "@/utils/constants";
import { ScheduleQuery, ScheduleRequest, ScheduleStatusRequest } from "../configs/type";
import { api } from "@/services/api/apiClient";
import { getIdLinkAccount } from "@/utils/helpers";

const SCHEDULE_URL = `${BASE_URL}/api/schedules`;

export const getSchedulesApi = (query: ScheduleQuery) => {
  const idLinkAccount = getIdLinkAccount();
  return api.get(`${SCHEDULE_URL}`, {
    params: {
      ...query,
      ...(idLinkAccount ? { idLinkAccount } : {})
    }
  });
};

export const createScheduleApi = (values: ScheduleRequest) =>
  api.post(`${SCHEDULE_URL}`, {
    ...values
  });

export const updateScheduleApi = (scheduleId: number, values: ScheduleRequest) =>
  api.put(`${SCHEDULE_URL}/${scheduleId}`, {
    ...values
  });

export const updateScheduleStatusApi = (scheduleId: number, status: ScheduleStatusRequest) =>
  api.put(`${SCHEDULE_URL}/${scheduleId}/status`, null, {
    params: {
      status
    }
  });

export const deleteScheduleApi = (scheduleId: number) =>
  api.delete(`${SCHEDULE_URL}/${scheduleId}`);

export const getScheduleCountApi = (values: { startDate: string, endDate: string }) => {
  const idLinkAccount = getIdLinkAccount();
  return api.get(`${SCHEDULE_URL}/count`, {
    params: {
      ...values,
      ...(idLinkAccount ? { idLinkAccount } : {})
    }
  });
};

