import { Category, EffectSize, Question } from "@/utils/types";

export type FormatDataMyAnswer = { category: Category; questions: Question[] }
export type FormatTextbookDataMyAnswer = { categories: Category[]; questions: StudentQuestionResult[], questionGroupId: number }

export type StudentQuestionResult = Question & {
    categories: Category[]
    questionGroupId: number
}

export interface AnswerItemProps {
    data: Question
    nextData?: Question
    isLast?: boolean
    index: number
    isFirst?: boolean
    effectSize?: EffectSize
}

export interface TextbookAnswerItemProps {
    data: StudentQuestionResult
    nextData?: StudentQuestionResult
    isLast?: boolean
    isFirst?: boolean
    questionGroupId: number
    effectSize?: EffectSize
}