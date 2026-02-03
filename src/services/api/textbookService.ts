import { BASE_URL } from "@/utils/constants";
import { api } from "./apiClient";

const TEXTBOOK_SESSION_URL = `${BASE_URL}/api/textbookSession`;

export const checkTextbookApi = (textbookId: number) => api.post(`${TEXTBOOK_SESSION_URL}/${textbookId}/check`);