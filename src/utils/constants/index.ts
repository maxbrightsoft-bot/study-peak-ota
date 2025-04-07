import { PagingResponse } from "../types"

export const ACCESS_TOKEN = 'ACCESS_TOKEN'
export const LanguageHeaders = "Accept-Language"
export const ACADEMY_DOMAIN = "ACADEMY_DOMAIN"
export const LEARNING_SPACE = "LEARNING_SPACE"
export const AcademyHeaders = "Academy-Headers"
export const AcceptNoAcademy = "AcceptNoAcademy"
export const NoAcademyHeaders = "Accept-No-Academy"
export const LANGUAGE = "LANGUAGE"
export const DefaultErrorMessage = 'an_unexpected_error_has_occurred'
export const DEFAULT_PAGING_RESPONSE: PagingResponse = {
  page: 0,
  limit: 0,
  totalItems: 0,
  totalPages: 0,
}

export const DATE_MIN_VALUE = '0001-01-01T00:00:00+00:00'
export const DATE_TIME_MIN_VALUE = '0001-01-01T00:00:00'

export const PUSHER_CONFIG = {
  cluster: process.env.EXPO_APP_PUSHER_CONFIG_CLUSTER || "",
  key: process.env.EXPO_APP_PUSHER_CONFIG_KEY || ""
}
export const BASE_URL = process.env.EXPO_APP_BASE_URL || ''