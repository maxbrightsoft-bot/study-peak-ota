import { createElement } from 'react'
import { act, create } from 'react-test-renderer'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { AnnouncementType } from '../../configs/enums'
import { AnnouncementResponse } from '../../configs/types'
import useAnnouncementOpen from '../useAnnouncementOpen'

jest.mock('@/navigators/NavigationHelpers', () => ({ navigate: jest.fn() }))
const mockGetNote = jest.fn()
jest.mock('@/containers/Home/apiClients', () => ({ getNoteByIdApi: (id: number) => mockGetNote(id) }))
jest.mock('@/utils/constants', () => ({ FEATURE_MYWRONGNOTE: true, FEATURE_STUDYTIMER: true }))

const mockAuthState = { user: { id: 12, roles: ['Student'] } }
jest.mock('@/store/useAuthStore', () => ({
  __esModule: true,
  default: (selector: (s: unknown) => unknown) => selector(mockAuthState)
}))

const mockMarkRead = jest.fn(() => Promise.resolve())
jest.mock('@/store/useAnnouncementStore', () => ({
  __esModule: true,
  default: { getState: () => ({ markRead: mockMarkRead }) }
}))

type Opened = ReturnType<typeof useAnnouncementOpen>

const make = (type: string, extra: Record<string, unknown> | null, over: Partial<AnnouncementResponse> = {}, data = '') =>
  ({
    id: 31,
    isRead: false,
    type,
    extraData: extra ? JSON.stringify(extra) : '',
    createdAt: '2026-11-08T01:00:00',
    resourceId: '',
    resource: '',
    data: { senderId: 2, senderFullName: 'Marcus', senderEmail: '', senderAvatar: '', senderRoles: ['Teacher'], data },
    ...over
  }) as AnnouncementResponse

const setup = () => {
  const onClose = jest.fn()
  const ref: { current?: Opened } = {}
  const Host = () => {
    ref.current = useAnnouncementOpen(onClose)
    return null
  }
  act(() => {
    create(createElement(Host))
  })
  return { onClose, hook: () => ref.current as Opened }
}

beforeEach(() => jest.clearAllMocks())

describe('useAnnouncementOpen', () => {
  test('an unread study-timer message is marked read, closes the bell and opens that message', () => {
    const { onClose, hook } = setup()
    act(() => hook().open(make(AnnouncementType.StudyTimerTeacherMessage, {})))
    expect(mockMarkRead).toHaveBeenCalledWith(31)
    expect(onClose).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(Routes.Auth.StudyTimer, { messageId: 31 })
  })

  test('a read wrong-note item is not marked again and opens My Wrong Note on its exam and question', () => {
    const { hook } = setup()
    act(() =>
      hook().open(
        make(AnnouncementType.WrongNoteRejected, { examSessionId: 2407, studentExamSessionId: 2585, questionId: 77 }, {
          isRead: true
        })
      )
    )
    expect(mockMarkRead).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(
      Routes.Auth.MyWrongNote,
      expect.objectContaining({ examSessionId: 2407, studentExamSessionId: 2585, questionSuperId: 77, deepLinkKey: expect.any(Number) })
    )
  })

  test('a note item opens the note over the bell without closing it', async () => {
    mockGetNote.mockRejectedValue(new Error('offline'))
    const { onClose, hook } = setup()
    await act(async () => hook().open(make(AnnouncementType.ReceivedNewNote, null, {}, '9|hello')))
    expect(onClose).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
    expect(hook().note).toEqual(expect.objectContaining({ id: 9, isNote: true, content: 'hello' }))
    act(() => hook().closeNote())
    expect(hook().note).toBeUndefined()
  })

  test('I3: a comment item shows the note itself (fetched by id), not the comment', async () => {
    mockGetNote.mockResolvedValue({
      data: { id: 9, content: '<p>the note</p>', fullName: 'Teacher Marcus', createdAt: '2026-11-01T00:00:00' }
    })
    const { hook } = setup()
    await act(async () =>
      hook().open(make(AnnouncementType.ReceivedNoteComment, null, {}, '9|3||<p>nice</p>'))
    )
    expect(mockGetNote).toHaveBeenCalledWith(9)
    expect(hook().note).toEqual(
      expect.objectContaining({ id: 9, content: '<p>the note</p>', name: 'Teacher Marcus', createdAt: '2026-11-01T00:00:00' })
    )
  })

  test('I3: a new note whose body contains "|" keeps the whole body when the fetch fails', async () => {
    mockGetNote.mockRejectedValue(new Error('offline'))
    const { hook } = setup()
    await act(async () => hook().open(make(AnnouncementType.ReceivedNewNote, null, {}, '9|a|b|c|d')))
    expect(hook().note?.content).toBe('a|b|c|d')
  })

  test('a teacher-only item is only marked read', () => {
    const { onClose, hook } = setup()
    act(() => hook().open(make(AnnouncementType.StudyTimerReplied, {})))
    expect(mockMarkRead).toHaveBeenCalledWith(31)
    expect(onClose).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
