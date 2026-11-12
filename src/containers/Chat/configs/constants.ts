import { MessageSortBy, OrderBy } from "@/utils/enums"
import { ConversationFilter, MessageFilter } from "@/utils/types"

export const CONVERSATION_DEFAULT_FILTER: ConversationFilter = {
    currentPage: 1,
    pageSize: 10,
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
        label: "tab_all",
        value: "all",
        countColor: "#94A3B8",
    },
    {
        label: "tab_new",
        value: "new",
        countColor: "#B91C1C",
    },
    {
        label: "tab_unanswered",
        value: "unanswered",
        countColor: "#B45309",
    },
    {
        label: "tab_completed",
        value: "completed",
        countColor: "#94A3B8",
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

export enum ConversationCourseCategory {
    Default = 0,
    Class = 1,
    Course = 2,
    FullExam = 3,
    Sexual = 4,
    Etc = 5
}

export const categoriesData = [
    { id: 1, title: "full_exam", value: ConversationCourseCategory.FullExam },
    { id: 2, title: "sexual", value: ConversationCourseCategory.Sexual },
    { id: 3, title: "course", value: ConversationCourseCategory.Course },
    { id: 4, title: "class", value: ConversationCourseCategory.Class },
    { id: 5, title: "etc", value: ConversationCourseCategory.Etc },
]

export const getCategoryTitle = (t: any, category?: any) => {
    if (!category && category !== 0) return ''
    if (category === ConversationCourseCategory.Class || category === 'Class' || category === 'class' || category === 1 || category === '1') return t('class')
    if (category === ConversationCourseCategory.Course || category === 'Course' || category === 'course' || category === 2 || category === '2') return t('course')
    if (category === ConversationCourseCategory.FullExam || category === 'FullExam' || category === 'full_exam' || category === 3 || category === '3') return t('full_exam')
    if (category === ConversationCourseCategory.Sexual || category === 'Sexual' || category === 'sexual' || category === 4 || category === '4') return t('sexual')
    if (category === ConversationCourseCategory.Etc || category === 'Etc' || category === 'etc' || category === 5 || category === '5') return t('etc')
    return t(String(category))
}

