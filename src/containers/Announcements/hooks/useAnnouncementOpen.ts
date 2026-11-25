import { useCallback, useState } from 'react'
import { getNoteByIdApi } from '@/containers/Home/apiClients'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import useAnnouncementStore from '@/store/useAnnouncementStore'
import useAuthStore from '@/store/useAuthStore'
import { FEATURE_MYWRONGNOTE, FEATURE_STUDYTIMER } from '@/utils/constants'
import { Role } from '@/utils/enums'
import { Notification } from '@/containers/Notice/configs/types'
import { announcementTarget } from '../configs/target'
import { AnnouncementResponse } from '../configs/types'
import { noteItemHtml } from '../configs/view'

/**
 * Tapping a bell item: marks it read, then opens where it points (same targets as the web student bell).
 * A note item opens over the bell (`note`, shown with NoticeDetailDialog); anything else closes the bell first.
 */
const useAnnouncementOpen = (onClose: () => void) => {
  const isStudentUser = useAuthStore((state) => !!state.user?.roles?.includes(Role.Student))
  const [note, setNote] = useState<Notification | undefined>()

  // The note dialog shows the note itself (a comment item carries only the comment): fetch it like the web
  // NoteDrawer; offline, fall back to what the item carries.
  const openNote = useCallback(async (noteId: number, a: AnnouncementResponse) => {
    try {
      const { data } = await getNoteByIdApi(noteId)
      setNote({
        id: noteId,
        name: data?.fullName ?? '',
        content: data?.content ?? '',
        createdAt: data?.createdAt ?? a.createdAt,
        notificationTypes: [],
        isNote: true
      })
    } catch {
      setNote({
        id: noteId,
        name: a.data?.senderFullName ?? '',
        content: noteItemHtml(a),
        createdAt: a.createdAt,
        notificationTypes: [],
        isNote: true
      })
    }
  }, [])

  const open = useCallback(
    (a: AnnouncementResponse) => {
      // Never throws: a lost race (already read on the Study Timer screen) only re-reads the count.
      if (!a.isRead) void useAnnouncementStore.getState().markRead(a.id)
      const target = announcementTarget(a, {
        isStudentUser,
myWrongNote: FEATURE_MYWRONGNOTE,
        studyTimer: FEATURE_STUDYTIMER
      })
      switch (target.kind) {
        case 'note': {
          void openNote(target.noteId, a)
          return
        }
        case 'myWrongNote':
          onClose()
          navigate(Routes.Auth.MyWrongNote, { ...target.params, deepLinkKey: Date.now() })
          return
        case 'examResultList':
          onClose()
          navigate(Routes.Auth.ExamResultList)
          return
        case 'studyTimer':
          onClose()
          navigate(Routes.Auth.StudyTimer, target.params)
          return
        default:
          return
      }
    },
    [isStudentUser, onClose, openNote]
  )

  const closeNote = useCallback(() => setNote(undefined), [])

  return { open, note, closeNote }
}

export default useAnnouncementOpen
