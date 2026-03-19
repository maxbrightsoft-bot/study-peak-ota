import { ExamStatus, QuestionAnswerType } from "../enums"
import { Category, Question } from "./exam"
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
  id: number;
  name: string;
  subjectId?: number;
  coverImage: string;
  chapters: ChapterResponse[];
  preparedType: number;
  isbn: string;
  publicationDate: string;
  progress?: number
  publisher: string;
  subject?: Subject
  totalQuestions?: number
  subjectName?: string
  isShared?: boolean
  duration: number
  isStudying?: boolean
  totalUses: number
  createdBy: Profile
  createdAt: string
  completedQuestions: number
  textbookOwners: Profile[]
  limitedTimeInMinutes: number
  limitedQuestionCount: number
  rowVersion: string
  totalAnswerTime: number
  status: ExamStatus
  isMock: boolean
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
  audioUrls: string[]
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

export type StudentQuestionResult = Question & {
  categories: Category[]
  questionGroupId: number
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
  chapters: ChapterResponse[]
  isCreatedByAdmin?: boolean
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
  subChapters: ChapterResponse[];
  articles: ArticleResponse[];
  questionGroups?: QuestionGroupResponse[];
  accuracyRate: number
  completedChapterQuestions: number
  totalChapterQuestions: number

};

export type QuestionGroupResponse = {
  id: number
  pageFrom?: number
  pageTo?: number
}

export type ArticleResponse = {
  id?: number;
  articleNumber: number;
  questionCount: number;
  answerCount: number;
  chapterId: number;
  category?: CategoryResponse;
  questions: QuestionResponse[];
};


export interface CategoryResponse {
  id: number
  name: string
  totalQuestions: number
  totalCorrectQuestions: number
  totalAnsweredQuestions: number
  percentageAmongStudents: number
  questionIds: number[]
  totalSolvedTime: number
}

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

export type PauseOrResumeExamRequest = {
  rowVersion: string
  status: ExamStatus
  pauseTime: number
}

export type RestartTextbookRequest = {
  rowVersion?: string
  startPage?: number
  endPage?: number
}