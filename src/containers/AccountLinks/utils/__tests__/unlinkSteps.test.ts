import { getResendSecondsLeft, getUnlinkStep, RESEND_SECONDS } from '../unlinkSteps'

const idle = { signingIn: false, hasChallenge: false, submitting: false, done: false }

describe('getUnlinkStep', () => {
  it('is idle before anything started', () => {
    expect(getUnlinkStep(idle)).toBe('idle')
  })

  it('is signing-in while Google sign-in / send-code runs', () => {
    expect(getUnlinkStep({ ...idle, signingIn: true })).toBe('signing-in')
  })

  it('asks for the code once a challenge exists', () => {
    expect(getUnlinkStep({ ...idle, hasChallenge: true })).toBe('code')
  })

  it('is submitting while the code is redeemed, even with a challenge', () => {
    expect(getUnlinkStep({ ...idle, hasChallenge: true, submitting: true })).toBe('submitting')
  })

  it('is done after success and wins over everything else', () => {
    expect(getUnlinkStep({ ...idle, hasChallenge: true, submitting: true, done: true })).toBe('done')
  })

  it('goes code -> signing-in -> code on resend', () => {
    expect(getUnlinkStep({ ...idle, hasChallenge: true })).toBe('code')
    expect(getUnlinkStep({ ...idle, hasChallenge: true, signingIn: true })).toBe('signing-in')
    expect(getUnlinkStep({ ...idle, hasChallenge: true })).toBe('code')
  })

  it('treats done as optional', () => {
    expect(getUnlinkStep({ signingIn: false, hasChallenge: false, submitting: false })).toBe('idle')
  })
})

describe('getResendSecondsLeft', () => {
  it('waits the full cooldown right after sending', () => {
    expect(getResendSecondsLeft(1000, 1000)).toBe(RESEND_SECONDS)
  })

  it('counts down and rounds partial seconds up', () => {
    expect(getResendSecondsLeft(0, 10_500)).toBe(50)
  })

  it('allows resend after the cooldown', () => {
    expect(getResendSecondsLeft(0, 60_000)).toBe(0)
    expect(getResendSecondsLeft(0, 90_000)).toBe(0)
  })

  it('never exceeds the cooldown when now is slightly behind', () => {
    expect(getResendSecondsLeft(1500, 1000)).toBe(RESEND_SECONDS)
  })
})
