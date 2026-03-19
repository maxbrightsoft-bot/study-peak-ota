import { BASE_URL, SUPER_ADMIN_BASE_URL } from "@/utils/constants";
import { RankingRequest, SubjectRequest } from "../configs/types";
import { api } from "@/services";
import { NoteRequest } from "@/utils/types";

const SUBJECT_TIMER_URL = `${BASE_URL}/api/subject/timers`;
const SUBJECT_TIMER_ADMIN_URL = `${SUPER_ADMIN_BASE_URL}/api/subject/timers`;
const SUBJECT_URL = `${BASE_URL}/api/subject`;
const SUBJECT_ADMIN_URL = `${SUPER_ADMIN_BASE_URL}/api/subject`;
const NOTES_URL = `${BASE_URL}/api/notes`

export const getDataApi = (isSuperAdmin: boolean, data: SubjectRequest) => api.get(`${isSuperAdmin ? SUBJECT_TIMER_ADMIN_URL : SUBJECT_TIMER_URL}/data`, { params: data })
export const getSubjectDataApi = (isSuperAdmin: boolean, data: SubjectRequest) => api.get(`${isSuperAdmin ? SUBJECT_TIMER_ADMIN_URL : SUBJECT_TIMER_URL}/subject-data`, { params: data })
export const getRankingDataApi = (isSuperAdmin: boolean, data: RankingRequest) => api.get(`${isSuperAdmin ? SUBJECT_TIMER_ADMIN_URL : SUBJECT_TIMER_URL}/ranking-data`, { params: data })

export const getSubjectListApi = async (isSuperAdmin: boolean) =>
  api.get(`${isSuperAdmin ? SUBJECT_ADMIN_URL : SUBJECT_URL}`, {
    params: {
      pageSize: -1,
      currentPage: 1,
      textSearch: ''
    }
  });
export const getQuestionDataApi = (id: number, data: SubjectRequest) => api.get(`${SUBJECT_URL}/${id}/questions/data`, { params: data })
export const getQuestionSubjectDataApi = (id: number, data: SubjectRequest) => api.get(`${SUBJECT_URL}/${id}/questions/subject-data`, { params: data })
export const getQuestionRankingDataApi = (data: RankingRequest) => api.get(`${SUBJECT_URL}/questions/ranking-data`, { params: data })
export const getQuestionOverallDataApi = (data: RankingRequest) => api.get(`${SUBJECT_URL}/questions/overall`, { params: data })

export const updateNoteApi = (id: number, data: NoteRequest) =>
    api.put(`${NOTES_URL}/${id}`, data)

export const deleteNoteApi = (id: number) => api.delete(`${NOTES_URL}/${id}`)
