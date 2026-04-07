import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { ExamFormRequest } from "../configs/types";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;

export const getStudentHistoryApi = (examSessionId: number | string, query?: any) => 
    api.get(`${EXAM_SESSION_URL}/${examSessionId}/student-sessions`, { params: query });

export const deleteStudentExamSessionApi = (examSessionId: number | string, studentExamSessionId: number | string) => 
    api.delete(`${EXAM_SESSION_URL}/${examSessionId}/student-sessions/${studentExamSessionId}`);

export const hideStudentExamSessionApi = (code: string, payload: ExamFormRequest) => 
    api.post(`${EXAM_SESSION_URL}/${code}/hide`, payload);

export const selectStudentExamSessionApi = (code: string, studentExamSessionId: number | string) => 
    api.post(`${EXAM_SESSION_URL}/${code}/student-sessions/${studentExamSessionId}/select`);
