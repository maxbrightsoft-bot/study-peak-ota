import moment from "moment"
import { PreparedFilterType, PreparedType, ScheduleFormData, ScheduleQuery, ScheduleSortBy, TextbookOrderBy, TextbookQuery, TextbookSortBy } from "./type"
import { ExamEvent } from "@/utils/enums"

export enum ExamStatus {
    Default,
    Pending,
    InProgress,
    Completed
}

export enum TypeNotificationEnum {
    Default,
    Academy,
    Class,
    Student
}

export const TabList = [
    // {
    //     label: "recently_solved_questions",
    //     value: PreparedFilterType.recently_solved_questions
    // },
    // {
    //     label: "entire",
    //     value: null
    // },
    {
        label: "csat_past_questions",
        value: PreparedType.csat_past_questions
    },
    {
        label: "official_mock_exam",
        value: PreparedType.official_mock_exam
    },
    {
        label: "private_mock_exam",
        value: PreparedType.private_mock_exam
    },
    {
        label: "workbook",
        value: PreparedType.workbook
    },
    {
        label: "past_exam_questions",
        value: PreparedType.past_exam_questions
    },
    {
        label: "academy_questions",
        value: PreparedFilterType.academy_questions
    },
];

export const daysInWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const daysInWeekSortByValue = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']


export const FormatDate = "YYYY-MM-DD HH:mm:ss"


export enum SortBy {
    CreatedAt = "CreatedAt",
    FullName = "FullName",
    Email = "Email"
}

export enum OrderBy {
    ASC = "ASC",
    DESC = "DESC"
}

export const DataLink = [
    {
        color: "#F34B4B",
        label: "YOUTUBE 유튜브",
        bg: "#FAE0E0",
        link: "youtube.com"
    },
    {
        color: "#414E62",
        label: "INSTAGRAM 인스타",
        bg: "#FEAF06",
        link: "instagram.com"
    },
]

export const DefaultTextbookFilter: TextbookQuery = {
    currentPage: 1,
    pageSize: -1,
    sortColumnDirection: TextbookOrderBy.DESC,
    sortColumnName: TextbookSortBy.CreatedAt
};

export const DefaultScheduleFilter: ScheduleQuery = {
    currentPage: 1,
    pageSize: -1,
    sortColumnDirection: OrderBy.DESC,
    sortColumnName: ScheduleSortBy.CreatedAt
};

export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss"

export const noticeData = [
    {
        id: 1,
        content: "학원 전체 공지",
        sender: {
            name: "학원"
        },
        isActive: true,
        createdAt: "0001-01-01T00:00:00",
    },
    {
        id: 2,
        content: "2월 일정",
        sender: {
            name: "학원"
        },
        isActive: true,
        createdAt: "0001-01-01T00:00:00",
    },
    {
        id: 3,
        content: "수업 1에 대한 공지",
        sender: {
            name: "학원"
        },
        isActive: true,
        createdAt: "0001-01-01T00:00:00",
    },
]

export const TextbookTabList = [
    {
        label: "team",
        value: 0,
    },
    {
        label: "statistics",
        value: 1,
    },
]

export const spacingCell = 1
export const heightBlock = 1
export const heightHeaderTimeLine = 32


export const DEFAULT_SCHEDULE_FORM_DATA: ScheduleFormData = {
    date: moment().local().startOf("day"),
    startTime: null,
    endTime: null,
    title: ""
};

export const EVENT_NEW_STUDENT_NOTE = "new-student-note-event";
export const EVENT_UPDATED_STUDENT_NOTE = "updated-student-note-event";
export const EVENT_DELETED_STUDENT_NOTE = "deleted-student-note-event";

export const EVENT_NEW_STUDENT_NOTIFICATION = "new-student-notification-event";
export const EVENT_UPDATED_STUDENT_NOTIFICATION = "updated-student-notification-event";
export const EVENT_DELETED_STUDENT_NOTIFICATION = "deleted-student-notification-event";
export const EVENT_DELETED_MEMBER = "pusher:member_removed"

export const studentNoteEvents = [
    EVENT_NEW_STUDENT_NOTE,
    EVENT_UPDATED_STUDENT_NOTE,
    EVENT_DELETED_STUDENT_NOTE,
];

export const studentNotificationEvents = [
    EVENT_NEW_STUDENT_NOTIFICATION,
    EVENT_UPDATED_STUDENT_NOTIFICATION,
    EVENT_DELETED_STUDENT_NOTIFICATION,
];

export const examEvents = [
    ExamEvent.StartExam,
    EVENT_DELETED_MEMBER]


export const studentExamEvents = [
    ExamEvent.TeacherKickOutStudent,
]

