import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/store/useAuthStore'
import useStudyTimerStore, { isStudyTimerStudent } from '@/store/useStudyTimerStore'
import { toast } from '@/utils/helpers'
import { StudyTimerAnnouncementEvent } from '../configs/enums'
import { goalNoticeText, parseGoalNotice, studyTimerAnnouncementChannel } from '../configs/helpers'
import { StudyTimerAnnouncementPayload } from '../configs/types'

/**
 * Mount once in the authorized layout. While the app is open, listens on the student's announcement channel:
 * a StudyTimerGoalUpdated bell item shows a toast with the web bell text, and any goal change reloads the
 * study-timer screens and the badge. Nothing is stored on the device (mobile has no bell list).
 */
const useStudyTimerGoalNotice = () => {
  const { t } = useTranslation()
  const pusher = useAuthStore((state) => state.pusher)
  const userId = useAuthStore((state) => state.user?.id)
  const academyDomain = useAuthStore(
    (state) => state.selectedAcademy?.domain || state.user?.academyDomain
  )
  const subscribeChannel = useAuthStore((state) => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore((state) => state.unsubscribeChannelSafe)

  const tRef = useRef(t)
  tRef.current = t

  useEffect(() => {
    if (!pusher || !userId || !academyDomain || !isStudyTimerStudent()) return

    const refresh = () => {
      useStudyTimerStore.getState().requestRefresh()
      void useStudyTimerStore.getState().refreshBadge()
    }
    // New notice, or the unread one rewritten by a later change: show the current text.
    const handleGoalNotice = (data: unknown) => {
      const notice = parseGoalNotice(data as StudyTimerAnnouncementPayload)
      if (!notice) return
      toast.info(goalNoticeText(notice, tRef.current))
      refresh()
    }
    // The teacher changed the goal back: the notice is gone, nothing to announce.
    const handleGoalNoticeDeleted = (data: unknown) => {
      if (parseGoalNotice(data as StudyTimerAnnouncementPayload)) refresh()
    }
    // Kept stable so unsubscribeChannelSafe removes exactly this getter (other hooks may share the channel).
    const getHandlers = () => [
      { eventName: StudyTimerAnnouncementEvent.ReceivedAnnouncement, handler: handleGoalNotice },
      { eventName: StudyTimerAnnouncementEvent.UpdatedAnnouncement, handler: handleGoalNotice },
      { eventName: StudyTimerAnnouncementEvent.DeletedAnnouncement, handler: handleGoalNoticeDeleted },
      { eventName: StudyTimerAnnouncementEvent.GoalChanged, handler: refresh }
    ]
    const channelName = studyTimerAnnouncementChannel(academyDomain, userId)

    subscribeChannel(pusher, channelName, getHandlers).catch((err) => {
      if (__DEV__) console.warn('[StudyTimer] announcement subscription failed', err)
    })
    return () => {
      void unsubscribeChannelSafe(pusher, channelName, getHandlers)
    }
  }, [pusher, userId, academyDomain, subscribeChannel, unsubscribeChannelSafe])
}

export default useStudyTimerGoalNotice
