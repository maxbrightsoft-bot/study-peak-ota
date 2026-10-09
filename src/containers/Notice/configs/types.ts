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

export type CommentUser = {
  id: number
  email?: string
  fullName?: string
  avatar?: string
}

export type NoteComment = {
  id: number
  noteId: number
  content?: string
  imageUrl?: string
  createBy: CommentUser
  parentCommentId?: number | null
  replies?: NoteComment[]
  replyCount?: number
  isEdited?: boolean
  createdAt: string
  updatedAt?: string
}