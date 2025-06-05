import { Category, Question } from "@/utils/types";

export type FormatDataMyAnswer = { category: Category; questions: Question[] }

export type AnswerItemBaseProps =  {
  menuContextActions?: any
  isStudent?: boolean
  onOpenContextMenu?: (question: Question) => void
  onCloseContextMenu?: (question: Question) => void
}

export type StudentQuestionResult = Question & {
    categories: Category[]
    questionGroupId: number
}

export type FormatTextbookDataMyAnswer = { categories: Category[]; questions: StudentQuestionResult[], questionGroupId: number }