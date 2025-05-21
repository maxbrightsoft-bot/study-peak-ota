import { api } from "@/services/apiClient";
import { BASE_URL } from "@/utils/constants";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;
const TEXTBOOK_SESSION_URL = `${BASE_URL}/api/textbooksession`

//Student
export const getResults = (code: string) =>
    api.get(`${EXAM_SESSION_URL}/${code}/results`);
export const getResultsLongTimeSpend = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/longTimeSpend`)
export const getResultsEffectSize = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/effectSize`)
export const getResultsTimeOrderQuestion = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/timelyOrderQuestion`)
export const getResultsCategories = (code: string) => api.get(`${EXAM_SESSION_URL}/${code}/results/categories`)
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
    