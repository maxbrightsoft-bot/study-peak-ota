import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { getIdLinkAccount } from "@/utils/helpers";
import { ExamFormRequest, ExamResultRequest } from "../configs/types";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;
const TEXTBOOK_SESSION_URL = `${BASE_URL}/api/textbooksession`

//Student
export const getResults = (code: string, data: ExamResultRequest) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results`, {
        params: {
            ...data,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getResultsLongTimeSpend = (code: string, data: ExamResultRequest) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/longTimeSpend`, {
        params: {
            ...data,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getResultsEffectSize = (code: string, data: ExamResultRequest) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/effectSize`, {
        params: {
            ...data,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getResultsTimeOrderQuestion = (code: string, data: ExamResultRequest) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/timelyOrderQuestion`, {
        params: {
            ...data,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getResultsCategories = (code: string, data: ExamResultRequest) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/categories`, {
        params: {
            ...data,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getChapterResultsApi = (chapterId: number, studentId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results`, {
        params: {
            studentId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getChapterResultsLongTimeSpendApi = (chapterId: number, studentId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/longTimeSpend`, {
        params: {
            studentId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getChapterResultsEffectSizeApi = (chapterId: number, studentId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/effectSize`, {
        params: {
            studentId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getChapterResultsTimeOrderQuestionApi = (chapterId: number, studentId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/timelyOrderQuestion`, {
        params: {
            studentId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getChapterResultsCategoriesApi = (chapterId: number, studentId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${TEXTBOOK_SESSION_URL}/${chapterId}/results/categories`, {
        params: {
            studentId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};

// Textbook-level results (used by history: aggregated by the day the student answered)
export const getTextbookResultsApi = (textbookId: number, studentId?: number, date?: string) =>
    api.get(`${TEXTBOOK_SESSION_URL}/textbook/${textbookId}/results`, { params: { studentId, date } })
export const getTextbookResultsLongTimeSpendApi = (textbookId: number, studentId?: number, date?: string) =>
    api.get(`${TEXTBOOK_SESSION_URL}/textbook/${textbookId}/results/longTimeSpend`, { params: { studentId, date } })
export const getTextbookResultsEffectSizeApi = (textbookId: number, studentId?: number, date?: string) =>
    api.get(`${TEXTBOOK_SESSION_URL}/textbook/${textbookId}/results/effectSize`, { params: { studentId, date } })
export const getTextbookResultsTimeOrderQuestionApi = (textbookId: number, studentId?: number, date?: string) =>
    api.get(`${TEXTBOOK_SESSION_URL}/textbook/${textbookId}/results/timelyOrderQuestion`, { params: { studentId, date } })
export const getTextbookResultsCategoriesApi = (textbookId: number, studentId?: number, date?: string) =>
    api.get(`${TEXTBOOK_SESSION_URL}/textbook/${textbookId}/results/categories`, { params: { studentId, date } })

export const getOverallResultsApi = (code: string, studentExamSessionId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/overall`, {
        params: {
            studentExamSessionId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getOverallQuestionTypesResultsApi = (code: string, studentExamSessionId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/overall-questionTypes`, {
        params: {
            studentExamSessionId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getOverallResultsTeacherApi = (id: number, studentId: number) => api.get(`${EXAM_SESSION_URL}/${id}/results/overall/${studentId}`)
export const getOverallCategoriesResultsApi = (code: string, studentExamSessionId?: number, useSubcategories?: boolean) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/overall-categories`, {
        params: {
            useSubcategories,
            studentExamSessionId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getOverallCategoriesResultsTeacherApi = (id: number, studentId: number) => api.get(`${EXAM_SESSION_URL}/${id}/results/overall-categories/${studentId}`)
export const getQuestionTimeCategoriesResultsApi = (code: string, studentExamSessionId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/question-times`, {
        params: {
            studentExamSessionId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const getQuestionTimeCategoriesResultsTeacherApi = (id: number, studentId: number) => api.get(`${EXAM_SESSION_URL}/${id}/results/question-times/${studentId}`)
export const getLatestSessionApi = (code: string) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${EXAM_SESSION_URL}/${code}/results/latest`, {
        params: {
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
