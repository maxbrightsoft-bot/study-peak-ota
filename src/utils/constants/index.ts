import { Platform, StatusBar } from "react-native"
import { PagingResponse } from "../types"
import { QuestionAnswerType } from "../enums"
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || {};
export const KEEP_LOGIN = 'KEEP_LOGIN'
export const ACCESS_TOKEN = 'ACCESS_TOKEN'
export const LanguageHeaders = "Accept-Language"
export const ACADEMY_DOMAIN = "ACADEMY_DOMAIN"
export const LEARNING_SPACE = "LEARNING_SPACE"
export const AcademyHeaders = "Academy-Headers"
export const AcceptNoAcademy = "AcceptNoAcademy"
export const NoAcademyHeaders = "Accept-No-Academy"
export const LANGUAGE = "LANGUAGE"
export const REDIRECT_URL = "REDIRECT_URL"
export const DefaultErrorMessage = 'an_unexpected_error_has_occurred'
export const DEFAULT_PAGING_RESPONSE: PagingResponse = {
  page: 0,
  limit: 0,
  totalItems: 0,
  totalPages: 0,
}

export const CONSENT_POLICY_VERSION = extra.CONSENT_POLICY_VERSION || ''
export const TOAST_EXAM_STATUS = 'TOAST_EXAM_STATUS'
export const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
export const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 90;
export const TAB_BAR_HEIGHT = 104;
export const APPLE_USER_KEY = `apple_user_id`;
export const DATE_MIN_VALUE = '0001-01-01T00:00:00+00:00'
export const DATE_TIME_MIN_VALUE = '0001-01-01T00:00:00'

export const PUSHER_CONFIG = {
  cluster: extra.PUSHER_CLUSTER || "",
  key: extra.PUSHER_KEY || ""
}
export const OTA_URL = extra.OTA_URL || ""
export const BASE_URL = extra.BASE_URL || ''
export const SUPER_ADMIN_BASE_URL =
  extra.SUPER_ADMIN_BASE_URL || ""
export const SOCKET_URL = extra.SOCKET_URL || ""
export const STUDENT_URL = extra.STUDENT_URL || ""

export const GOOGLE_RECAPTCHA_KEY =
  extra.GOOGLE_RECAPTCHA_KEY || ""

export const GOOGLE_CLIENT_ID = extra.GOOGLE_CLIENT_ID || ""

export const GOOGLE_RECAPTCHA_ID =
  extra.GOOGLE_RECAPTCHA_ID || ""

export const answerTypeOptions = (t: any) => ([
  {
    label: t("singlechoice"),
    value: QuestionAnswerType.SingleChoice
  },
  {
    label: t("multiplechoice"),
    value: QuestionAnswerType.MultipleChoice
  },
  {
    label: t("shortanswer"),
    value: QuestionAnswerType.ShortAnswer
  },
  {
    label: t("order_matters"),
    value: QuestionAnswerType.OrderMatters
  },
  {
    label: t("order_does_not_matter"),
    value: QuestionAnswerType.OrderDoesNotMatters
  },
  {
    label: t("synonym_processing"),
    value: QuestionAnswerType.SynonymProcessing
  }
])

export const BRIEF_GRADE_OPTIONS = [
  { label: "es_1st", value: 1 },
  { label: "es_2nd", value: 2 },
  { label: "es_3rd", value: 3 },
  { label: "es_4th", value: 4 },
  { label: "es_5th", value: 5 },
  { label: "es_6th", value: 6 },
  { label: "ms_1st", value: 7 },
  { label: "ms_2nd", value: 8 },
  { label: "ms_3rd", value: 9 },
  { label: "hs_1st", value: 10 },
  { label: "hs_2nd", value: 11 },
  { label: "hs_3rd", value: 12 },
  { label: "n_retaker", value: 13 }
];

export * from './language'
export * from './exam'
export * from './timer'
export * from './error'