import { BaseSearchQuery } from "."
import { NoteSortColumn, NoteType } from "../enums"

export type NoteResponse = {
  id: number
  content: string
  fullName: string
  questionId?: number
  questionOrder?: number
  articleNumber?: number
  createdAt?: string
  categoryName?: string
  examSessionId?: number
  userId: number;
  isOwned: boolean;
  type?: NoteType
}

export type NoteRequest = {
  examSessionId?: number
  questionId?: number
  studentId?: number
  content: string
  type?: NoteType
}

export interface NoteSearchQuery extends BaseSearchQuery<NoteSortColumn> {
  examCode?: string
  studentId?: number
  examSessionId?: number
  IsOwned?: boolean
  type?: NoteType
}