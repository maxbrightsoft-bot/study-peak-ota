import { OrderBy } from "@/utils/enums";
import { ExamSession } from "@/utils/types";

export type Category = {
  id: number;
  name: string;
  numberOfChildren?: number;
  numberOfQuestions?: number;
  parentCategoryId?: number | null;
  path?: string;
};

export type ExamSessionData = {
  code: string
}

export type GroupExamSession = {
  [key: string]: ExamSession[]
}

export type OverallQuestionTypeData = {
    name: string
    questionTypeId: number
    totalCorrectQuestions: number
    avgCorrectQuestions: number
    totalQuestions: number
}

export type ExamResultRequest = {
    studentExamSessionId?: any
    useSubcategories?: boolean
}

export type ExamFormRequest = {
    studentExamSessionIds: number[]
}

export enum StudentExamSessionSortBy {
    CreatedAt = "CreatedAt",
    StartTime = "StartTime",
    EndTime = "ExamSession.EndTime",
    Score = "StudentExamResult.Score",
    StudentName = "Student.UserProfile.FullName"
}

export type StudentExamSessionQuery = {
    sortColumnName?: StudentExamSessionSortBy,
    textSearch?: string,
    isSelected?: boolean,
    studentId?: number,
    sortColumnDirection?: OrderBy,
}