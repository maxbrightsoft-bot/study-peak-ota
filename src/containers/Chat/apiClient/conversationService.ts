import { api, apiUpload } from "@/services/apiClient"
import { BASE_URL } from "@/utils/constants"
import { ConversationFilter, MessageFilter, MessageRequest } from "@/utils/types"

const CONVERSATION_URL = `${BASE_URL}/api/conversation`

export const getListConversation = (query: ConversationFilter) =>
    api.get(`${CONVERSATION_URL}`, {
        params: query
})

export const createConversation = (studentId: number) =>
    api.post(`${CONVERSATION_URL}`, {
        targetUserId: `${studentId}`
    })

export const deleteMessage = (conversationId: number, messageId: number) =>
    api.delete(`${CONVERSATION_URL}/${conversationId}/message/${messageId}`)

export const updateMessage = (conversationId: number, messageId: number, content: string) =>
    api.put(`${CONVERSATION_URL}/${conversationId}/message/${messageId}`, { content })

export const apiAddMessage = (
    conversationId: number,
    message: MessageRequest
) => api.post(`${CONVERSATION_URL}/${conversationId}/messages`, message)

export const getMessagesByConversation = (
    conversationId: number,
    filter: MessageFilter
) =>
    api.get(`${CONVERSATION_URL}/${conversationId}/messages`, {
        params: filter
    })

export const updateLastTimeReadConversation = (
    conversationId: number
) =>
    api.put(`${CONVERSATION_URL}/${conversationId}`)

export const getImage = (content: string) =>
    api.get(`${content}`, {
        headers: {
            "Content-Type": "application/png"
        }
    })

export const completeConversation = (conversationId: number) =>
    api.post(`${CONVERSATION_URL}/${conversationId}/finish`)

export const apiMarkReadMessage = (conversationId: number, messageId: number) =>
    api.put(
        `${CONVERSATION_URL}/${conversationId}/messages/${messageId}/mark-read`
    )

export const apiGetConversationByUserId = (userId: number) =>
    api.get(`${CONVERSATION_URL}/users/${userId}`)

export const apiUploadImageFile = (file: FormData) =>
    apiUpload.post(`${BASE_URL}/api/file/images`, file)
