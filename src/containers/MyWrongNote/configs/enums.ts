// FE-TS-003: numeric enums, same order as the C# enums in TouchStudy.Modules.MyWrongNote
export enum MyQuestionState {
    Correct,
    NotWritten,
    Pending,
    Rejected,
    Approved,
    Missed
}

export enum MyDeadlineState {
    None,
    Open,
    DueSoon,
    Overdue,
    LateAllowed
}

export enum MyLockReason {
    None,
    DeadlinePassed,
    CorrectAnswer
}

export enum MyExamFilter {
    Todo,
    All,
    Done
}
