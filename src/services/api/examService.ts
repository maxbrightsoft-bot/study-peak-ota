import { BASE_URL } from "../../utils/constants";
import { api } from "./apiClient";
import { getIdLinkAccount } from "../../utils/helpers";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;

export const getCheckStatusExam = (examCode: string, studentExamSessionId?: number) => api.get(`${EXAM_SESSION_URL}/${examCode}/status`, {
    params: {
        studentExamSessionId
    }
});

export const getExamInfoByCodeApi = (code: string) =>
    api.get(`${EXAM_SESSION_URL}/${code}/info`);

export const joinExamByCodeApi = (code: string, auto: boolean = true) =>
    api.post(`${EXAM_SESSION_URL}/${code}/join`, null, {
        params: { auto }
    });

export const getReceivedPopQuizzesApi = () => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${BASE_URL}/api/pop-quiz/received`, {
        params: {
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
