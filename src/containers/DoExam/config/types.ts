import { ExamEditorType, ExamStatus, QuestionAnswerType } from "@/utils/enums"
import { CourseInfo } from "@/utils/types"


export type ExamResponse = {
    id?: number
    title: string
    duration: string
    type: ExamEditorType
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

export type QuestionResponse = {
    id: number
    answerCount: number
    selectedAnswers?: number[]
    textualAnswers?: string[]
    isStar: boolean
    duration: number
    classAverageTime?: number
    answerTime: string
    questionOrder: number
    questionAnswerType: QuestionAnswerType
    questionGroupId: number
}

export type StoredStudentAnswer = {
    lastAnswerTime: number
    questions: Question[]
}
export type QuestionGroupResponse = {
    id: number
    articles: any
    questions: QuestionResponse[]
}
export type Question = {
    id: number
    answerCount: number
    selectedAnswers?: number[]
    textualAnswers?: string[]
    isStar: boolean
    duration: number
    answerTime: number
    questionOrder: number
    questionIndex?: number
    questionAnswerType: QuestionAnswerType
    questionGroupId: number
}

export enum ResolveType {
    Empty = -1,
    VeryLow = 2,
    Low = 4,
    Medium = 6,
    High = 8,
    VeryHigh = 10
}

export enum AnswerResponseSignal{
    Purple,
    Red,
    Yellow,
    Green,
    Black
}
export type ExamQuestion = {
    questionId: number
    answer?: number
    textualAnswers?: string[]
}

export type StudentExamResult = {
    title: string
    durationInMinutes: number
    startTime: string
    endTime: string
    score: number
    totalQuestions: number
    percentageAmongStudents: number
    questionSolvingOrderEffeciency?: number
    courses: CourseInfo[]
    code: string
}

export type CategoryResponse = {
    id: number
    name: string
    totalQuestions: number
    totalCorrectQuestions: number
    totalAnsweredQuestions: number
    percentageAmongStudents: number
}
