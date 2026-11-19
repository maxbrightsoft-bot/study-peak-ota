import moment from "moment"
import { MyDeadlineState, MyLockReason, MyQuestionState } from "../enums"
import {
    actionButtons,
    canAddNote,
    cardOrder,
    formatWriting,
    hasExtraView,
    isTextAnswerType,
    mergePage,
    questionAction,
    resolveDeadlineState,
    sortByNumber,
    timeLeft
} from "../helpers"
import {
    MyExamItemResponse,
    MyExamListResponse,
    MyQuestionResponse
} from "../types"

const t = (k: string, o?: any) => (o ? `${k}:${JSON.stringify(o)}` : k)
const NOW = moment.utc("2026-11-07T00:00:00").valueOf()

const q2 = (number: string, state: MyQuestionState): MyQuestionResponse => ({
    questionSuperId: 1,
    number,
    typeName: "",
    isCorrect: state === MyQuestionState.Correct,
    myAnswerText: "",
    correctAnswerText: "",
    questionAnswerType: null,
    unit: null,
    myAnswers: [],
    correctAnswers: [],
    noteId: null,
    state,
    canEdit: true,
    editResetsApproval: false,
    lockReason: MyLockReason.None,
    rejectReason: null,
    reviewerName: null,
    submittedAt: null,
    studentEditedAt: null,
    reviewedAt: null,
    writingSeconds: null,
    notes: []
})
const qs = (...numbers: string[]) =>
    numbers.map(n => q2(n, MyQuestionState.NotWritten))
const q = (state: MyQuestionState, canEdit = true) => ({ state, canEdit })
const note = (
    state: MyQuestionState,
    canEdit: boolean,
    editResetsApproval = false
) => ({ state, canEdit, editResetsApproval })
const exam = (id: number): MyExamItemResponse => ({
    examSessionId: id,
    studentExamSessionId: id,
    attemptNumber: 1,
    attemptCount: 1,
    isCounted: true,
    title: `e${id}`,
    examCode: `C${id}`,
    startedAt: "2026-11-01T00:00:00",
    teacherName: "",
    deadlineAt: null,
    deadlineState: MyDeadlineState.None,
    parentVisible: false,
    questionCount: 0,
    wrongCount: 0,
    todoCount: 0,
    notWrittenCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    missedCount: 0,
    progressPercent: null
})
const page = (
    items: MyExamItemResponse[],
    p: number,
    totalPages: number
): MyExamListResponse => ({
    items,
    page: p,
    limit: 20,
    totalItems: items.length,
    totalPages
})

