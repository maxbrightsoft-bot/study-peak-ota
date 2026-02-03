import { AxiosResponse } from 'axios'
import { ACCESS_TOKEN, DATE_MIN_VALUE, DATE_TIME_MIN_VALUE, DefaultErrorMessage } from '../constants'
import { TFunction } from 'i18next'
import moment from 'moment'
import Toast from 'react-native-toast-message'
import { ACADEMY_DOMAIN, LEARNING_SPACE } from '@/utils/constants'
import { getDataStorage } from '@/utils/storage'
import { Platform, Text } from 'react-native'
import { palette } from '@/theme'
import { Language } from '../enums'

export const toast = {
  success: (message: string) =>
    Toast.show({
      type: 'success',
      text1: message
    }),
  error: (message: string) =>
    Toast.show({
      type: 'error',
      text1: message
    }),
  info: (message: string) =>
    Toast.show({
      type: 'info',
      text1: message
    }),
  warning: (message: string) =>
    Toast.show({
      type: 'warning',
      text1: message
    }),
  dismiss: () => Toast.hide(),
  show: (config: any) => {
    return Toast.show({
      type: 'audio',
      props: config,
      position: 'bottom',
      visibilityTime: 10000,
      autoHide: false
    })
  }
}

export const ceilTo = (num = 0, digit = 2) => Math.ceil(num * Math.pow(10, digit)) / Math.pow(10, digit)

export const roundTo = (num = 0, digit = 2) => Math.round(num * Math.pow(10, digit)) / Math.pow(10, digit)

export const handleErrors = (response: AxiosResponse<any>) =>
  response.status === 200 ? Promise.resolve(response.data) : Promise.reject(response.data?.errors[0])

export const timeSpanToLocalMoment = (time: string, date?: string) => {
  if (!time) return null
  const times = time.split(':')

  if (times.length !== 3) return null
  const totalSeconds = +times[0] * 60 * 60 + +times[1] * 60 + +times[2]
  const startOfDay = moment.utc(date).startOf('day')
  let dateTime = date ? startOfDay.add(totalSeconds, 'seconds') : moment().startOf('day')
  if (date && dateTime.isBefore(moment.utc(date))) dateTime = dateTime.add(1, 'day')
  return dateTime.local()
}

export const utcToLocalTime = (time?: string, FORMAT?: string) => {
  if (time === DATE_MIN_VALUE || time === DATE_TIME_MIN_VALUE) return ''
  try {
    return moment
      .utc(time)
      .local()
      .format(FORMAT || 'yyyy-MM-DD')
  } catch {
    return ''
  }
}

export const getOrdinalSuffix = (number: number, lang: string) => {
  const suffixes = {
    en: ['th', 'st', 'nd', 'rd'],
    ko: ['']
  }

  switch (lang) {
    case 'en':
      const j = number % 10
      const k = number % 100
      if (j === 1 && k !== 11) {
        return suffixes.en[1]
      }
      if (j === 2 && k !== 12) {
        return suffixes.en[2]
      }
      if (j === 3 && k !== 13) {
        return suffixes.en[3]
      }
      return suffixes.en[0]
    case 'ko':
      return suffixes.ko[0]
    default:
      return ''
  }
}
export const formatGrade = (grade: number, t: any, language?: string) => {
  return grade
    ? language === Language.en
      ? `${grade}${getOrdinalSuffix(grade, language)}`
      : `${t('number_grade', { number: grade })}`
    : ''
}

export const getErrorMessage = (
  t: TFunction<'translation', undefined>,
  error: any,
  defaultErrorMessage?: string
): string => {
  let errorMessage = error?.response?.data?.title
  if (error?.response?.status === 500) return defaultErrorMessage || t(DefaultErrorMessage)
  if (typeof errorMessage === 'string') return decodeURIComponent(errorMessage)
  errorMessage = error?.message || error?.response?.data?.message
  if (typeof errorMessage === 'string') return errorMessage
  return defaultErrorMessage || t(DefaultErrorMessage)
}

export const getAcademyDomain = async () => {
  try {
    return await getDataStorage(ACADEMY_DOMAIN)
  } catch (err) {
    return null
  }
}

export const getLearningSpace = async () => {
  try {
    const isLearningSpace = !!(await getDataStorage(LEARNING_SPACE))
    return isLearningSpace
  } catch (err) {
    return false
  }
}

export const getAccessToken = async () => {
  try {
    return await getDataStorage(ACCESS_TOKEN)
  } catch (err) {
    return null
  }
}

export const getSafeUrl = (url: string) => {
  if (!url) return ''

  const base = url.replace('http://localhost', Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost')
  return encodeURI(base)
}

export const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) return <Text>{text}</Text>

  const regex = new RegExp(`(${highlight})`, 'gi')
  const parts = text.split(regex)

  return (
    <Text>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Text key={i} style={{ color: palette.main[500] }}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  )
}

export const formatTimeSecond = (duration: number, t: any) => {
  duration = Math.round(duration)
  return `${duration < 60 ? `${duration}${t("seconds")}` : t("mins_mins_seconds_seconds", {
    mins: Math.floor(duration / 60),
    seconds: duration % 60
  })}`
}

export const formatDuration = (t: any, duration: number) => {
    if (!duration) return `0${t("seconds")}`
    const totalTime = Math.round(duration)
    return totalTime > 60 ? t("mins_mins_seconds_seconds", {
        mins: Math.floor(totalTime / 60),
        seconds: totalTime % 60
    }) : `${Math.round(duration)}${t("seconds")}`
}

export const formatTimeDiff = (my: number, top: number, t: any) => {
    const diff = Math.round(my - top)
    let prefix = ""
    if (diff < 0) prefix = "-"
    if (diff > 0) prefix = "+"
    return `${prefix}${formatTimeSecond(Math.abs(diff), t)}`
}

export const formatTimeDiffV2 = (diff: number, t: any) => {
    let prefix = ""
    if (diff < 0) prefix = "-"
    if (diff > 0) prefix = "+"
    return `${prefix}${formatTimeSecond(Math.abs(diff), t)}`
}

export const toISOString =(time?: string) => {
    try {
        return moment(time).toISOString()
    } catch {
        return ""
    }
}

export * from './times'
