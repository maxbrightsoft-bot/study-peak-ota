import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  clearGuestSession,
  getGuestAcademyHeaders,
  getGuestSession,
  isGuestAcademyOnlyRoute,
  isGuestTokenRoute,
  loadGuestSession,
  setGuestSession
} from '../guestSession'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

const BASE = 'https://api.example.com'

describe('isGuestTokenRoute', () => {
  it('allows the guest result and end routes and the Pusher auth route', () => {
    expect(isGuestTokenRoute(`${BASE}/api/guest-exams/result`, 'aB3kZ')).toBe(true)
    expect(isGuestTokenRoute(`${BASE}/api/guest-exams/end`, 'aB3kZ')).toBe(true)
    expect(isGuestTokenRoute(`${BASE}/api/auth/pusher`, 'aB3kZ')).toBe(true)
  })

  it('allows the exam routes of the guest code only, with the exact case', () => {
    ;['info', 'join', 'questions', 'answer', 'finish', 'student-pause-resume'].forEach(action =>
      expect(isGuestTokenRoute(`${BASE}/api/examSession/aB3kZ/${action}`, 'aB3kZ')).toBe(true)
    )
    expect(isGuestTokenRoute(`${BASE}/api/examSession/aB3kZ/join?auto=true`, 'aB3kZ')).toBe(true)
    expect(isGuestTokenRoute(`${BASE}/api/examSession/AB3KZ/questions`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/examSession/Other/questions`, 'aB3kZ')).toBe(false)
  })

  it('never gives the guest token to student-only or public routes', () => {
    expect(isGuestTokenRoute(`${BASE}/api/examSession/aB3kZ/status`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/examSession/aB3kZ/results`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/examSession/aB3kZ/results/percentages`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/examSession/aB3kZ/student-restart`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/guest-exams/aB3kZ`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/guest-exams/aB3kZ/start`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/guest-exams/academies`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/user/me`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(`${BASE}/api/auth/time`, 'aB3kZ')).toBe(false)
    expect(isGuestTokenRoute(undefined, 'aB3kZ')).toBe(false)
  })
})

describe('guest session storage', () => {
  it('drops the session and the guest answer backups, and keeps the student keys', async () => {
    await AsyncStorage.setItem('grc.aB3kZ', '{}')
    await AsyncStorage.setItem('grb.aB3kZ', '{}')
    await AsyncStorage.setItem('rc.1.aB3kZ.7', '{}')
    await setGuestSession({ token: 't', code: 'aB3kZ', domain: 'eum', isLearningSpace: false })
    expect(getGuestSession()?.code).toBe('aB3kZ')

    await clearGuestSession()

    expect(getGuestSession()).toBeUndefined()
    expect(await loadGuestSession()).toBeUndefined()
    expect(await AsyncStorage.getAllKeys()).toEqual(['rc.1.aB3kZ.7'])
  })
})

describe('getGuestAcademyHeaders', () => {
  it('sends the academy header, or the no-academy header for Study Space', () => {
    expect(getGuestAcademyHeaders('eum', false)).toEqual({ 'Academy-Headers': 'eum' })
    expect(getGuestAcademyHeaders('', true)).toEqual({ 'Accept-No-Academy': 'true' })
    expect(getGuestAcademyHeaders('', false)).toEqual({ 'Accept-No-Academy': 'true' })
  })
})

describe('isGuestAcademyOnlyRoute', () => {
  it('matches only the server clock route', () => {
    expect(isGuestAcademyOnlyRoute(`${BASE}/api/auth/time`)).toBe(true)
    expect(isGuestAcademyOnlyRoute(`${BASE}/api/Auth/Time?x=1`)).toBe(true)
    expect(isGuestAcademyOnlyRoute('/api/auth/time')).toBe(true)
  })

  it('never matches the token routes or other auth routes', () => {
    expect(isGuestAcademyOnlyRoute(`${BASE}/api/auth/pusher`)).toBe(false)
    expect(isGuestAcademyOnlyRoute(`${BASE}/api/auth/time/extra`)).toBe(false)
    expect(isGuestAcademyOnlyRoute(`${BASE}/api/auth/login`)).toBe(false)
    expect(isGuestAcademyOnlyRoute(`${BASE}/api/examSession/aB3kZ/info`)).toBe(false)
    expect(isGuestAcademyOnlyRoute(undefined)).toBe(false)
  })

  it('is not a guest-token route, so auth/time never carries the guest token', () => {
    expect(isGuestTokenRoute(`${BASE}/api/auth/time`, 'aB3kZ')).toBe(false)
  })
})
