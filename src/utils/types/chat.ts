import { UserResponse } from '@/utils/types';
import { ExamStatus, MessageSortBy, OrderBy } from "../enums"

export type ConversationResponse = {
  id: number
  student: UserResponse
  teacher: UserResponse
  lastMessage: MessageResponse
  totalUnReadMessage: number
}

export type ConversationsResponse = {
  id: number
  studentExamSessionId?: number
  courseId: number | null
  courseTitle: string | null
  score?: number | null
  totalScore?: number | null
  studentId: number
  category?: string | null
  question: ConversationQuestion
  isCompleted: boolean
  completedAt: string
  totalUnReadMessage: number
  lastMessage: string | null
  examTitle: string
  examId: number
  examSessionId?: number
  studentTextbookSessionId?: number
  duration: string
  startTime: string
  examCreatedAt: string
  createdAt: string
  teacherName: string
  textbookId: number
  textbookName: string
}

export type ConversationQuestion = {
  id: number
  title: string
  articleNumber: number
  questionOrder: number
}

export type ConversationFilter = {
  currentPage: number
  pageSize: number
  textSearch?: string
  hasConversation?: boolean
  studentId?: number
  sortColumnName?: string,
  sortColumnDirection?: string
}

export declare type StudentConversationFilter = {
  currentPage: number;
  pageSize: number;
  textSearch: string;
  hasConversation?: boolean;
  sortColumnName?: string;
  sortColumnDirection?: string;
};

export type ExamResponse = {
  id: number
  examId: number
  title: string
  code: string
  description: string
  type: string
  createdBy: {
      id: number,
      phoneNumber: string,
      email: string,
      avatar: string,
      fullName: string,
      schoolName: string
  },
  teacher: {
      id: number,
      phoneNumber?: string,
      email: string,
      avatar: string,
      fullName: string,
      schoolName: string
  },
  imageUrl: string
  questionCount: number
  duration: string
  createdAt: Date
  examCreatedAt: Date
  startTime: Date
  status: number
  totalStudentsJoined: number
}

export type MessageFilter = {
  currentPage?: number
  pageSize?: number
  textSearch?: string
  sortColumnDirection?: OrderBy
  sortColumnName?: MessageSortBy
  examId?: number
  beforeDate?: string
  totalItems?: number
  totalPages?: number
}

export type MessageResponse = {
  id?: number
  conversationId?: number
  content: string
  isRead: boolean
  isStudent: boolean
  readAt?: string
  createdAt: string
  sender?: StudentsConversationResponse
}

export type UploadFileResponse = {
  fileName?: any
  uploaded: number
  url: string
}

export type StudentsConversationResponse = {
  id: number
  avatar: string
  grade: string
  email?: string
  major?: string
  fullName: string
  parentName?: string
  schoolName?: string
}

export type MessageRequest = {
  content: string
  examId?: number
  parentId?: number
  parentContent?: string
  examTitle?: string
  examCode?: string
  contentType?: number
}

export enum MessageAction {
  Default,
  Took
}

export enum MessageSourceType {
  Default,
  Exam,
  Class
}

export type ExamFilter = {
  currentPage: number
  pageSize: number
  sortColumnName: string
  textSearch: string
  sortColumnDirection: string
  statuses?: ExamStatus[]
}

export type Option = {
  value: number
  label: string
}