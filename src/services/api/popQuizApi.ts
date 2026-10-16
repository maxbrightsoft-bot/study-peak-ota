import { api } from '@/services/api/apiClient';
import { getIdLinkAccount } from '@/utils/helpers';

const EXAM_URL = '/api/exam';
const POP_QUIZ_URL = '/api/pop-quiz';

export const getRecentPopQuizzesApi = (pageSize?: number) => {
    return api.get(`${POP_QUIZ_URL}/recent`, {
        params: {
            pageSize
        }
    });
};

export const getPopQuizLiveStatusApi = () => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${POP_QUIZ_URL}/live-status`, {
        params: {
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};

export const joinPopQuizApi = (code: string) =>
    api.post(`${EXAM_URL}/pop-quiz/join`, { code });

export const getMyPopQuizzesApi = () => {
    return api.get(`${POP_QUIZ_URL}/my`);
};

export const createPopQuizApi = (data: any) =>
    api.post(`${POP_QUIZ_URL}`, data);

export const startPopQuizSessionApi = (examId: number, courseIds: number[] = []) =>
    api.post(`${POP_QUIZ_URL}/${examId}/session`, { courseIds });

export const endPopQuizSessionApi = (examId: number, status: string | number) =>
    api.put(`${POP_QUIZ_URL}/${examId}/session/end`, { status });

export const getExamByIdApi = (id: number) =>
    api.get(`${EXAM_URL}/${id}`);

export const updatePopQuizAnswersApi = (examId: number, data: { questionId: number; questionAnswerType: number; correctAnswers?: number[]; correctTextualAnswers?: string[] }) =>
    api.put(`${EXAM_URL}/${examId}/change-correct-answer`, data);
