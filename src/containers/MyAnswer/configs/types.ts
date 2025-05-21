import { Category, Question, StudentQuestionResult } from "@/utils/types";

export type FormatDataMyAnswer = { category: Category; questions: Question[] }

export type AnswerItemBaseProps =  {
  menuContextActions?: any
  isStudent?: boolean
  onOpenContextMenu?: (question: Question) => void
  onCloseContextMenu?: (question: Question) => void
}

export type FormatTextbookDataMyAnswer = { categories: Category[]; questions: StudentQuestionResult[], questionGroupId: number }