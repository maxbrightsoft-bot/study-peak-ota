export enum ExamEvent {
  StartExam = "start-exam",
  TerminateExam = "terminate-exam",
  AddExtraDuration = "add-extra-duration-exam",
  TeacherKickOutStudent = "teacher-kick-out-student"
}

export enum ExamEditorType {
    Korea,
    Math
}

export enum QuestionAnswerType {
  SingleChoice,
  MultipleChoice,
  ShortAnswer,
  OrderMatters,
  OrderDoesNotMatters,
  SynonymProcessing
}

export enum ExamStatus {
  Default,
  Pending,
  InProgress,
  Completed
}

export enum ExamStatusView {
  ExamOverview,
  MyAnswers,
  QuestionAnalysis,
  IncorrectAnswerNotes
}

export enum AnswerResponseSignal {
  Purple,
  Red,
  Yellow,
  Green,
  Black
}

export enum ProblemKey {
  TrickyProblem,
  ProtractedProblem,
  GradesByTerritory,
  Vulnerable
}