import { autoReconnectPusher, isPusherForOtherAcademy, setPusherDisconnectRequested } from '../pusher'

jest.mock('@pusher/pusher-websocket-react-native', () => ({ Pusher: {} }))

const fakePusher = () =>
  ({ connectionState: 'DISCONNECTED', connect: jest.fn(() => Promise.resolve()) }) as unknown as Parameters<
    typeof autoReconnectPusher
  >[0] & { connect: jest.Mock }

afterEach(() => setPusherDisconnectRequested(false))

describe('autoReconnectPusher', () => {
  test('reconnects a connection that dropped on its own', async () => {
    const pusher = fakePusher()
    await autoReconnectPusher(pusher)
    expect(pusher.connect).toHaveBeenCalledTimes(1)
  })

  test('does not reconnect after the app disconnected on purpose (academy switch / logout)', async () => {
    const pusher = fakePusher()
    setPusherDisconnectRequested(true)
    await autoReconnectPusher(pusher)
    expect(pusher.connect).not.toHaveBeenCalled()
  })

  test('reconnects again once a new connection was requested', async () => {
    const pusher = fakePusher()
    setPusherDisconnectRequested(true)
    setPusherDisconnectRequested(false)
    await autoReconnectPusher(pusher)
    expect(pusher.connect).toHaveBeenCalledTimes(1)
  })
})

describe('isPusherForOtherAcademy', () => {
  test('is true when the live connection was opened for another academy (first switch after launch)', () => {
    expect(isPusherForOtherAcademy('sample', 'local-2')).toBe(true)
  })

  test('is false for the same academy, ignoring case and spaces', () => {
    expect(isPusherForOtherAcademy('sample', 'sample')).toBe(false)
    expect(isPusherForOtherAcademy(' Sample ', 'SAMPLE')).toBe(false)
  })

  test('is false when either side is unknown (no academy: study space, or a connection without a recorded academy)', () => {
    expect(isPusherForOtherAcademy(undefined, 'sample')).toBe(false)
    expect(isPusherForOtherAcademy('sample', '')).toBe(false)
    expect(isPusherForOtherAcademy('sample', undefined)).toBe(false)
  })
})
