import { QuestionAnswerType } from "../enums"
import { Category } from "./exam"

export type TextbookResponse = {
  id: number
  name: string
  coverImage: string
  createdAt: string
  totalUses: number
  completedQuestions: number
  totalQuestions: number
  lastAnswerTime: string
  isPublic: boolean
  isPrepared: boolean
  isStudying: boolean
  totalAnswerTime: number
}

export type TextbookResult = {
  id: number
  chapterName: string
  parentChapterName: string | null
  className: string
  startTime: string
  totalTime: number
  totalQuestions: number
  score: number
  studentTextbookSessionId: number
  studentQuestionResults: StudentQuestionResult[]
}

export type StudentQuestionResult = {
  id: number
  questionGroupId: number
  selectedAnswers?: number[] | string
  correctAnswers?: number[] | string
  textualAnswers?: string[]
  correctTextualAnswers?: string[]
  isStar: boolean
  duration: number
  classAverageTime: number
  topDuration: number | null
  answerResponseSignal: number
  isCorrect: boolean
  answerTime: string
  article: number
  score: number
  questionAnswerType: QuestionAnswerType
  categories: Category[]
  overallCorrectRate: number
  questionOrder: number
}