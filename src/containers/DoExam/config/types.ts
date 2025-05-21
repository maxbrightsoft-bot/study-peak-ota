import { Question } from "@/utils/types";
import { ExamStatus, QuestionAnswerType } from "../../../utils/enums";

export type CategoryResponse = {
    id: number
    name: string
    totalQuestions: number
    totalCorrectQuestions: number
    totalAnsweredQuestions: number
    percentageAmongStudents: number
}

export type ExamResponse = {
    id?: number
    title: string
    duration: string
    type: string
    numberOfQuestion: number
    startTime: string
    code?: string
    createdAt?: string
    status?: ExamStatus
    lateStatus?: ExamStatus
    isLate: boolean
    startTimeSession: string
    lastAnswerTime: string
}

export type QuestionResponse = {
    id: number
    answerCount: number
    selectedAnswers: string
    correctAnswers: string
    isStar: boolean
    isCorrect: boolean
    duration: number
    classAverageTime?: number
    answerTime: string
    questionOrder: number
    articleNumber: number
    questionAnswerType: QuestionAnswerType
    textualAnswer?: string
}

export type StoredStudentAnswer = {
    lastAnswerTime: number
    questions: Question[]
}

export enum ResolveType {
    Empty = -1,
    VeryLow = 2,
    Low = 4,
    Medium = 6,
    High = 8,
    VeryHigh = 10
}
