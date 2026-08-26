import { AnswerRequest } from "@/utils/types";
import { ExamStatus, QuestionAnswerType, SubjectType, TextbookEditorType } from "../../../utils/enums";

export interface SimplePreparedTextbookResponse {
  id: number;
  studentTextbookId: number;
  name: string;
  lastAnswerTime: string;
  lastPausedAt: string;
  lastResumedAt: string;
  lastPausedTime: string;
  lastResumedTime: string;
  totalPausedTime: number
  startTime: string;
  totalAnswerTime: number;
  stopTime: string;
  type: SubjectType;
  status: ExamStatus
  isMock: boolean
  duration: number
  subject: any
  rowVersion: string
  timestamp?: number
  chapters?: PreparedChapterResponse[]
}

export enum ScrollType {
  FIRST,
  PREV,
  NEXT,
  LAST
}

export type StudentTextbookAnswerRequest = {
  lastAnswerTime: number
  questions: AnswerRequest[]
  timezone?: string
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
  rowVersion: string
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
  subChapters?: PreparedChapterResponse[];
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
  questionGroupId: number;
  chapterId: number;
  category: CategoryResponse;
  subcategory: CategoryResponse;
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
  questionIndex?: number
  questionAnswerType: QuestionAnswerType
  unit?: string
  parentQuestionId?: number
  parentQuestionOrder?: number
}

export type StoredStudentTextbookAnswer = {
  lastAnswerTime: number
  questions: PreparedQuestionResponse[]
}

export type ChangeAnswerTimeRequest = {
  stopTime: string
}

export type TextbookQuestion = {
  questionId: number
  answer?: number
  textualAnswers?: string[]
}