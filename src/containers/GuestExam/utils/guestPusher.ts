import useAuthStore from '@/store/useAuthStore'
import { PUSHER_CONFIG } from '@/utils/constants'
import { GuestSession } from './guestSession'

/**
 * Opens the shared Pusher connection for a guest (nobody signed in). Its authorizer posts to
 * `api/auth/pusher`, which the interceptor sends on the guest token: the BE only allows the exam
 * channel of the guest's code. Study Space has no academy channel, so no connection.
 */
export const startGuestPusher = async (session: GuestSession) => {
  const { user, initializePusher } = useAuthStore.getState()
  if (user || session.isLearningSpace || !session.domain || !PUSHER_CONFIG.key) return undefined
  try {
    return await initializePusher(session.domain, false)
  } catch {
    return undefined
  }
}

/** Closes the guest's Pusher connection (never a signed-in user's). */
export const stopGuestPusher = async () => {
  const { user, pusher, channel, disconnectPusher } = useAuthStore.getState()
  if (user || !pusher) return
  try {
    await disconnectPusher(pusher, channel)
  } catch {
    // Already closed.
  }
}
