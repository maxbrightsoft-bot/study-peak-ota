import { createElement } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { AnnouncementEvent } from '../../configs/enums'
import useAnnouncementRealtime from '../useAnnouncementRealtime'

type Handler = { eventName: string; handler: (data: unknown) => void }
type Getter = () => Handler[]

const mockSubscribe = jest.fn((_p: unknown, _n: string, _g: Getter) => Promise.resolve({}))
const mockUnsubscribe = jest.fn((_p: unknown, _n: string, _g: Getter) => Promise.resolve())
const mockAuthState = {
  pusher: { id: 'pusher' } as object | null,
  user: { id: 12, academyDomain: 'sample' },
  selectedAcademy: null as { domain: string } | null,
  subscribeChannel: mockSubscribe,
  unsubscribeChannelSafe: mockUnsubscribe
}
jest.mock('@/store/useAuthStore', () => ({
  __esModule: true,
  default: (selector: (s: unknown) => unknown) => selector(mockAuthState)
}))

const mockActions = {
  onReceived: jest.fn(),
  onUpdated: jest.fn(),
  onDeleted: jest.fn(),
  refreshUnread: jest.fn(() => Promise.resolve()),
  reset: jest.fn()
}
jest.mock('@/store/useAnnouncementStore', () => ({
  __esModule: true,
  default: { getState: () => mockActions }
}))

const mockAppStateListeners: ((s: string) => void)[] = []
const mockRemove = jest.fn()
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: (_type: string, fn: (s: string) => void) => {
      mockAppStateListeners.push(fn)
      return { remove: mockRemove }
    }
  }
}))

const Host = () => {
  useAnnouncementRealtime()
  return null
}

const mount = () => {
  let renderer: ReactTestRenderer | undefined
  act(() => {
    renderer = create(createElement(Host))
  })
  return renderer as ReactTestRenderer
}

const handlersOf = (): Handler[] => mockSubscribe.mock.calls[0][2]()

beforeEach(() => {
  jest.clearAllMocks()
  mockAppStateListeners.length = 0
})

describe('useAnnouncementRealtime', () => {
  test('subscribes the user announcement channel with the three bell events and loads the count', () => {
    mount()
    expect(mockSubscribe).toHaveBeenCalledWith(
      mockAuthState.pusher,
      'ANNOUNCEMENT_ASAMPLE_U12_CHANNEL',
      expect.any(Function)
    )
    expect(handlersOf().map((h) => h.eventName).sort()).toEqual(
      [AnnouncementEvent.Received, AnnouncementEvent.Updated, AnnouncementEvent.Deleted].sort()
    )
    expect(mockActions.refreshUnread).toHaveBeenCalled()
  })

  test('passes parsed announcements to the store and ignores garbage', () => {
    mount()
    const by = (name: string) => handlersOf().find((h) => h.eventName === name)!.handler
    by(AnnouncementEvent.Received)(JSON.stringify({ id: 3, type: 'WrongNoteReminder' }))
    by(AnnouncementEvent.Updated)({ id: 4, type: 'StudyTimerTeacherMessage' })
    by(AnnouncementEvent.Deleted)({ id: 5, type: 'ReceivedNewNote' })
    by(AnnouncementEvent.Received)('garbage')
    expect(mockActions.onReceived).toHaveBeenCalledTimes(1)
    expect(mockActions.onReceived).toHaveBeenCalledWith({ id: 3, type: 'WrongNoteReminder' })
    expect(mockActions.onUpdated).toHaveBeenCalledWith({ id: 4, type: 'StudyTimerTeacherMessage' })
    expect(mockActions.onDeleted).toHaveBeenCalledWith({ id: 5, type: 'ReceivedNewNote' })
  })

  test('Review Focus 5: unmount unsubscribes the same getter and resets the store', () => {
    const renderer = mount()
    const getter = mockSubscribe.mock.calls[0][2]
    act(() => renderer.unmount())
    expect(mockUnsubscribe).toHaveBeenCalledWith(mockAuthState.pusher, 'ANNOUNCEMENT_ASAMPLE_U12_CHANNEL', getter)
    expect(mockActions.reset).toHaveBeenCalled()
  })

  test('does nothing without pusher', () => {
    const saved = mockAuthState.pusher
    mockAuthState.pusher = null
    mount()
    expect(mockSubscribe).not.toHaveBeenCalled()
    mockAuthState.pusher = saved
  })
})

describe('useAnnouncementRealtime: foreground (M5)', () => {
  test('re-reads the unread count when the app comes back to the foreground', () => {
    const renderer = mount()
    mockActions.refreshUnread.mockClear()
    mockAppStateListeners.forEach((fn) => fn('background'))
    expect(mockActions.refreshUnread).not.toHaveBeenCalled()
    mockAppStateListeners.forEach((fn) => fn('active'))
    expect(mockActions.refreshUnread).toHaveBeenCalledTimes(1)
    act(() => renderer.unmount())
    expect(mockRemove).toHaveBeenCalled()
  })
})
