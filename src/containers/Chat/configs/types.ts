import { MessageRequest, StudentsConversationResponse } from "@/utils/types"

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

export interface IChatHeaderProps {
    fullName?: string
    examTitle?: string
    createdAt?: string
    durationExam?: string
    score?: number | null
    totalScore?: number | null
    courseId?: number | null
    category?: string | null
    questionOrder?: number
    conversationId?: number
    isCompleted?: boolean
    teacherName?: string
    roles?: Array<string>
}

export interface IInputChatProps {
    text: string
    onSubmit: () => void
    onChangeInput: (text: string) => void
    isCompleted?: boolean
    handleUploadImage: () => void
}

export interface IChatListProps {
    messages?: IChatItemProps[]
    onReTrySendMessage?: () => void
    roles: Array<String>
    handleUpdateMessage: (conversationId: number, id: number, message: string, callback: any) => Promise<void>,
    handleDeleteMessage: (conversationId: number, id: number, callback: any) => Promise<void>,
}