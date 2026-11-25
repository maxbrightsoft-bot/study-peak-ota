export type GuestAcademy = {
  name: string
  /** Empty for Study Space. */
  domain: string
  /** Full URL, or null/absent when the academy has no logo. */
  image?: string | null
  isLearningSpace: boolean
}

/** `GET guest-exams/academies` page (1-based `page`). */
export type GuestAcademyPage = {
  items: GuestAcademy[]
  page: number
  pageSize: number
  hasMore: boolean
}

export type GuestExamInfo = {
  code: string
  academyName: string
  examTitle: string
  subjectName?: string
  totalQuestions: number
  durationMinutes: number
}

export type GuestStartRequest = {
  fullName: string
  grade: number
  schoolName: string
  parentPhone: string
  studentPhone: string | null
  consent: boolean
}

export type GuestStartResponse = {
  accessToken: string
  expiresAt: string
}

export type GuestResultResponse = {
  examTitle: string
  earned: number
  total: number
  isProvisional: boolean
  answeredCount: number
  totalQuestions: number
  elapsedSeconds: number
  maskedParentPhone: string
}

export type GuestInfoFormValues = {
  fullName: string
  grade: number | ''
  schoolName: string
  parentPhone: string
  studentPhone: string
  consent: boolean
}
