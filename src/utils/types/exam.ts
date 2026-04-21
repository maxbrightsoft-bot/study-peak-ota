import { Action } from ".";
import { AnswerResponseSignal, ExamStatus, QuestionAnswerType, SubjectType } from "../enums";
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

export type ExamSessionResponse = {
    code: string;
    createdAt: string;
    id: number;
    duration: any;
    examCreatedAt: string;
    examId: number;
    questionCount: number
    score: number;
    startTime: string;
    status: ExamStatus;
    isLate: boolean
    teacher: any;
    courses: {id: number, name: string}[]
    subjectName: string
    startTimeSession: string
    studentStartTime: string
    title: string;
    rowVersion: string;
    isSelected: boolean
    attemptNumber: number
    lateStatus: ExamStatus
    studentAttemptNumber: number
    studentExamSessionId?: number
    totalStudentsJoined: number;
    totalStudentAttemptNumber: number;
    totalAttemptTime: number
    studentTotalAttemptTime: number
    type: SubjectType
    numberOfQuestion: number
    lastAnswerTime: string
    lastPausedAt: string
    lastResumedAt: string
    totalPausedTime: number
    runningTime: number
    totalAnsweredTime: number
    timestamp?: number
    studentName?: string
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
    answerResponseSignal: AnswerResponseSignal | null
    answerTime: string
    questionGroupIndex: number
    category: Category
    classAverageTime: any
    duration: any
    id: number
    isCorrect: boolean
    isStar: boolean
    score: number
    parentQuestionId: number
    parentQuestionOrder: number
    overallCorrectRate: number
    skipRate: number
    selectedAnswers?: any[]
    correctAnswers?: any[]
    correctTextualAnswers?: string[]
    textualAnswers?: string[]
    topDuration?: number | null
    questionOrder: number
    questionAnswerType?: QuestionAnswerType
    questionTypeCategories?: QuestionTypeCategoryResponse[]
}

export type ExamResult = {
    description: string
    duration: string
    finishTime: string
    subjectName: string
    id: number
    examSessionId: number
    image: string
    placeOrder: 1
    questions: Question[]
    questionGroups: QuestionGroupResponse[]
    score: number
    totalScore: number
    startTime: string
    studentStartTime: string
    status: number
    student: Student
    teacherAvatar: string
    teacherId: number
    teacherName: string
    title: string
    totalStudent: number
    totalTime: any
    type: number
    averageScores: number
    courses?: CourseInfo[]
    sessionCourses?: CourseInfo[]
    sessionStudentCourses?: CourseInfo[]
    totalCorrectRate: number
    studentAttemptNumber: number
    studentExamSessionId?: number
    totalStudentsJoined: number;
    totalStudentAttemptNumber: number;
    totalAttemptTime: number
    attemptNumber: number
    isSelected: boolean
    totalQuestions: number
    percentageAmongStudents: number
    questionSolvingOrderEfficiency?: number
    studentTotalAttemptTime: number
}

export type QuestionGroupResponse = {
    id: number
    questions: QuestionResponse[]
    articles: ArticleResponse[]
}

export type QuestionResponse = {
    id: number
    numberOfAnswers: number
    correctAnswers: number[]
    score: number
    questionOrder: number
    problemCategories: ProblemCategory[]
    recommendAnswerTime: number
    correctTextualAnswers: string[]
    questionAnswerType: QuestionAnswerType
    questionType: QuestionTypeResponse
    subquestions: QuestionResponse[]
    questionTypeCategories: QuestionTypeCategoryResponse[]
}

export enum ProblemCategory {
    General,
    Easy,
    Differential,
    Trick,
    Difficult,
    SuperDifficult
}

export type QuestionTypeCategoryResponse = {
    questionType: QuestionTypeResponse
    category: Category
    subcategory: Category
}

export type ArticleResponse = {
    id: number
    title: string
    author: string
    tag: string
    questionGroupId: number
    category: Category
    subcategory?: Category
    questionType?: QuestionTypeResponse
}
export type QuestionTypeResponse = {
    name: string
    id: number
    categoryPairs: CategoryPair[]
}

type CategoryPair = {
    Category: QuestionTypeCategoryData
    RootCategory: QuestionTypeCategoryData
}

type QuestionTypeCategoryData = {
    id: number
    name: string
}

export type EffectSize = {
    id: number
    questionOrder: number
    isCorrect: boolean
    correctRate: number
    selectedAnswers?: any[]
    correctAnswers?: any[]
    parentQuestionId?: number
    parentQuestionOrder?: number
    correctTextualAnswers?: string[]
    textualAnswers?: string[]
    answerResponseSignal: number | null
    problemCategories: number[]
    mostSelectedAnswers: string
    answersCount: number
    averageAnswers: number[]
    questionAnswerType?: QuestionAnswerType
}

export type OrderQuestion = {
    questionId: number
    parentQuestionId: number
    parentQuestionOrder: number
    questionOrder: number
    answerOrder: number | null
    topAnswerOrder: number | null
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

export type CourseInfo = {
    id: number
    name: string
}


export type OverallExamResultResponse = {
    data: OverallExamResultData[]
    maxData: OverallExamResultData
}

export type OverallExamResultData = {
    correctRate: number
    highLevelQuestions: number
    lowLevelQuestions: number
    totalAsteriskQuestions: number
    problemSolvingTime: number
    questionLongestTime: number
}

export type OverallCategoryData = {
    categoryId: number
    categoryName: string
    path: string
    totalCorrectQuestions: number
    avgCorrectQuestions: number
    totalQuestions: number
}

export type QuestionTimeCategoryData = {
    categoryId: number
    categoryName: string
    path: string
    questions: QuestionTime[]
}

export type QuestionTime = {
    questionId: number
    questionOrder: number
    time: number
    avgTime: number
}

export interface InfoExamSessionByCode {
  id: number
  code: string
  subject: string
  grade: number
  gradeYear: number
  classes: string[]
  teacherName: string
}