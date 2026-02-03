import { AlarmResumeOrPauseRequest, StartAlarmRequest, ToggleAlarmSpeakerRequest } from "@/utils/types/alarm";
import { api } from "./apiClient";
import { BASE_URL, SUPER_ADMIN_BASE_URL } from "@/utils/constants";

const ADMIN_ALARM_URL = `${SUPER_ADMIN_BASE_URL}/api/users/alarm`;
const ALARM_URL = `${BASE_URL}/api/user/alarm`;

export const getSuperAdminAlarmApi = async () =>
  api.get(`${ADMIN_ALARM_URL}`);

export const getAlarmApi = async () =>
  api.get(`${ALARM_URL}`);

export const startStudentAlarmApi = async (data: StartAlarmRequest) =>
  api.post(`${ALARM_URL}`, data);

export const pauseStudentAlarmApi = async (data: AlarmResumeOrPauseRequest) =>
  api.put(`${ALARM_URL}`, data);

export const startSuperStudentAlarmApi = async (data: StartAlarmRequest) =>
  api.post(`${ADMIN_ALARM_URL}`, data);

export const pauseSuperStudentAlarmApi = async (data: AlarmResumeOrPauseRequest) =>
  api.put(`${ADMIN_ALARM_URL}`, data);

export const toggleAlarmSpeakerApi = async (data: ToggleAlarmSpeakerRequest) =>
  api.post(`${ALARM_URL}/speaker`, data);
export const toggleSuperAlarmSpeakerApi = async (data: ToggleAlarmSpeakerRequest) =>
  api.post(`${ADMIN_ALARM_URL}/speaker`, data);
