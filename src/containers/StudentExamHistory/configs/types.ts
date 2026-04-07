import { OrderBy } from "@/utils/enums";

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