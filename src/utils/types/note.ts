import { BaseSearchQuery } from "."
import { NoteSortColumn, NoteType } from "../enums"

export type NoteResponse = {
  id: number
  content: string
  fullName: string
  email: string
  questionId?: number
  parentQuestionId?: number
  questionOrder?: number
  parentQuestionOrder?: number
  questionGroupIndex?: number
  createdAt?: string
  categoryName?: string
  examSessionId?: number
  userId: number;
  isOwned: boolean;
  type?: NoteType
  sender: NoteUserInfo
  imageUrl?: string
  title?: string
  page?: number
  score: number
  subjectName?: string
  receiver?: NoteUserInfo
  receivers?: NoteUserInfo[]
  totalUsers: number
  isMentionAll: boolean
  isStudentNote: boolean
  mentionUsers: MentionUser[]
}

export type GroupedNoteResponse = {
  subjectName: string
  categoryName: string
  latestScore?: number
  latestCreatedAt: string
  totalNotes: number
  notes: NoteResponse[]
}

export type MentionUser = {
  fullName: string
  email: string
}

export type NoteUserInfo = {
  id: number
  email: string
  fullName: string
  grade?: number
  gradeYear?: number
  phoneNumber?: string
  parentPhoneNumber?: string
  schoolName?: string
}

export type NoteRequest = {
  examSessionId?: number
  questionId?: number
  studentId?: number
  student?: any
  content: string
  type?: NoteType
  noteUserIds?: number[]
  users?: any[]
  mentionIds?: number[]
  isMentionAll?: boolean
  studentExamSessionId?: any
  studentTextbookSessionId?: number
  imageUrl?: string
}

export interface NoteSearchQuery extends BaseSearchQuery<NoteSortColumn> {
  examCode?: string
  studentId?: number
  examSessionId?: number
  IsOwned?: boolean
  studentExamSessionId?: string
  studentTextbookSessionId?: number
  types?: NoteType[]
  
  // New Filter Parameters for Incorrect Notes
  subjectNames?: string[]
  categoryNames?: string[]
  examTypes?: number[]
  startDate?: string
  endDate?: string
  hasMemoOrImage?: boolean
}