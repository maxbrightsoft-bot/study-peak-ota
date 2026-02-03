import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { ExamResultRequest } from "../configs/types";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;
const TEXTBOOK_SESSION_URL = `${BASE_URL}/api/textbooksession`

//Student
export const getResults = (code: string, data: ExamResultRequest) =>
    api.get(`${EXAM_SESSION_URL}/${code}/results`, { params: data });
export const getResultsLongTimeSpend = (code: string, data: ExamResultRequest) => api.get(`${EXAM_SESSION_URL}/${code}/results/longTimeSpend`, { params: data })
export const getResultsEffectSize = (code: string, data: ExamResultRequest) => api.get(`${EXAM_SESSION_URL}/${code}/results/effectSize`, { params: data })
export const getResultsTimeOrderQuestion = (code: string, data: ExamResultRequest) => api.get(`${EXAM_SESSION_URL}/${code}/results/timelyOrderQuestion`, { params: data })
export const getResultsCategories = (code: string, data: ExamResultRequest) => api.get(`${EXAM_SESSION_URL}/${code}/results/categories`, { params: data })
export const getChapterResultsApi = (chapterId: number, studentId?: number) =>
    api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results`, {
        params: {
            studentId
        }
    })
export const getChapterResultsLongTimeSpendApi = (chapterId: number, studentId?: number) =>
    api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/longTimeSpend`, {
        params: {
            studentId
        }
    })
export const getChapterResultsEffectSizeApi = (chapterId: number, studentId?: number) =>
    api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/effectSize`, {
        params: {
            studentId
        }
    })
export const getChapterResultsTimeOrderQuestionApi = (chapterId: number, studentId?: number) =>
    api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/timelyOrderQuestion`, {
        params: {
            studentId
        }
    })
export const getChapterResultsCategoriesApi = (chapterId: number, studentId?: number) =>
    api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/categories`, {
        params: {
            studentId
        }
    })

export const getOverallResultsApi = (code: string, studentExamSessionId?: number) => api.get(`${EXAM_SESSION_URL}/${code}/results/overall`, {
    params: {
        studentExamSessionId
    }
})
export const getOverallQuestionTypesResultsApi = (code: string, studentExamSessionId?: number) => api.get(`${EXAM_SESSION_URL}/${code}/results/overall-questionTypes`, {
    params: {
        studentExamSessionId
    }
})
export const getOverallResultsTeacherApi = (id: number, studentId: number) => api.get(`${EXAM_SESSION_URL}/${id}/results/overall/${studentId}`)
export const getOverallCategoriesResultsApi = (code: string, studentExamSessionId?: number, useSubcategories?: boolean) => api.get(`${EXAM_SESSION_URL}/${code}/results/overall-categories`, { params: { useSubcategories, studentExamSessionId } })
export const getOverallCategoriesResultsTeacherApi = (id: number, studentId: number) => api.get(`${EXAM_SESSION_URL}/${id}/results/overall-categories/${studentId}`)
export const getQuestionTimeCategoriesResultsApi = (code: string, studentExamSessionId?: number) => api.get(`${EXAM_SESSION_URL}/${code}/results/question-times`, {
    params: {
        studentExamSessionId
    }
})
export const getQuestionTimeCategoriesResultsTeacherApi = (id: number, studentId: number) => api.get(`${EXAM_SESSION_URL}/${id}/results/question-times/${studentId}`)

