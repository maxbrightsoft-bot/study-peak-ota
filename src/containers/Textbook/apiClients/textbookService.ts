import { BASE_URL } from "@/utils/constants"
import { TextbookQuery } from "../configs/type"
import { api } from "@/services/api/apiClient"
import { RestartTextbookRequest } from "@/utils/types"
import { getIdLinkAccount } from "@/utils/helpers"

const TEXTBOOK_URL = `${BASE_URL}/api/textbooks/prepared-textbooks`
const TEXTBOOK_SESSION_URL = `${BASE_URL}/api/textbooksession`

export const getTextbookListApi = (query: TextbookQuery) => {
  const idLinkAccount = getIdLinkAccount();
  return api.get(`${TEXTBOOK_URL}`, {
    params: {
      ...query,
      ...(idLinkAccount ? { idLinkAccount } : {})
    }
  });
};

export const getTextbookByIdApi = (textbookId: number, studentId?: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${TEXTBOOK_SESSION_URL}/${textbookId}/student-textbook-detail`, {
        params: {
            studentId,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};

export const startTextbook = (textbookId: number) =>
    api.post(`${TEXTBOOK_SESSION_URL}/${textbookId}/start`)


export const startPageApi = (value: { textbookId: number, startPage?: number }) =>
    api.post(`${TEXTBOOK_SESSION_URL}/study-textbook`, { ...value })

export const getChapterResultApi = (chapterId: number) =>
    api.post(`${TEXTBOOK_SESSION_URL}/${chapterId}/results`)

export const restartTextbookApi = (textbookId: number, data: RestartTextbookRequest) => api.post(`${TEXTBOOK_SESSION_URL}/${textbookId}/restart`, data);

