// Numeric enums, same order as the C# enums in TouchStudy.Modules.StudyTimer.Contracts
/** Announcement Pusher events the study timer listens to. */
export enum StudyTimerAnnouncementEvent {
  ReceivedAnnouncement = 'ReceivedAnnouncement',
  UpdatedAnnouncement = 'UpdatedAnnouncement',
  DeletedAnnouncement = 'DeletedAnnouncement',
  GoalChanged = 'StudyTimerGoalChanged'
}

/** extraData.goalAction of a StudyTimerGoalUpdated announcement. */
export enum StudyTimerGoalAction {
  PersonalSet = 0,
  PersonalRemoved = 1,
  ClassChanged = 2
}

export enum TimerRecordKind {
  Study,
  Break
}

export enum StudyTimerNotifyAudience {
  Student,
  Parent,
  Both
}

export enum StudyTimerNotifyTemplate {
  NoRecord,
  BelowGoal,
  SharpDrop,
  TimerLeftRunning,
  TeacherMessage,
  ParentReport
}

// Same order as Contracts.Sources.StudyTimerReplyReason
export enum StudyTimerReplyReason {
  Acknowledged,
  Sick,
  SchoolEvent,
  OtherAcademy,
  Family,
  ForgotTimer,
  Other
}

export enum StudyTimerMyPeriod {
  Week = 'week',
  Month = 'month'
}
