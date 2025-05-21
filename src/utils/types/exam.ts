import { Action } from ".";
import { AnswerResponseSignal, QuestionAnswerType } from "../enums";
import { Student } from "./user";

export type ExamSession = {
  code: string;
  createdAt: string;
  id: number;
  duration: number;
  examCreatedAt: string;
  examId: number;
  questionCount: number
  score: number;
  startTime: string;
  status: number;
  teacher: any;
  title: string;
  totalStudentsJoined: number;
  type: string
  courseName: string
  finishTime?: string
};

export type Category = {
  id: number;
  name: string;
  numberOfChildren?: number;
  numberOfQuestions?: number;
  parentCategoryId?: number | null;
  path?: string;
};

export type Question = {
  answerResponseSignal: AnswerResponseSignal | null;
  answerTime: string;
  article: number;
  category: Category;
  classAverageTime: any;
  duration: any;
  id: number;
  score?: number
  isCorrect: boolean;
  answerCount: number
  textualAnswer?: string
  isStar: boolean;
  overallCorrectRate: number;
  selectedAnswers?: number[] | string
  correctAnswers?: number[] | string
  topDuration?: number | null
  questionOrder: number
  questionAnswerType: QuestionAnswerType
  textualAnswers?: string[]
  correctTextualAnswers?: string[]
};

export type ExamResult = {
  description: string;
  duration: string;
  finishTime: string;
  id: number;
  examSessionId: number;
  image: string;
  placeOrder: 1;
  questions: Question[];
  score: number;
  startTime: string;
  status: number;
  student: Student;
  teacherAvatar: string;
  teacherId: number;
  teacherName: string;
  title: string;
  totalStudent: number;
  totalTime: any;
  type: string
};

export type CategoryResponse = {
  id: number
  name: string
  totalQuestions: number
  totalCorrectQuestions: number
  totalAnsweredQuestions: number
  percentageAmongStudents: number
}

export type EffectSize = {
    id: number;
    questionOrder: number;
    article: number;
    isCorrect: boolean;
    selectedAnswers: string;
    correctAnswers: string;
    answerResponseSignal: number | null;
    problemCategories: number[];
    mostSelectedAnswers: string;
    questionAnswerType?: QuestionAnswerType

}

export type OrderQuestion = {
    questionId: number;
    questionOrder: number;
    answerOrder: number | null;
    topAnswerOrder: number | null;
}

export type TimelyOrderQuestion = {
    categoryId: number;
    categoryName: string;
    article: number;
    questions: OrderQuestion[]
}

export type LongTimeSpendQuestion = {
    id: any;
    questionOrder: any;
    duration: any
    topDuration?: any;
    questionText?: string
}

export type QuestionData = {
  id: number
  questionOrder: number
}

export interface AnswerItemBaseProps {
  menuContextActions?: Action<Question>[]
  isStudent?: boolean
  onOpenContextMenu?: (question: Question) => void
  onCloseContextMenu?: (question: Question) => void
}
