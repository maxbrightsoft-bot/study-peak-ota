// Pure display helpers. Server dates are UTC without "Z": always moment.utc(...).local().
import moment from "moment"
import { MyDeadlineState, MyLockReason, MyQuestionState } from "./enums"
import { MY_WRONG_NOTE_DUE_SOON_HOURS } from "./constants"
import { QuestionAnswerType } from "../../../utils/enums/exam"
import {
    MyExamItemResponse,
    MyExamListResponse,
    MyNoteResponse,
    MyQuestionResponse
} from "./types"

// Deliberately loose (any options) so i18next's `t` from useTranslation()
// is assignable without casts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (key: string, options?: any) => string

export type MyNoteAction =
    | "write"
    | "rewrite"
    | "edit"
    | "confirmEdit"
    | "view"
    | "addNote"
    | "none"

export const localTime = (serverDate: string) => moment.utc(serverDate).local()

/** Re-evaluates deadline state against client time so expired deadlines become Overdue. */
export const resolveDeadlineState = (
    serverState: MyDeadlineState,
    deadlineAt: string | null | undefined,
    nowMs?: number
): MyDeadlineState => {
    if (!deadlineAt) return MyDeadlineState.None
    const now = nowMs !== undefined ? moment(nowMs) : moment()
    const deadline = localTime(deadlineAt)
    if (!deadline.isAfter(now)) {
        return serverState === MyDeadlineState.LateAllowed
            ? MyDeadlineState.LateAllowed
            : MyDeadlineState.Overdue
    }
    return deadline.diff(now, "hours", true) < MY_WRONG_NOTE_DUE_SOON_HOURS
        ? MyDeadlineState.DueSoon
        : MyDeadlineState.Open
}

export const timeLeft = (deadlineAt: string, t: TFunction, nowMs?: number) => {
    const now = nowMs !== undefined ? moment(nowMs) : moment()
    const minutes = Math.max(0, localTime(deadlineAt).diff(now, "minutes"))
    if (minutes >= 24 * 60)
        return t("mywrongnote_days", { n: Math.floor(minutes / (24 * 60)) })
    if (minutes >= 60)
        return t("mywrongnote_hours", { n: Math.floor(minutes / 60) })
    return t("mywrongnote_minutes", { n: Math.max(1, minutes) })
}

export const deadlineChip = (
    state: MyDeadlineState,
    deadlineAt: string | null | undefined,
    t: TFunction,
    nowMs?: number
) => {
    switch (resolveDeadlineState(state, deadlineAt, nowMs)) {
        case MyDeadlineState.Open:
        case MyDeadlineState.DueSoon:
            return t("mywrongnote_deadline_left", {
                left: timeLeft(deadlineAt as string, t, nowMs)
            })
        case MyDeadlineState.Overdue:
            return t("mywrongnote_deadline_passed", "Deadline passed")
        case MyDeadlineState.LateAllowed:
            return t("mywrongnote_deadline_late", "Late submission allowed")
        default:
            return t("mywrongnote_deadline_none", "No deadline")
    }
}

/** Question order: "2" before "10" */
export const sortByNumber = (questions: MyQuestionResponse[]) =>
    [...questions].sort((a, b) =>
        a.number.localeCompare(b.number, undefined, { numeric: true })
    )

/** The wrong questions (not correct), in question order */
export const cardOrder = (questions: MyQuestionResponse[]) =>
    sortByNumber(questions.filter(q => q.state !== MyQuestionState.Correct))

export const formatWriting = (seconds: number | null, t: TFunction) => {
    if (!seconds) return ""
    return t("mywrongnote_writing_time", {
        m: Math.floor(seconds / 60),
        s: seconds % 60
    })
}

export const questionAction = (
    note:
        | Pick<MyNoteResponse, "state" | "canEdit" | "editResetsApproval">
        | undefined,
    question: Pick<MyQuestionResponse, "state" | "canEdit">
): MyNoteAction => {
    if (!note) return question.canEdit ? "write" : "none"
    if (note.canEdit) {
        if (note.state === MyQuestionState.Rejected) return "rewrite"
        if (note.state === MyQuestionState.Pending) return "edit"
        if (
            note.state === MyQuestionState.Approved &&
            note.editResetsApproval
        )
            return "confirmEdit"
    }
    return "view"
}

/** True when a note exists and its main button is not already "view": the card adds a read-only View button. */
export const hasExtraView = (action: MyNoteAction): boolean =>
    action === "rewrite" || action === "edit" || action === "confirmEdit"

/** Buttons for one note / single-note card, in order: View first (web order), then the main action. */
export const actionButtons = (action: MyNoteAction): MyNoteAction[] => {
    if (action === "none") return []
    return hasExtraView(action) ? ["view", action] : [action]
}

/** "Add note" (another note for the same question): wrong, not locked, and at least one note already exists (web rule). */
export const canAddNote = (
    question: Pick<MyQuestionResponse, "isCorrect" | "lockReason">,
    notes: readonly unknown[]
): boolean =>
    !question.isCorrect &&
    question.lockReason === MyLockReason.None &&
    notes.length > 0

export const mergePage = (
    prev: MyExamItemResponse[],
    res: MyExamListResponse
) => ({
    items: res.page > 1 ? [...prev, ...res.items] : res.items,
    hasMore: res.page < res.totalPages
})

/** True while a deadline is in the future and inside the due-soon window (countdown worth ticking). */
export const isDeadlineNear = (
    deadlineAt: string | null | undefined,
    nowMs?: number
) => {
    if (!deadlineAt) return false
    const now = nowMs !== undefined ? moment(nowMs) : moment()
    const deadline = localTime(deadlineAt)
    return (
        deadline.isAfter(now) &&
        deadline.diff(now, "hours", true) < MY_WRONG_NOTE_DUE_SOON_HOURS
    )
}

/** Typed answers (short answer, ordered/unordered lists, synonyms) — same set as the web isTextType. */
export const isTextAnswerType = (type: number | null | undefined) =>
    type === QuestionAnswerType.ShortAnswer ||
    type === QuestionAnswerType.OrderMatters ||
    type === QuestionAnswerType.OrderDoesNotMatters ||
    type === QuestionAnswerType.SynonymProcessing