test("resolveDeadlineState: past deadline -> Overdue, LateAllowed kept", () => {
    expect(
        resolveDeadlineState(MyDeadlineState.Open, "2026-11-06T23:00:00", NOW)
    ).toBe(MyDeadlineState.Overdue)
    expect(
        resolveDeadlineState(
            MyDeadlineState.LateAllowed,
            "2026-11-06T23:00:00",
            NOW
        )
    ).toBe(MyDeadlineState.LateAllowed)
})
test("resolveDeadlineState: <24h -> DueSoon, >=24h -> Open, null -> None", () => {
    expect(
        resolveDeadlineState(MyDeadlineState.Open, "2026-11-07T23:00:00", NOW)
    ).toBe(MyDeadlineState.DueSoon)
    expect(
        resolveDeadlineState(MyDeadlineState.Open, "2026-11-08T01:00:00", NOW)
    ).toBe(MyDeadlineState.Open)
    expect(resolveDeadlineState(MyDeadlineState.Open, null, NOW)).toBe(
        MyDeadlineState.None
    )
})
test("resolveDeadlineState: nowMs = 0 is a real epoch, not 'now'", () => {
    expect(
        resolveDeadlineState(MyDeadlineState.Open, "1970-01-01T12:00:00", 0)
    ).toBe(MyDeadlineState.DueSoon)
})
test("timeLeft picks days / hours / minutes (min 1)", () => {
    expect(timeLeft("2026-11-09T00:00:00", t, NOW)).toBe(
        'mywrongnote_days:{"n":2}'
    )
    expect(timeLeft("2026-11-07T05:30:00", t, NOW)).toBe(
        'mywrongnote_hours:{"n":5}'
    )
    expect(timeLeft("2026-11-07T00:00:10", t, NOW)).toBe(
        'mywrongnote_minutes:{"n":1}'
    )
})
test('sortByNumber orders "2" < "10" < "12-1" < "12-2"', () => {
    expect(
        sortByNumber(qs("12-2", "10", "2", "12-1")).map(x => x.number)
    ).toEqual(["2", "10", "12-1", "12-2"])
})
test("cardOrder drops Correct", () => {
    const list = [
        q2("10", MyQuestionState.Rejected),
        q2("3", MyQuestionState.Correct),
        q2("2", MyQuestionState.NotWritten)
    ]
    expect(cardOrder(list).map(x => x.number)).toEqual(["2", "10"])
})
test("questionAction", () => {
    expect(
        questionAction(undefined, {
            state: MyQuestionState.NotWritten,
            canEdit: true
        })
    ).toBe("write")
    expect(
        questionAction(
            note(MyQuestionState.Rejected, true),
            q(MyQuestionState.Rejected)
        )
    ).toBe("rewrite")
    expect(
        questionAction(
            note(MyQuestionState.Pending, true),
            q(MyQuestionState.Pending)
        )
    ).toBe("edit")
    expect(
        questionAction(
            note(MyQuestionState.Approved, true, true),
            q(MyQuestionState.Approved)
        )
    ).toBe("confirmEdit")
    expect(
        questionAction(
            note(MyQuestionState.Approved, false),
            q(MyQuestionState.Approved)
        )
    ).toBe("view")
    expect(
        questionAction(undefined, {
            state: MyQuestionState.Missed,
            canEdit: false
        })
    ).toBe("none")
})
test("hasExtraView: only beside rewrite / edit / confirmEdit", () => {
    expect(hasExtraView("rewrite")).toBe(true)
    expect(hasExtraView("edit")).toBe(true)
    expect(hasExtraView("confirmEdit")).toBe(true)
    expect(hasExtraView("write")).toBe(false) // no note yet
    expect(hasExtraView("view")).toBe(false) // already the only button
    expect(hasExtraView("none")).toBe(false)
})
test("actionButtons: View comes before Rewrite / Edit (G2)", () => {
    expect(actionButtons("rewrite")).toEqual(["view", "rewrite"])
    expect(actionButtons("edit")).toEqual(["view", "edit"])
    expect(actionButtons("confirmEdit")).toEqual(["view", "confirmEdit"])
    expect(actionButtons("view")).toEqual(["view"])
    expect(actionButtons("write")).toEqual(["write"])
    expect(actionButtons("none")).toEqual([])
})
test("canAddNote: wrong, unlocked and already has a note (G2, same as web)", () => {
    const base = q2("1", MyQuestionState.Pending)
    const one = [{ noteId: 1 }]
    expect(canAddNote(base, one)).toBe(true)
    expect(canAddNote(base, [])).toBe(false) // first note goes through Write
    expect(canAddNote({ ...base, isCorrect: true }, one)).toBe(false)
    expect(
        canAddNote({ ...base, lockReason: MyLockReason.DeadlinePassed }, one)
    ).toBe(false)
})
test("mergePage appends page>1, replaces page 1, hasMore = page < totalPages", () => {
    const a = exam(1),
        b = exam(2),
        c = exam(3)
    expect(mergePage([a], page([b, c], 1, 1))).toEqual({
        items: [b, c],
        hasMore: false
    })
    expect(mergePage([a], page([b], 2, 3))).toEqual({
        items: [a, b],
        hasMore: true
    })
})
test("formatWriting", () => {
    expect(formatWriting(219, t)).toBe('mywrongnote_writing_time:{"m":3,"s":39}')
    expect(formatWriting(null, t)).toBe("")
})

test("isTextAnswerType: short answer / order / synonym types only (same as web isTextType)", () => {
    // QuestionAnswerType: 0 SingleChoice, 1 MultipleChoice, 2 ShortAnswer, 3 OrderMatters,
    // 4 OrderDoesNotMatters, 5 SynonymProcessing, 6 MultipleCorrectAnswers
    expect([0, 1, 2, 3, 4, 5, 6].map(isTextAnswerType)).toEqual([false, false, true, true, true, true, false])
    expect(isTextAnswerType(null)).toBe(false)
})

