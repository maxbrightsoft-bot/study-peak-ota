import crashlytics from '@react-native-firebase/crashlytics'

export const logError = (
  error: any,
  context?: Record<string, any>
) => {
  const instance = crashlytics()

  const status = error?.response?.status
  const apiMessage =
    error?.response?.data?.title ||
    error?.response?.data?.message

  const finalMessage =
    error?.message || apiMessage || 'UNKNOWN_ERROR'

  instance.log(`[ERROR] ${finalMessage}`)

  instance.setAttributes({
    status: status ? String(status) : '',
    apiMessage: apiMessage || '',
    errorMessage: finalMessage,
    ...(context
      ? Object.fromEntries(
          Object.entries(context).map(([k, v]) => [k, String(v)])
        )
      : {}),
  })

  const err =
    error instanceof Error ? error : new Error(finalMessage)

  instance.recordError(err)
}