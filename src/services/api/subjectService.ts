import { BASE_URL, SUPER_ADMIN_BASE_URL } from "../../utils/constants";
import { ResumeOrPauseRequest, SaveTimerRequest, StopTimerRequest, SubjectTimerSearchQuery, UpdateSubjectTimerInfoRequest, UpdateSubjectTimersInfoRequest, UpdateSubjectTimersInfoRequestContent } from "../../utils/types/subjects";
import { api } from "./apiClient";

const ADMIN_SUBJECT_URL = `${SUPER_ADMIN_BASE_URL}/api/subject`;
const SUBJECT_URL = `${BASE_URL}/api/subject`;

export const getSubjectListAdminApi = async (textSearch: string, isStarted?: boolean) =>
  api.get(`${ADMIN_SUBJECT_URL}`, {
    params: {
      textSearch,
      isStarted,
      pageSize: 100,
      currentPage: 1
    }
  });

export const getSubjectListApi = async (textSearch: string, isStarted?: boolean) =>
  api.get(`${SUBJECT_URL}/timers`, {
    params: {
      textSearch,
      isStarted,
      pageSize: 100,
      currentPage: 1
    }
  });


export const getStudentSubjectListApi = async (pageSize: number = 100, currentPage: number = 1) =>
  api.get(`${SUBJECT_URL}/timers`, {
    params: {
      sortColumnName: "SubjectTimer",
      sortColumnDirection: "DESC",
      pageSize,
      currentPage
    }
  });

export const startStudentSubjectTimerApi = async (subjectId: number) =>
  api.post(`${SUBJECT_URL}/${subjectId}/timers`);

export const pauseStudentSubjectApi = async (subjectId: number, data: ResumeOrPauseRequest) =>
  api.put(`${SUBJECT_URL}/${subjectId}/timers`, data);

export const stopStudentSubjectApi = async (subjectId: number, timerId: number, data: StopTimerRequest) =>
  api.post(`${SUBJECT_URL}/${subjectId}/timers/${timerId}`, data);

export const saveStudentSubjectTimerApi = async (subjectId: number, timerId: number, data: SaveTimerRequest) =>
  api.put(`${SUBJECT_URL}/${subjectId}/timers/${timerId}/save`, data);

export const getSuperStudentSubjectListApi = async (pageSize: number = 100, currentPage: number = 1) =>
  api.get(`${ADMIN_SUBJECT_URL}/timers`, {
    params: {
      sortColumnName: "SortOrder",
      pageSize,
      currentPage
    }
  });

export const startSuperStudentSubjectTimerApi = async (subjectId: number) =>
  api.post(`${ADMIN_SUBJECT_URL}/${subjectId}/timers`);

export const pauseSuperStudentSubjectApi = async (subjectId: number, data: ResumeOrPauseRequest) =>
  api.put(`${ADMIN_SUBJECT_URL}/${subjectId}/timers`, data);

export const stopSuperStudentSubjectApi = async (subjectId: number, timerId: number, data: StopTimerRequest) =>
  api.post(`${ADMIN_SUBJECT_URL}/${subjectId}/timers/${timerId}`, data);

export const saveSuperStudentSubjectTimerApi = async (subjectId: number, timerId: number, data: SaveTimerRequest) =>
  api.put(`${ADMIN_SUBJECT_URL}/${subjectId}/timers/${timerId}/save`, data);

export const getTimerByIdApi = (subjectId: number, id: number) => api.get(`${SUBJECT_URL}/${subjectId}/timers/${id}`)
export const getSuperTimerByIdApi = (subjectId: number, id: number) => api.get(`${ADMIN_SUBJECT_URL}/${subjectId}/timers/${id}`)
export const updateTimerByIdApi = (subjectId: number, id: number, data: UpdateSubjectTimerInfoRequest) => api.put(`${SUBJECT_URL}/${subjectId}/timers/${id}/info`, data)
export const updateSuperTimerByIdApi = (subjectId: number, id: number, data: UpdateSubjectTimerInfoRequest) => api.put(`${ADMIN_SUBJECT_URL}/${subjectId}/timers/${id}/info`, data)
export const getTimersApi = (subjectId: number, searchQuery: SubjectTimerSearchQuery) => api.get(`${SUBJECT_URL}/${subjectId}/timers`, {
  params: {
    ...searchQuery,
    recordsMatchTime: true,
    sortColumnName: "startedAt",
    sortColumnDirection: "ASC"
  }
})
export const getSuperTimersApi = (subjectId: number, searchQuery: SubjectTimerSearchQuery) => api.get(`${ADMIN_SUBJECT_URL}/${subjectId}/timers`, {
  params: {
    ...searchQuery,
    recordsMatchTime: true,
    sortColumnName: "startedAt",
    sortColumnDirection: "ASC"
  }
})
export const updateTimersApi = (subjectId: number, data: UpdateSubjectTimersInfoRequest) => api.put(`${SUBJECT_URL}/${subjectId}/timers/list/info`, data)
export const updateSuperTimersApi = (subjectId: number, data: UpdateSubjectTimersInfoRequest) => api.put(`${ADMIN_SUBJECT_URL}/${subjectId}/timers/list/info`, data)