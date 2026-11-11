/** Announcement types the backend sends (TouchStudy.Domain AnnouncementType). Same strings as the web bell. */
export enum AnnouncementType {
  ReceivedNewNote = 'ReceivedNewNote',
  ReceivedNoteComment = 'ReceivedNoteComment',
  ReceivedNoteMention = 'ReceivedNoteMention',
  ReceivedNoteCommentMention = 'ReceivedNoteCommentMention',
  WrongNoteRejected = 'WrongNoteRejected',
  WrongNoteApproved = 'WrongNoteApproved',
  WrongNoteReminder = 'WrongNoteReminder',
  WrongNoteResubmitted = 'WrongNoteResubmitted',
  WrongNoteEditedAfterCheck = 'WrongNoteEditedAfterCheck',
  WrongNoteSubmitted = 'WrongNoteSubmitted',
  WrongNoteDeadlineChanged = 'WrongNoteDeadlineChanged',
  WrongNoteLateAllowed = 'WrongNoteLateAllowed',
  WrongNoteDeadlineSoon = 'WrongNoteDeadlineSoon',
  WrongNoteResultSentToParents = 'WrongNoteResultSentToParents',
  StudyTimerNoRecord = 'StudyTimerNoRecord',
  StudyTimerBelowGoal = 'StudyTimerBelowGoal',
  StudyTimerSharpDrop = 'StudyTimerSharpDrop',
  StudyTimerTimerLeftRunning = 'StudyTimerTimerLeftRunning',
  StudyTimerTeacherMessage = 'StudyTimerTeacherMessage',
  StudyTimerParentReport = 'StudyTimerParentReport',
  StudyTimerReplied = 'StudyTimerReplied',
  StudyTimerGoalUpdated = 'StudyTimerGoalUpdated'
}

/** Pusher events on the user's announcement channel. */
export enum AnnouncementEvent {
  Received = 'ReceivedAnnouncement',
  Updated = 'UpdatedAnnouncement',
  Deleted = 'DeletedAnnouncement'
}

export enum AnnouncementReadFilter {
  All = 'all',
  Unread = 'unread',
  Read = 'read'
}
