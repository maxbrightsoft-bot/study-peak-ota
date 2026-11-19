import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { getTimeZone } from 'react-native-localize'
import useAuthStore from '@/store/useAuthStore'
import { FEATURE_STUDYTIMER } from '@/utils/constants'
import { Role } from '@/utils/enums'
import { getMySummaryApi } from '@/containers/StudyTimer/apiClients'
import { todayIso } from '@/containers/StudyTimer/configs/helpers'
import { StudyTimerMySummaryResponse } from '@/containers/StudyTimer/configs/types'

export type StudyTimerBadge = {
  unreadMessages: number
  unclosedCount: number
  todayMinutes: number
  goalMinutes: number | null
}

interface StudyTimerState {
  badge: StudyTimerBadge | null
  /** Bumped when the server says study-timer data changed (e.g. the teacher changed the goal): screens reload. */
  refreshSeq: number
}

interface StudyTimerActions {
  /** Fetches me/summary for today only; swallows errors (the badge stays as is). No-op unless flag on and the user is a student. */
  refreshBadge: () => Promise<void>
  /** Writes the badge from a summary the page already loaded (also drops any older in-flight refresh). */
  setBadgeFromSummary: (summary: StudyTimerMySummaryResponse) => void
  setUnreadMessages: (count: number) => void
  clearBadge: () => void
  /** Tells open study-timer screens to reload (bumps refreshSeq). */
  requestRefresh: () => void
}

type StudyTimerStore = StudyTimerState & StudyTimerActions

export const isStudyTimerStudent = () =>
  FEATURE_STUDYTIMER && !!useAuthStore.getState().user?.roles?.includes(Role.Student)

export const toBadge = (s: StudyTimerMySummaryResponse): StudyTimerBadge => ({
  unreadMessages: s.unreadMessages ?? 0,
  unclosedCount: s.unclosed?.length ?? 0,
  todayMinutes: s.today?.studyMinutes ?? s.studyMinutes ?? 0,
  goalMinutes: s.goal?.dailyMinutes ?? null
})

let version = 0

const useStudyTimerStore = create<StudyTimerStore>()(
  immer((set) => ({
    badge: null,
    refreshSeq: 0,

    refreshBadge: async () => {
      if (!isStudyTimerStudent()) return
      const id = ++version
      try {
        const day = todayIso()
        const res = await getMySummaryApi({ from: day, to: day, tz: getTimeZone() })
        if (id !== version || !isStudyTimerStudent()) return
        const badge = toBadge(res.data)
        set((state) => {
          state.badge = badge
        })
      } catch {
        // keep the previous badge
      }
    },

    setBadgeFromSummary: (summary) => {
      version++
      const badge = toBadge(summary)
      set((state) => {
        state.badge = badge
      })
    },

    setUnreadMessages: (count) => {
      set((state) => {
        if (state.badge) state.badge.unreadMessages = Math.max(0, count)
      })
    },

    clearBadge: () => {
      version++
      set((state) => {
        state.badge = null
      })
    },

    requestRefresh: () => {
      set((state) => {
        state.refreshSeq += 1
      })
    }
  }))
)

export default useStudyTimerStore
