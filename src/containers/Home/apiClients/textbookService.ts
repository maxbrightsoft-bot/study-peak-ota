import { BASE_URL } from "@/utils/constants"
import { TextbookQuery } from "../configs/type"
import { api } from "@/services/api/apiClient"
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

export const getTextbookByIdApi = (textbookId: number) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${TEXTBOOK_SESSION_URL}/${textbookId}/student-textbook-detail`, {
        params: {
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};

export const startPageApi = (value : { textbookId: number, startPage?: number }) =>
    api.post(`${TEXTBOOK_SESSION_URL}/study-textbook`, { ...value })

export const getChapterResultApi = (chapterId: number) =>
    api.post(`${TEXTBOOK_SESSION_URL}/${chapterId}/results`)
