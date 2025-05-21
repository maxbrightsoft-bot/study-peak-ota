import { api } from "@/services/apiClient";
import { BASE_URL } from "@/utils/constants";
import { StudentAnswerRequest } from "@/utils/types";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;

export const getQuestionExam = (code?: string) => api.get(`${EXAM_SESSION_URL}/${code}/questions`);

export const answerQuestionExam = (examCode: string, body: StudentAnswerRequest) => api.post(`${EXAM_SESSION_URL}/${examCode}/answer`, body);

export const getExamResult = (examCode?: string) => api.get(`${EXAM_SESSION_URL}/${examCode}/results`)

export const finishExam = (code?: string) => api.post(`${EXAM_SESSION_URL}/${code}/finish`)
export const getResults = (code: string) =>
  api.get(`${EXAM_SESSION_URL}/${code}/results`);

export const getResultsLongTimeSpend = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/longTimeSpend`)
export const getResultsEffectSize = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/effectSize`)
export const getResultsTimeOrderQuestion = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/timelyOrderQuestion`)
export const getResultsCategories = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/categories`)

export const createConversationApi = (data : any) => 
    api.post(`${BASE_URL}/api/conversation`, data)

