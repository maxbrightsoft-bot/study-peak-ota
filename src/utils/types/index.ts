import { OrderBy } from '../enums'

export type PagingResponse = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type Notification = {
  id: number;
  name: string;
  content: string;
  type?: number;
  createdAt: string;
  notificationTypes: any;
};

export type AnswerRequest = {
  questionId: number
  selectedAnswers?: number[]
  duration: number
  isStar: boolean
  answerTime: number
  textualAnswers?: string[]
}

export type StudentAnswerRequest = {
  lastAnswerTime: number
  questions: AnswerRequest[]
  totalAnswerTime?: number
}

export type Option = {
  label: string
  value: any
}

export type Language = {
  code: string
  name: string
  fullName: string
  shortName: string
  nativeName: string
  image: string
  momentLangCode: string
}

export type Action<T> = {
  label: string
  startIcon?: JSX.Element
  endIcon?: JSX.Element
  style?: any
  textStyle?: any
  onPress?: any
}

export interface BaseSearchQuery<T> {
  textSearch?: string
  currentPage?: number
  pageSize?: number
  sortColumnDirection?: OrderBy
  sortColumnName?: T
}

export enum PrintState {
    Default,
    Printing,
    Pending,
    Printed
}

export * from './academy'
export * from './pusher'
export * from './login'
export * from './user'
export * from './textbook'
export * from './exam'
export * from './note'
export * from './chat'