import { BASE_URL, SUPER_ADMIN_BASE_URL } from "@/utils/constants";
import {
  PerformanceAnalysisResponse,
  PerformanceDailyRequest,
  PerformanceDailyResponse,
  PerformanceRequest,
  PerformanceSummaryResponse,
  PerformanceWeaknessResponse,
  PopQuizSubjectItem,
  RankingRequest,
  SubjectRequest,
  SubjectResponse,
} from "../../../configs/types";
import { api } from "@/services";
import { getIdLinkAccount } from "@/utils/helpers";

const SUBJECT_TIMER_URL = `${BASE_URL}/api/subject/timers`;
const SUBJECT_TIMER_ADMIN_URL = `${SUPER_ADMIN_BASE_URL}/api/subject/timers`;
const SUBJECT_URL = `${BASE_URL}/api/subject`;
const SUBJECT_ADMIN_URL = `${SUPER_ADMIN_BASE_URL}/api/subject`;
const POP_QUIZ_URL = `${BASE_URL}/api/pop-quiz`;
const POP_QUIZ_PERFORMANCE_URL = `${POP_QUIZ_URL}/performance`;

const getIdLinkAccountParam = () => {
  const idLinkAccount = getIdLinkAccount();
  return idLinkAccount ? { idLinkAccount } : {};
};

export const getDataApi = (isSuperAdmin: boolean, data: SubjectRequest) =>
  api.get(`${isSuperAdmin ? SUBJECT_TIMER_ADMIN_URL : SUBJECT_TIMER_URL}/data`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getSubjectDataApi = (isSuperAdmin: boolean, data: SubjectRequest) =>
  api.get(`${isSuperAdmin ? SUBJECT_TIMER_ADMIN_URL : SUBJECT_TIMER_URL}/subject-data`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getRankingDataApi = (isSuperAdmin: boolean, data: RankingRequest) =>
  api.get(`${isSuperAdmin ? SUBJECT_TIMER_ADMIN_URL : SUBJECT_TIMER_URL}/ranking-data`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getSubjectListApi = async (isSuperAdmin: boolean) =>
  api.get<{ items: SubjectResponse[] }>(`${isSuperAdmin ? SUBJECT_ADMIN_URL : SUBJECT_URL}`, {
    params: {
      pageSize: -1,
      currentPage: 1,
      textSearch: '',
      ...getIdLinkAccountParam()
    }
  });

export const getQuestionDataApi = (id: number, data: SubjectRequest) =>
  api.get(`${SUBJECT_URL}/${id}/questions/data`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getQuestionSubjectDataApi = (id: number, data: SubjectRequest) =>
  api.get(`${SUBJECT_URL}/${id}/questions/subject-data`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getQuestionRankingDataApi = (data: RankingRequest) =>
  api.get(`${SUBJECT_URL}/questions/ranking-data`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getQuestionOverallDataApi = (data: RankingRequest) =>
  api.get(`${SUBJECT_URL}/questions/overall`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getPerformanceSummaryApi = (id: number, data: PerformanceRequest) =>
  api.get<PerformanceSummaryResponse>(`${SUBJECT_URL}/${id}/questions/performance/summary`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getPerformanceAnalysisApi = (id: number, data: PerformanceRequest) =>
  api.get<PerformanceAnalysisResponse>(`${SUBJECT_URL}/${id}/questions/performance/analysis`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getPerformanceWeaknessApi = (id: number, data: PerformanceRequest) =>
  api.get<PerformanceWeaknessResponse>(`${SUBJECT_URL}/${id}/questions/performance/weakness`, { params: { ...data, ...getIdLinkAccountParam() } });

// Fixed daily summary: today stats + this-week activity + peer comparison — all subjects, not subject-filtered
export const getPerformanceDailyApi = (data: PerformanceDailyRequest) =>
  api.get<PerformanceDailyResponse>(`${SUBJECT_URL}/questions/performance/daily`, { params: { ...data, ...getIdLinkAccountParam() } });

// --- Pop Quiz Performance APIs (My Study Space) ---
export const getPopQuizPerformanceDailyApi = (data: PerformanceDailyRequest) =>
  api.get<PerformanceDailyResponse>(`${POP_QUIZ_PERFORMANCE_URL}/daily`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getPopQuizPerformanceSummaryApi = (data: PerformanceRequest) =>
  api.get<PerformanceSummaryResponse>(`${POP_QUIZ_PERFORMANCE_URL}/summary`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getPopQuizPerformanceAnalysisApi = (data: PerformanceRequest) =>
  api.get<PerformanceAnalysisResponse>(`${POP_QUIZ_PERFORMANCE_URL}/analysis`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getPopQuizPerformanceWeaknessApi = (data: PerformanceRequest) =>
  api.get<PerformanceWeaknessResponse>(`${POP_QUIZ_PERFORMANCE_URL}/weakness`, { params: { ...data, ...getIdLinkAccountParam() } });

export const getPopQuizSubjectListApi = () =>
  api.get<{ items: PopQuizSubjectItem[] }>(`${POP_QUIZ_URL}/subjects`, { params: { ...getIdLinkAccountParam() } });
