import { ChapterResponse, Profile, Subject } from "@/utils/types";
import { OrderBy } from "./constants";

export type Task = {
  id: number;
  courseId: number;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  mainTeacherId: number;
  mainTeacherUserId: number;
  mainTeacherName: string;
  isCheckedIn: boolean;
};

export interface TaskExtend extends Task  {
  startTimeFilter?: string
  endTimeFilter?: string
};

export type Notification = {
  id: number;
  name: string;
  content: string;
  type?: number;
  createdAt: string;
  notificationTypes: any;
};

export type Academy = {
  id: number;
  name: string;
  image: string;
  coverImage: string;
  domain: string;
  createdAt: Date;
};

export enum StudentAttendanceStatus {
  Attended,
  Absent,
  Late
}

export type InfoLesson = {
  totalLessons: number;
  totalCheckedInLessons: number;
};

export type AcademyResponse = {
  id: number;
  name: string;
  image: string;
  domain: string;
};

export enum ScheduleType
{
    Personal,
    Group
}

export enum ScheduleStatus
{
    Default,
    Completed,
    Missed
}

export enum ScheduleStatusRequest
{
    Default,
    Completed
}

export type ScheduleResponse = {
  id?: number
  title: string
  date: string
  startTime: string
  endTime: string
  type?: ScheduleType
  status?: ScheduleStatus
  lessonId?: number
};

export type ScheduleFormData = {
  id?: number
  title: string
  startTime: moment.Moment | null
  endTime: moment.Moment | null
  date: moment.Moment | null
};

export enum ScheduleSortBy {
  CreatedAt = "CreatedAt"
}

export type ScheduleQuery =  {
  sortColumnName?: ScheduleSortBy
  startDate?: string
  endDate?: string
  currentPage: number,
  pageSize: number,
  status?: ScheduleStatus
  textSearch?: string,
  sortColumnDirection: OrderBy,
}

export type ScheduleRequest = {
  title: string
  date: string
  startTime: string
  endTime: string
};

export enum PreparedType
{
  csat_past_questions = 1,
  official_mock_exam,
  private_mock_exam,
}

export enum PreparedFilterType
{
    recently_solved_questions = "RecentlySolvedQuestions",
    academy_questions = "AcademyQuestions",
}

export type TextbookQuery = {
  currentPage: number;
  pageSize: number;
  sortColumnName: TextbookSortBy;
  textSearch?: string;
  sortColumnDirection: TextbookOrderBy;
  startYear?: string;
  endYear?: string;
  subjectIds?: number[];
  months?: number[];
  preparedType?: PreparedType;
  preparedFilterType?: PreparedFilterType
};

export enum TextbookSortBy {
  Name = "Name",
  Title = "Title",
  PreparedType = "PreparedType",
  Area = "Area",
  PublicationDate = "PublicationDate",
  Publisher = "Publisher",
  CreatedAt = "CreatedAt"
}

export enum TextbookOrderBy {
  ASC = "ASC",
  DESC = "DESC"
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
  isStudying?: boolean
  totalUses: number
  createdBy: Profile
  createdAt: string
  textbookOwners: Profile[]
};