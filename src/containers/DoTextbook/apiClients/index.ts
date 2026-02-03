import { BASE_URL } from "@/utils/constants";
import { api } from "@/services/api/apiClient";
import { ChangeAnswerTimeRequest } from "../config/types";
import { PauseOrResumeExamRequest, RestartTextbookRequest, StudentAnswerRequest } from "@/utils/types";

const TEXTBOOK_SESSION_URL = `${BASE_URL}/api/textbookSession`;
const TEXTBOOK_URL = `${BASE_URL}/api/textbook`;

export const studyTextbook = (textbookId: number) => api.post(`${TEXTBOOK_SESSION_URL}/study-textbook`);
export const answerQuestionTextbook = (textbookId: number, body: StudentAnswerRequest) => api.post(`${TEXTBOOK_SESSION_URL}/${textbookId}/answer`, body);
export const getQuestionsTextbookApi = (textbookId: number) => api.get(`${TEXTBOOK_SESSION_URL}/${textbookId}/textbook-questions`);
export const getPreparedTextbook = (textbookId: number) => api.get(`${TEXTBOOK_URL}/${textbookId}/`);
export const pauseOrFinished = (textbookId: number, body: ChangeAnswerTimeRequest) => api.post(`${TEXTBOOK_SESSION_URL}/${textbookId}/pause-or-terminate`, body);

export const pauseAndResumeTextbookApi = (textbookId: number, body: PauseOrResumeExamRequest) => api.post(`${TEXTBOOK_SESSION_URL}/${textbookId}/pause-resume`, body);
export const restartTextbookApi = (textbookId: number, data: RestartTextbookRequest) => api.post(`${TEXTBOOK_SESSION_URL}/${textbookId}/restart`, data);