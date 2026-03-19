export type Notification = {
  id: number;
  name: string;
  content: string;
  type?: number;
  createdAt: string;
  notificationTypes: any;
  isNote?: boolean
};

export enum StudentNoteEvent {
  New = "new-student-note-event",
  Updated = "updated-student-note-event",
  Deleted = "deleted-student-note-event",
}

export enum StudentNotificationEvent {
  New = "new-student-notification-event",
  Updated = "updated-student-notification-event",
  Deleted = "deleted-student-notification-event",
}