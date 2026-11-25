export const RESEND_SECONDS = 60

export type UnlinkStep = 'idle' | 'signing-in' | 'code' | 'submitting' | 'done'

export type UnlinkState = {
  /** Google sign-in (and the send-code call behind it) is running. */
  signingIn: boolean
  /** A code was emailed and its challenge is alive. */
  hasChallenge: boolean
  /** The DELETE with the code is running. */
  submitting: boolean
  /** The DELETE succeeded. */
  done?: boolean
}

/** Where the Google unlink flow is: idle → signing-in → code → submitting → done. */
export const getUnlinkStep = ({ signingIn, hasChallenge, submitting, done }: UnlinkState): UnlinkStep => {
  if (done) return 'done'
  if (submitting) return 'submitting'
  // A resend signs in again while the old challenge is still around.
  if (signingIn) return 'signing-in'
  if (hasChallenge) return 'code'
  return 'idle'
}

/** Whole seconds until Resend is allowed again (0 = allowed). */
export const getResendSecondsLeft = (sentAt: number, now: number, cooldown = RESEND_SECONDS) =>
  Math.min(cooldown, Math.max(0, Math.ceil(cooldown - (now - sentAt) / 1000)))
