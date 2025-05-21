import { BASE_URL } from "@/utils/constants"
import { TextbookQuery } from "../configs/type"
import { api } from "@/services/apiClient"

const TEXTBOOK_URL = `${BASE_URL}/api/textbooks/prepared-textbooks`
const TEXTBOOK_SESSION_URL = `${BASE_URL}/api/textbooksession`

export const getTextbookListApi = (query: TextbookQuery) =>
    api.get(`${TEXTBOOK_URL}`, { params: query })

export const getTextbookByIdApi = (textbookId: number) =>
    api.get(`${TEXTBOOK_SESSION_URL}/${textbookId}/student-textbook-detail`)

export const startPageApi = (value : { textbookId: number, startPage?: number }) =>
    api.post(`${TEXTBOOK_SESSION_URL}/study-textbook`, { ...value })

export const getChapterResultApi = (chapterId: number) =>
    api.post(`${TEXTBOOK_SESSION_URL}/${chapterId}/results`)
