export const STUDY_TIMER_DATE_FORMAT = 'YYYY-MM-DD'
export const STUDY_TIMER_MY_MESSAGES_PAGE_SIZE = 20 // student inbox: one page per scroll step
export const STUDY_TIMER_MAX_REPLY_LENGTH = 200
export const STUDY_TIMER_MAX_CLOSE_HOURS = 6

/** Announcement type of the "your goal changed" bell item (BE AnnouncementType.StudyTimerGoalUpdated). */
export const STUDY_TIMER_GOAL_UPDATED_TYPE = 'StudyTimerGoalUpdated'
/** Timeline blocks narrower than this share of the bar get no text. */
export const TIMELINE_LABEL_MIN_SHARE = 0.06

/** i18n key suffix per notification template (StudyTimerNotifyTemplate order) */
export const TEMPLATE_KEYS = [
  'no_record',
  'below_goal',
  'sharp_drop',
  'timer_left_running',
  'teacher_message',
  'parent_report'
]

/** i18n key suffix per reply reason (StudyTimerReplyReason order) */
export const REPLY_REASON_KEYS = [
  'acknowledged',
  'sick',
  'school_event',
  'other_academy',
  'family',
  'forgot_timer',
  'other'
]

/** Own-goal range in minutes (BE StudyTimerConstants.MinGoalMinutes / MaxGoalMinutes). */
export const STUDY_TIMER_MIN_GOAL = 1
export const STUDY_TIMER_MAX_GOAL = 900
/** Quick picks of the own-goal dialog, in minutes (2h .. 7h). */
export const STUDY_TIMER_GOAL_PRESETS = [120, 180, 240, 300, 360, 420]
