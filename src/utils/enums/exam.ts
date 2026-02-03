export enum ExamEvent {
  StartExam = "start-exam",
  TerminateExam = "terminate-exam",
  PauseResumeExam = "pause-resume-exam",
  RestartExam = "restart-exam",
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
  Completed,
  Paused
}

export enum ExamStatusView {
  ExamOverview,
  MyOverall,
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