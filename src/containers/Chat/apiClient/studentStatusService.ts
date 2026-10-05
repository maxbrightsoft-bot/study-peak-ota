import { api } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"
import { ConversationFilter } from "@/utils/types"
import { ConversationType } from "@/utils/enums"

const STUDENT_STATUS_URL =  `${BASE_URL}/api/user`
const CONVERSATION_URL = `${BASE_URL}/api/conversation`


export const getStudentConversationListApi = (query: ConversationFilter) => 
    api.get(`${STUDENT_STATUS_URL}/GetStudentConversations`, {params: query})

export const getListConversation = (query: ConversationFilter) =>
    api.get(`${CONVERSATION_URL}`, {
        params: query
    })

export const getLastConversationByCourseApi = (courseId: number) =>
    api.get(`${CONVERSATION_URL}`, {
        params: {
            courseId,
            currentPage: 1,
            pageSize: 1,
            sortColumnDirection: "DESC"
        }
    })

export const getLastGeneralConversationApi = () =>
    api.get(`${CONVERSATION_URL}`, {
        params: {
            isGeneral: true,
            type: ConversationType.General,
            currentPage: 1,
            pageSize: 1,
            sortColumnDirection: "DESC"
        }
    })

