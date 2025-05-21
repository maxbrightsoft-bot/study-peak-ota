import { QuestionAnswerType, TextbookEditorType } from "../../../utils/enums";

export interface SimplePreparedTextbookResponse {
  id: number;
  studentTextbookId: number;
  name: string;
  lastAnswerTime: string;
  startTime: string;
  totalAnswerTime: number;
  stopTime: string;
  type: TextbookEditorType;
}

export interface PreparedTextbookResponse {
  id: number;
  studentTextbookId: number;
  name: string;
  subject: SubjectResponse;
  isPrepared: boolean;
  preparedType: number;
  isbnIdentity: string;
  publisher: string;
  publicationDate: string;
  area: string;
  chapters: PreparedChapterResponse[];
  articles: PreparedArticleResponse[];
  questions: PreparedQuestionResponse[];
  lastAnswerTime: string;
  startTime: string;
}

export interface SubjectResponse {
  id: number;
  name: string;
  totalCategories: number;
  createdAt: string;
  superId: number;
}

export interface PreparedChapterResponse {
  id: number;
  name: string;
  pageFrom: number;
  pageTo: number;
  textbookId?: number | null;
  parentChapterId?: number | null;
}

export interface PreparedQuestionGroupResponse {
  id: number;
  name: string;
  chapterId: number;
  pageFrom?: number;
  pageTo?: number;
  chapterPageFrom: number;
  chapterPageTo: number;
  parentChapterPageFrom?: number;
  parentChapterPageTo?: number;
  questions: PreparedQuestionResponse[]
  articles: PreparedArticleResponse[]
}

export interface PreparedArticleResponse {
  id: number;
  title: string;
  author: string;
  tag: string;
  articleNumber: number;
  questionGroupId: number;
  chapterId: number;
  // category: CategoryResponse;
  categories: CategoryResponse[];
}

export interface CategoryResponse {
  parentCategoryId?: number | null;
  name: string;
  path: string;
  numberOfQuestions: number;
  numberOfChildren: number;
  id: number;
  subjectId: number;
  subjectName: string;
  superId: number;
}

export interface PreparedQuestionResponse {
  id: number;
  answerCount: number;
  chapterId: number;
  questionGroupId: number;
  selectedAnswers?: number[];
  textualAnswers?: string[]
  isStar: boolean;
  isCorrect: boolean;
  answerTime: number;
  duration: number;
  questionOrder: number;
  score: number;
  textualAnswer: string
  questionAnswerType: QuestionAnswerType
}

export type StoredStudentTextbookAnswer = {
  lastAnswerTime: number
  questions: PreparedQuestionResponse[]
}

export type ChangeAnswerTimeRequest = {
  totalAnswersTime: number,
  stopTime: string
}

export type TextbookQuestion = {
  questionId: number
  answer?: number
  textualAnswers?: string[]
}