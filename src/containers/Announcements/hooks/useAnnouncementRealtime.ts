import { useEffect } from 'react'
import { AppState } from 'react-native'
import useAuthStore from '@/store/useAuthStore'
import useAnnouncementStore from '@/store/useAnnouncementStore'
import { AnnouncementEvent } from '../configs/enums'
import { announcementChannel, toAnnouncement } from '../configs/helpers'
import { AnnouncementResponse } from '../configs/types'

/**
 * Mount once in the authorized layout. Keeps the bell's list and unread count live on the user's announcement
 * channel (shared with useStudyTimerGoalNotice: each hook registers its own handler getter).
 * Leaving the academy or the account unsubscribes and empties the bell.
 */
const useAnnouncementRealtime = () => {
  const pusher = useAuthStore((state) => state.pusher)
  const userId = useAuthStore((state) => state.user?.id)
  const academyDomain = useAuthStore((state) => state.selectedAcademy?.domain || state.user?.academyDomain)
  const subscribeChannel = useAuthStore((state) => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore((state) => state.unsubscribeChannelSafe)

  useEffect(() => {
    if (!pusher || !userId || !academyDomain) return

    const store = useAnnouncementStore.getState
    const forward = (apply: (a: AnnouncementResponse) => void) => (data: unknown) => {
      const announcement = toAnnouncement(data)
      if (announcement) apply(announcement)
    }
    const handlers = [
      { eventName: AnnouncementEvent.Received, handler: forward((a) => store().onReceived(a)) },
      { eventName: AnnouncementEvent.Updated, handler: forward((a) => store().onUpdated(a)) },
      { eventName: AnnouncementEvent.Deleted, handler: forward((a) => store().onDeleted(a)) }
    ]
    // Kept stable so unsubscribeChannelSafe removes exactly this getter.
    const getHandlers = () => handlers
    const channelName = announcementChannel(academyDomain, userId)

    void store().refreshUnread()
    subscribeChannel(pusher, channelName, getHandlers).catch((err) => {
      if (__DEV__) console.warn('[Announcements] subscription failed', err)
    })
    // Reads elsewhere (web, another device) send no push: re-read the count when the app comes back.
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') void store().refreshUnread()
    })
    return () => {
      appState.remove()
      void unsubscribeChannelSafe(pusher, channelName, getHandlers)
      store().reset()
    }
  }, [pusher, userId, academyDomain, subscribeChannel, unsubscribeChannelSafe])
}

export default useAnnouncementRealtime
