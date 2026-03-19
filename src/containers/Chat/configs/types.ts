import { ConversationsResponse, MessageRequest, StudentsConversationResponse } from "@/utils/types"

export type Course = {
    id: number,
    createdAt: string,
    name: string,
    startDate: string,
    endDate: string,
    totalStudents: number,
    totalTeachers: number,
    totalLessons: number,
    mainTeacherId: number,
    mainTeacherUserId: number,
    mainTeacherName: string,
    mainTeacherEmail: string,
    courseWeeklyDays: number | null
}

export interface IChatItemProps {
    id?: number
    isMe?: boolean
    avatar?: string
    content?: string
    createdAt: string
    sender?: StudentsConversationResponse
    isRead: boolean
    contentType?: number
    conversationId?: number
}

export interface IChatHeaderProps extends ConversationsResponse  {
    fullName?: string
    roles?: Array<string>
}

export interface IInputChatProps {
    text: string
    isSending: boolean
    onSubmit: (url?: string) => Promise<void>
    onChangeInput: (text: string) => void
    isCompleted?: boolean
    handleUploadImage: () => void
    handleUploadImageCanvas: (data: string, callback: any) => void,
    openSketchCanvasDialog: boolean,
    handleOpenSketchCanvasDialog: () => void,
    handleCloseSketchCanvasDialog: () => void
}

export interface IChatListProps {
    messages?: IChatItemProps[]
    isScrollToEnd: boolean
    onReTrySendMessage?: (
        url?: string) => Promise<void>
    handleToggleScrollToEnd: () => void
    roles: Array<String>
    handleUpdateMessage: (conversationId: number, id: number, message: string, callback: any) => Promise<void>,
    handleDeleteMessage: (conversationId: number, id: number, callback: any) => Promise<void>,
}

export type FilterValues = {
  questionId?: number,
  courseId?: number,
  examSessionId?: number
}