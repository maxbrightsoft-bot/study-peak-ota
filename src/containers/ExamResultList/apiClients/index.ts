import { api, apiUpload } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"
import { StudentAnswerRequest } from "@/utils/types"

const EXAM_SESSION_URL = `${BASE_URL}/api/examSession`

export const getListExamApi = (query: any) =>
    api.get(`${EXAM_SESSION_URL}`, {
        params: {
            ...query,
            roles: ["Student"]
        }
    })

// Unified history (exam + textbook), grouped by month
export const getLiveHistoryGroupsApi = (query: any) =>
    api.get(`${EXAM_SESSION_URL}/live-history/groups`, { params: query })

export const getLiveHistoryDetailsApi = (query: any) =>
    api.get(`${EXAM_SESSION_URL}/live-history/details`, { params: query })

export const getExamResult = (examCode?: string) => api.get(`${EXAM_SESSION_URL}/${examCode}/results`)

export const apiUploadImageFile = (file: FormData) =>
    apiUpload.post(`${BASE_URL}/api/file/images`, file)

export const getQuestionExam = (code?: string) => api.get(`${EXAM_SESSION_URL}/${code}/questions`);

export const answerQuestionExam = (examCode: string, body: StudentAnswerRequest) => api.post(`${EXAM_SESSION_URL}/${examCode}/answer`, body);

export const finishExam = (code?: string) => api.post(`${EXAM_SESSION_URL}/${code}/finish`)
export const createConversationApi = (data: any) =>
    api.post(`${BASE_URL}/api/conversation`, data)


