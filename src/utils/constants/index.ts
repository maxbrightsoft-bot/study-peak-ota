import { Platform, StatusBar } from "react-native"
import { PagingResponse } from "../types"
import { QuestionAnswerType } from "../enums"
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

export const CONSENT_POLICY_VERSION = process.env.EXPO_PUBLIC_CONSENT_POLICY_VERSION || ''
export const TOAST_EXAM_STATUS = 'TOAST_EXAM_STATUS'
export const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
export const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 90;
export const TAB_BAR_HEIGHT = 104;
export const APPLE_USER_KEY = `apple_user_id`;
export const DATE_MIN_VALUE = '0001-01-01T00:00:00+00:00'
export const DATE_TIME_MIN_VALUE = '0001-01-01T00:00:00'
export const STORE_UPDATE_REQUIRED = "STORE_UPDATE_REQUIRED"
export const OTA_UPDATE_REQUIRED = "OTA_UPDATE_REQUIRED"
export const UPDATE_REQUIRED = "UPDATE_REQUIRED"


export const PUSHER_CONFIG = {
  cluster: process.env.EXPO_PUBLIC_PUSHER_CONFIG_CLUSTER || "",
  key: process.env.EXPO_PUBLIC_PUSHER_CONFIG_KEY || ""
}
export const OTA_URL = process.env.EXPO_PUBLIC_OTA_URL || ""
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || ''
export const SUPER_ADMIN_BASE_URL =
  process.env.EXPO_PUBLIC_SUPER_ADMIN_BASE_URL || ""
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || ""
export const STUDENT_URL = process.env.EXPO_PUBLIC_STUDENT_URL || ""

export const GOOGLE_RECAPTCHA_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_RECAPTCHA_KEY || ""

export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ""
export const IOS_GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID || ""
export const WEB_GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID || ""
export const ANDROID_GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID || ""
export const GOOGLE_RECAPTCHA_ID =
  process.env.EXPO_PUBLIC_GOOGLE_RECAPTCHA_ID || ""

export const STORE_VERSION_ANDROID = process.env.EXPO_PUBLIC_STORE_VERSION_ANDROID || ""
export const STORE_VERSION_IOS = process.env.EXPO_PUBLIC_STORE_VERSION_IOS || ""
export const CURRENT_BUNDLE_VERSION = process.env.EXPO_PUBLIC_CURRENT_BUNDLE_VERSION || "1.0.0"
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