import { MessageSortBy, OrderBy } from "@/utils/enums"
import { ConversationFilter, MessageFilter } from "@/utils/types"

export const CONVERSATION_DEFAULT_FILTER: ConversationFilter = {
    currentPage: 1,
    pageSize: -1,
    sortColumnName: MessageSortBy.CreatedAt,
    sortColumnDirection: OrderBy.DESC,
}

export const MESSAGE_DEFAULT_FILTER: MessageFilter = {
    currentPage: 1,
    pageSize: 15,
    textSearch: "",
    sortColumnDirection: OrderBy.DESC,
    sortColumnName: MessageSortBy.CreatedAt
}

export const COMPLETED_CONVERSATION_EVENT = 'completed-conversation-event'
export const UNREAD_MESSAGE_COUNT_EVENT = 'unread-messages-count-event'
export const NEW_MESSAGE_CONVERSATIONS_EVENT = 'new-message-conversations-event'
export const NEW_MESSAGE_EVENT = 'new-message-event'
export const NEW_CONVERSATION_EVENT = 'new-conversation-event'
export const DELETE_MESSAGE_EVENT = 'delete-message-event'
export const UPDATE_MESSAGE_EVENT = 'update-message-event'
export const MESSAGE_CONVERSATION_EVENT = 'message-conversation-event'
export const MESSAGE_CONVERSATION_READ_EVENT = 'message-conversation-read-event'

export const TabList = [
    {
        label: "entire",
        value: 0,
    },
    {
        label: "consulting",
        value: 1,
    },
    {
        label: "consulting_completed",
        value: 2,
    },
]

export const ConversationEvents = [
    COMPLETED_CONVERSATION_EVENT,
]

export const MessageEvents = [
    NEW_MESSAGE_EVENT,
    COMPLETED_CONVERSATION_EVENT,
    NEW_CONVERSATION_EVENT,
    DELETE_MESSAGE_EVENT,
    UPDATE_MESSAGE_EVENT
]

export const MessageConversationEvents = [
    UNREAD_MESSAGE_COUNT_EVENT,
    NEW_MESSAGE_CONVERSATIONS_EVENT
]

export const MessageConversationEvents2 = [
    MESSAGE_CONVERSATION_EVENT,
    MESSAGE_CONVERSATION_READ_EVENT
]

