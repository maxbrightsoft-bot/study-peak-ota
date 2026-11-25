import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin'
import appleAuth from '@invertase/react-native-apple-authentication'
import { decodeJwtPayload, toast } from '@/utils/helpers'
import {
  getAccountLinksApi,
  linkAppleAccountApi,
  linkGoogleAccountApi,
  sendUnlinkGoogleCodeApi,
  unlinkAccountApi,
  unlinkGoogleAccountApi
} from '../apiClients'
import { AccountLinksResponse, LinkConflict, LinkProvider } from '../configs/types'
import { CODE_LENGTH, getAccountLinkErrorMessage, isValidCode } from '../utils/linkRules'
import { getResendSecondsLeft, getUnlinkStep } from '../utils/unlinkSteps'

/** Apple linking only exists on iOS; Android shows Google only. */
export const LINK_PROVIDERS: LinkProvider[] = Platform.OS === 'ios' ? ['Google', 'Apple'] : ['Google']

type ConflictState = LinkConflict & { provider: LinkProvider }

/** The emailed Google unlink challenge. The Google token is never kept: Resend signs in again. */
type UnlinkChallenge = { unlinkToken: string; email: string; sentAt: number }

const useLinkedAccounts = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [links, setLinks] = useState<AccountLinksResponse>()
  const [busyProvider, setBusyProvider] = useState<LinkProvider>()
  const [unlinkProvider, setUnlinkProvider] = useState<LinkProvider>()
  const [conflict, setConflict] = useState<ConflictState>()
  const [unlinkChallenge, setUnlinkChallenge] = useState<UnlinkChallenge>()
  const [unlinkSigningIn, setUnlinkSigningIn] = useState(false)
  const [unlinkCode, setUnlinkCode] = useState('')
  const [unlinkError, setUnlinkError] = useState<string>()
  const [unlinkSubmitting, setUnlinkSubmitting] = useState(false)
  const [now, setNow] = useState(Date.now())

  const load = useCallback(async () => {
    try {
      const res = await getAccountLinksApi()
      setLinks(res.data)
    } catch (error) {
      toast.error(getAccountLinkErrorMessage(t, error))
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  /** Google sign-in like the login screen; undefined when the user cancelled. */
  const getGoogleBody = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      // Sign out of the previous Google session (not of the app) so the user can pick the account to link.
      await GoogleSignin.signOut().catch(() => undefined)
      const response = await GoogleSignin.signIn()
      if (!isSuccessResponse(response)) return undefined
      const idToken = response.data.idToken
      if (!idToken) throw new Error('NO_ID_TOKEN')
      const payload = decodeJwtPayload<{ email?: string; sub?: string }>(idToken)
      const email = response.data.user?.email || payload.email || ''
      const googleId = payload.sub || response.data.user?.id || ''
      if (!email || !googleId) throw new Error('NO_GOOGLE_PROFILE')
      return { token: idToken, googleId, email }
    } catch (error) {
      const silent =
        isErrorWithCode(error) && [statusCodes.SIGN_IN_CANCELLED, statusCodes.IN_PROGRESS].includes(error.code as string)
      if (!silent) toast.error(t('google_sign_in_failed'))
      return undefined
    }
  }

  /** Apple identity token like the login screen; undefined when the user cancelled. */
  const getAppleBody = async () => {
    try {
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
      })
      if (!response.identityToken) throw new Error('NO_IDENTITY_TOKEN')
      return { token: response.identityToken }
    } catch (error) {
      if ((error as { code?: string })?.code !== appleAuth.Error.CANCELED) toast.error(t('apple_sign_in_failed'))
      return undefined
    }
  }

  const handleLink = async (provider: LinkProvider) => {
    if (busyProvider) return
    setBusyProvider(provider)
    try {
      let link: (() => Promise<unknown>) | undefined
      if (provider === 'Google') {
        const body = await getGoogleBody()
        if (body) link = () => linkGoogleAccountApi(body)
      } else {
        const body = await getAppleBody()
        if (body) link = () => linkAppleAccountApi(body)
      }
      if (!link) return
      try {
        await link()
        toast.success(t('account_linked_success', { provider }))
        await load()
      } catch (error) {
        const response = (error as { response?: { status?: number; data?: Partial<LinkConflict> } })?.response
        if (response?.status === 409 && response.data?.conflictToken)
          setConflict({ ...(response.data as LinkConflict), provider })
        else toast.error(getAccountLinkErrorMessage(t, error))
      }
    } finally {
      setBusyProvider(undefined)
    }
  }

  const handleConfirmUnlink = async () => {
    const provider = unlinkProvider
    setUnlinkProvider(undefined)
    if (!provider) return
    setBusyProvider(provider)
    try {
      await unlinkAccountApi(provider)
      toast.success(t('account_unlinked_success', { provider }))
      await load()
    } catch (error) {
      toast.error(getAccountLinkErrorMessage(t, error))
    } finally {
      setBusyProvider(undefined)
    }
  }

  // Ticks only while the code dialog is open, to drive the Resend countdown.
  const hasUnlinkChallenge = !!unlinkChallenge
  useEffect(() => {
    if (!hasUnlinkChallenge) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [hasUnlinkChallenge])

  /** Unlinking Google: Google sign-in first (proves the account), then an emailed code. */
  const handleStartGoogleUnlink = async () => {
    if (busyProvider) return
    const resending = !!unlinkChallenge
    setBusyProvider('Google')
    setUnlinkSigningIn(true)
    try {
      // Cancelling the sign-in leaves any current code step as it is.
      const body = await getGoogleBody()
      if (!body) return
      try {
        const res = await sendUnlinkGoogleCodeApi(body)
        const sentAt = Date.now()
        setNow(sentAt)
        setUnlinkCode('')
        setUnlinkError(undefined)
        setUnlinkChallenge({ unlinkToken: res.data.unlinkToken, email: body.email, sentAt })
        if (resending) toast.success(t('code_sent_to', { email: body.email }))
      } catch (error) {
        if (resending) setUnlinkError(getAccountLinkErrorMessage(t, error))
        else toast.error(getAccountLinkErrorMessage(t, error))
      }
    } finally {
      setUnlinkSigningIn(false)
      setBusyProvider(undefined)
    }
  }

  const handleOpenUnlink = (provider: LinkProvider) => {
    if (provider === 'Google') handleStartGoogleUnlink()
    else setUnlinkProvider(provider)
  }

  const handleCloseGoogleUnlink = () => {
    if (unlinkSubmitting) return
    setUnlinkChallenge(undefined)
    setUnlinkCode('')
    setUnlinkError(undefined)
  }

  const handleChangeUnlinkCode = (value: string) => setUnlinkCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH))

  /** Resend = Google sign-in again, then a fresh code (the old challenge is replaced). */
  const handleResendUnlinkCode = () => {
    if (!unlinkChallenge || unlinkSubmitting || getResendSecondsLeft(unlinkChallenge.sentAt, Date.now()) > 0) return
    handleStartGoogleUnlink()
  }

  const handleConfirmGoogleUnlink = async () => {
    if (!unlinkChallenge || unlinkSubmitting || !isValidCode(unlinkCode)) return
    setUnlinkSubmitting(true)
    setUnlinkError(undefined)
    try {
      await unlinkGoogleAccountApi({ unlinkToken: unlinkChallenge.unlinkToken, code: unlinkCode })
      setUnlinkChallenge(undefined)
      setUnlinkCode('')
      toast.success(t('account_unlinked_success', { provider: 'Google' }))
      await load()
    } catch (error) {
      setUnlinkError(getAccountLinkErrorMessage(t, error))
    } finally {
      setUnlinkSubmitting(false)
    }
  }

  const unlinkStep = getUnlinkStep({
    signingIn: unlinkSigningIn,
    hasChallenge: !!unlinkChallenge,
    submitting: unlinkSubmitting
  })
  const resendSecondsLeft = unlinkChallenge ? getResendSecondsLeft(unlinkChallenge.sentAt, now) : 0

  const handleCloseConflict = () => setConflict(undefined)

  /** Dead conflict token: close the dialog and run the link again for a fresh one. */
  const handleRestartLink = () => {
    const provider = conflict?.provider
    setConflict(undefined)
    if (provider) handleLink(provider)
  }

  return {
    t,
    goBack: () => navigation.goBack(),
    links,
    busyProvider,
    unlinkProvider,
    conflict,
    unlinkStep,
    unlinkEmail: unlinkChallenge?.email ?? '',
    unlinkCode,
    unlinkError,
    resendSecondsLeft,
    load,
    handleLink,
    handleOpenUnlink,
    handleCloseGoogleUnlink,
    handleChangeUnlinkCode,
    handleResendUnlinkCode,
    handleConfirmGoogleUnlink,
    handleCloseUnlink: () => setUnlinkProvider(undefined),
    handleConfirmUnlink,
    handleCloseConflict,
    handleRestartLink
  }
}

export default useLinkedAccounts
