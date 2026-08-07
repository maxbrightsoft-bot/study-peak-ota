import { api } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"
import { ConversationFilter } from "@/utils/types"

const STUDENT_STATUS_URL =  `${BASE_URL}/api/user`
const CONVERSATION_URL = `${BASE_URL}/api/conversation`


export const getStudentConversationListApi = (query: ConversationFilter) => 
    api.get(`${STUDENT_STATUS_URL}/GetStudentConversations`, {params: query})

export const getListConversation = (query: ConversationFilter) =>
    api.get(`${CONVERSATION_URL}`, {
        params: query
    })
