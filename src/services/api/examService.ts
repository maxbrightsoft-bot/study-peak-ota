import { BASE_URL } from "../../utils/constants";
import { api } from "./apiClient";

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`;

export const getCheckStatusExam = (examCode: string) => api.get(`${EXAM_SESSION_URL}/${examCode}/status`)