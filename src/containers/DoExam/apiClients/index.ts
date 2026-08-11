import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { PauseOrResumeExamRequest, StudentAnswerRequest } from "@/utils/types";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;

export const getQuestionExam = (code?: string) => api.get(`${EXAM_SESSION_URL}/${code}/questions`);

export const answerQuestionExam = (examCode: string, body: StudentAnswerRequest) => api.post(`${EXAM_SESSION_URL}/${examCode}/answer`, body);

export const getStudentExamResultPercentages = (examCode: string, studentExamSessionId?: number | string) =>
  api.get(`${EXAM_SESSION_URL}/${examCode}/results/percentages`, {
    params: { studentExamSessionId }
  })

export const finishExam = (code?: string) => api.post(`${EXAM_SESSION_URL}/${code}/finish`)
export const getResults = (code: string, studentExamSessionId?: number | string) =>
  api.get(`${EXAM_SESSION_URL}/${code}/results`, {
    params: { studentExamSessionId }
  });

export const getResultsLongTimeSpend = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/longTimeSpend`)
export const getResultsEffectSize = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/effectSize`)
export const getResultsTimeOrderQuestion = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/timelyOrderQuestion`)
export const getResultsCategories = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/categories`)

export const createConversationApi = (data : any) => 
    api.post(`${BASE_URL}/api/conversation`, data)

export const apiJoinExam = (code: any, auto?: boolean) => api.post(`${EXAM_SESSION_URL}/${code}/join`, null, {
    params: {
        auto
    }
})

export const pauseAndResumeExamApi = (examCode: string, body: PauseOrResumeExamRequest) => api.post(`${EXAM_SESSION_URL}/${examCode}/student-pause-resume`, body);

export const restartExamApi = (examCode: string, isDelete: boolean = false) =>
  api.post(`${EXAM_SESSION_URL}/${examCode}/student-restart`, undefined, {
    params: { isDelete }
  });

