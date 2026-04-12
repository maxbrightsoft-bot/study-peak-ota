import crashlytics from '@react-native-firebase/crashlytics'

export const logEvent = (event: string, data?: Record<string, any>) => {
  const instance = crashlytics()

  instance.log(`[EVENT] ${event}`)

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      instance.setAttribute(key, String(value))
    })
  }
}

export const logError = (error: any, context?: Record<string, any>) => {
  const instance = crashlytics()

  const status = error?.response?.status
  const apiMessage =
    error?.response?.data?.title ||
    error?.response?.data?.message

  const finalMessage =
    error?.message || apiMessage || 'UNKNOWN_ERROR'

  instance.log(`[ERROR] ${finalMessage}`)

  if (status) instance.setAttribute('status', String(status))
  if (apiMessage) instance.setAttribute('apiMessage', apiMessage)
  instance.setAttribute('errorMessage', finalMessage)

  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      instance.setAttribute(key, String(value))
    })
  }

  if (error instanceof Error) {
    instance.recordError(error)
  } else {
    instance.recordError(new Error(finalMessage))
  }
}