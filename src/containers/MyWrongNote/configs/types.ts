// UTC dates without "Z" (parse with moment.utc). Mirrors the web types.
import {
    MyDeadlineState,
    MyExamFilter,
    MyLockReason,
    MyQuestionState
} from "./enums"
type PagingResponse = {
    page: number
    limit: number
    totalItems: number
    totalPages: number
}

export type MyDeadlineResponse = {
    examSessionId: number
    title: string
    deadlineAt: string
}

export type MyWrongNoteSummaryResponse = {
    todoCount: number
    rejectedCount: number
    pendingCount: number
    approvedCount: number
    nextDeadline: MyDeadlineResponse | null
}

export type MyExamItemResponse = {
    examSessionId: number
    /** One item per visible attempt; this is the list key. */
    studentExamSessionId: number
    /** 1-based attempt number of studentExamSessionId */
    attemptNumber: number
    attemptCount: number
    /** The attempt that counts for the session (summary, deadline banner, deep link without an attempt). */
    isCounted: boolean
    title: string
    examCode: string
    startedAt: string
    teacherName: string
    deadlineAt: string | null
    deadlineState: MyDeadlineState
    parentVisible: boolean
    questionCount: number
    wrongCount: number
    todoCount: number
    notWrittenCount: number
    rejectedCount: number
    pendingCount: number
    approvedCount: number
    missedCount: number
    progressPercent: number | null
}

export type MyExamTotalsResponse = {
    todoExams: number
    allExams: number
    doneExams: number
}

/** Host PagedResponseViewModel<MyExamItemResponse> (GET exams); more pages while page < totalPages. Tab badges come from GET exams/totals. */
export type MyExamListResponse = PagingResponse & {
    items: MyExamItemResponse[]
}

export type MyNoteResponse = {
    noteId: number
    questionNoteOrder?: number | null
    state: MyQuestionState
    canEdit: boolean
    editResetsApproval: boolean
    lockReason: MyLockReason
    rejectReason: string | null
    reviewerName: string | null
    submittedAt: string | null
    studentEditedAt: string | null
    reviewedAt: string | null
    writingSeconds: number | null
}

export type MyQuestionResponse = {
    questionSuperId: number
    number: string
    typeName: string
    isCorrect: boolean
    myAnswerText: string
    correctAnswerText: string
    // Raw answers for the answer popover (may be editor HTML; choice numbers for choice types).
    questionAnswerType: number | null
    unit: string | null
    myAnswers: string[]
    correctAnswers: string[]
    noteId: number | null
    state: MyQuestionState
    canEdit: boolean
    editResetsApproval: boolean
    lockReason: MyLockReason
    rejectReason: string | null
    reviewerName: string | null
    submittedAt: string | null
    studentEditedAt: string | null
    reviewedAt: string | null
    writingSeconds: number | null
    notes: MyNoteResponse[]
}

export type MyExamDetailResponse = {
    exam: MyExamItemResponse
    questions: MyQuestionResponse[]
}

export type MyExamSortColumn = "default" | "startedAt" | "title"
/** Omit for the column's natural order (startedAt newest first, title A→Z). */
export type MyExamSortDirection = "asc" | "desc"

/** Search + attempt start range shared by GET exams and GET exams/totals. ISO UTC with "Z"; startDate omitted = endDate − 180 days. */
export type MyExamRangeQuery = {
    /** Case-insensitive title contains; trimmed, max 200 chars. */
    textSearch?: string
    startDate?: string
    endDate?: string
}

/** Host PagedRequestViewModel names. */
export type MyExamsQuery = MyExamRangeQuery & {
    filter: MyExamFilter
    /** 1-based; omitted = 1. */
    currentPage?: number
    /** 1..100; omitted = 20. */
    pageSize?: number
    /** Omitted = "default" (due soon → late open → newest). */
    sortColumnName?: MyExamSortColumn
    sortColumnDirection?: MyExamSortDirection
}

export type MyExamDetailQuery = {
    /** Omit for the counted attempt. */
    studentExamSessionId?: number
}

export type ExamThreadResponse = {
    conversationId: number | null
    examSessionId: number
    studentExamSessionId: number
    examTitle: string
    attemptNumber: number
    attemptCount: number
    questionId: number
}
