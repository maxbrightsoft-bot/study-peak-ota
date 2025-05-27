import { QuestionAnswerType } from "../enums"
import { Category } from "./exam"
import { UserResponse } from "./user"

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

export type Textbook = {
  id?: number;
  name: string;
  subjectId?: number | string;
  coverImage: string;
  chapters?: ChapterResponse[];
  preparedType: number;
  isbn: string;
  publicationDate: string;
  publisher: string;
  isPublic: boolean
  isShared?: boolean
  grade: string;
  subject?: Subject
  textbookOwners?: TextbookOwner[]
};

export type TextbookOwner = {
  email: string,
  academyId: number
  courseId: number
}

export type Subject = {
  id: number
  name: string
  totalCategories: number
  createdAt: string,
  superId: number
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

export type SubjectResponse = {
  id: number;
  name: string;
  createdAt?: string;
};


export type TextbookDetailResponse = {
  id?: number;
  name: string;
  subject?: SubjectResponse;
  chapters: ChapterResponse[];
  isCreatedByAdmin?: boolean;
  // createdAt?: string
  createdBy?: UserResponse
  isPrepared?: boolean
};

export type ChapterResponse = {
  id: number;
  parentChapterId?: number;
  name: string;
  pageFrom: number;
  pageTo: number;
  createdAt: string;
  subChapters: SubChapterResponse[];
  articles: ArticleResponse[];
};

export type ArticleResponse = {
  id?: number;
  articleNumber: number;
  questionCount: number;
  answerCount: number;
  chapterId: number;
  category?: CategoryResponse;
  questions: QuestionResponse[];
};


export type CategoryResponse = {
  parentCategoryId?: null;
  name?: string;
  path?: null;
  numberOfQuestions?: number;
  numberOfChildren?: number;
  id: number;
  subjectId?: number;
  totalQuestions?: number
  totalCorrectQuestions?: number
  totalAnsweredQuestions?: number
  percentageAmongStudents?: number
};

export type QuestionResponse = {
  id?: number;
  numberOfAnswers: number;
  correctAnswers: number[];
  score: number;
  questionOrder: number;
  questionAnswerType: QuestionAnswerType
};


export type SubChapterResponse = {
  id: number;
  name: string;
  pageFrom: number;
  pageTo: number;
  createdAt: string;
  subChapters: any[];
  articles: any[];
};

export type ArticleCreateRequest = {
  answerCount: number;
  questionCount: number;
  categoryId: number;
};

export type Profile = {
  id: number
  phoneNumber: string
  email: string,
  avatar: string
  fullName: string
  parentName: string
  parentPhoneNumber: string
  schoolName: string
  grade: number
  major: string
  academyDomain: string
  superId: number,
  createdAt: string
  subject: string
  classes: string[]
  roles: string[],
  isLearningSpace: boolean
}