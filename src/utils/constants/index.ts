import { Platform, StatusBar } from "react-native"
import { PagingResponse } from "../types"

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
export const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
export const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 90;
export const TAB_BAR_HEIGHT = 60;

export const DATE_MIN_VALUE = '0001-01-01T00:00:00+00:00'
export const DATE_TIME_MIN_VALUE = '0001-01-01T00:00:00'

export const PUSHER_CONFIG = {
  cluster: process.env.EXPO_PUBLIC_PUSHER_CONFIG_CLUSTER || "",
  key: process.env.EXPO_PUBLIC_PUSHER_CONFIG_KEY || ""
}
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || ''
export const SUPER_ADMIN_BASE_URL =
    process.env.EXPO_PUBLIC_SUPER_ADMIN_BASE_URL || ""

export const GOOGLE_RECAPTCHA_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_RECAPTCHA_KEY || ""

export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ""

export const GOOGLE_RECAPTCHA_ID =
    process.env.EXPO_PUBLIC_GOOGLE_RECAPTCHA_ID || ""

export const GOOGLE_RECAPTCHA_SECRET =
    process.env.EXPO_PUBLIC_GOOGLE_RECAPTCHA_SECRET || ""
  
export * from './language'
export * from './exam'