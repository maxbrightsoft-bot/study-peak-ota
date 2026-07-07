import crashlytics from '@react-native-firebase/crashlytics'
import { trackErrorStandalone } from '@/hooks/useActivityTracking'

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

  // Also track to our student activity log service
  trackErrorStandalone(error, {
    metaData: {
      crashlyticsLog: true,
      finalMessage,
      ...(context || {}),
    }
  }).catch(() => {})
}