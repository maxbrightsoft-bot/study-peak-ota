export const GUEST_SESSION_KEY = 'TS_GUEST_SESSION'
export const GUEST_ACADEMY_KEY = 'TS_GUEST_ACADEMY'
export const GUEST_CODE_LENGTH = 5
export const GUEST_ACADEMY_FIRST_PAGE = 1
export const GUEST_ACADEMY_PAGE_SIZE = 20
export const GUEST_ACADEMY_SEARCH_DEBOUNCE_MS = 300
export const GUEST_NEXT_STUDENT_SECONDS = 10
export const GUEST_WAIT_POLL_MS = 10000
export const GUEST_RESULT_RETRY_MS = 2000
export const GUEST_RESULT_MAX_RETRIES = 15
export const GUEST_FULL_NAME_MAX = 100
export const GUEST_SCHOOL_NAME_MAX = 200

/** Guest exam storage keys (answer recovery) — kept apart from the student `rc.`/`rb.` keys the offline sync replays. */
export const GUEST_RECOVER_PREFIX = 'grc'
export const GUEST_ROLLBACK_PREFIX = 'grb'

/** Stable BE error codes → i18n keys. */
export const GUEST_ERROR_KEYS: Record<string, string> = {
  InvalidExamCode: 'guest_code_invalid',
  InvalidFullName: 'full_name_is_required',
  InvalidGrade: 'student_grade_is_required',
  InvalidSchoolName: 'school_name_is_required',
  InvalidParentPhone: 'parent_phone_number_is_invalid',
  InvalidStudentPhone: 'phone_number_is_not_valid',
  ConsentRequired: 'guest_consent_required'
}
