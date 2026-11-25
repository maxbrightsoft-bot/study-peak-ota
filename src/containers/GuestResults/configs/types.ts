export interface GuestResultSearchItem {
  guestStudentExamSessionId: number
  guestName: string
  examTitle: string
  takenAt: string
  earned: number
  total: number
  isProvisional: boolean
  /** The phone also matches another student (e.g. a sibling): only a teacher can combine it. */
  matchesOtherStudents: boolean
}

export interface GuestResultBulkResult {
  succeeded: number[]
  failed: { id: number; title: string }[]
}
