import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/utils/helpers'
import useAuthStore from '@/store/useAuthStore'
import { getConflictProfilesApi, requestAdminMergeApi, sendConflictCodeApi, verifyConflictApi } from '../apiClients'
import { LinkConflict, LinkProvider, MergeDirection, ProfileChoices, ProfileFields } from '../configs/types'
import { defaultChoicesFor, fromApiProfile } from '../utils/profileChoices'
import { getAccountLinkErrorMessage, isValidCode } from '../utils/linkRules'
import useSwitchSession from './useSwitchSession'

export type ConflictStep = 'choose' | 'code' | 'direction' | 'fields' | 'admin' | 'adminSent' | 'expired'

type Params = {
  conflict?: LinkConflict
  provider: LinkProvider
  onClose: () => void
  /** The other account was merged into this one (the current session stays). */
  onMerged: () => void
}

type Profiles = { current: ProfileFields; other: ProfileFields }

const statusOf = (error: unknown) => (error as { response?: { status?: number } })?.response?.status

const useLinkConflict = ({ conflict, provider, onClose, onMerged }: Params) => {
  const { t } = useTranslation()
  const { switchToLoginResponse, refreshUser } = useSwitchSession()
  const [step, setStep] = useState<ConflictStep>('choose')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [direction, setDirection] = useState<MergeDirection>('MergeOtherIntoMe')
  const [profiles, setProfiles] = useState<Profiles>()
  const [choices, setChoices] = useState<ProfileChoices>()
  // The direction the choices were made for: keep manual picks until the direction changes.
  const [choicesDirection, setChoicesDirection] = useState<MergeDirection>()
  const [note, setNote] = useState('')

  const conflictToken = conflict?.conflictToken
  const email = conflict?.otherAccountMaskedEmail || ''

  useEffect(() => {
    if (!conflictToken) return
    setStep('choose')
    setBusy(false)
    setError('')
    setCode('')
    setDirection('MergeOtherIntoMe')
    setProfiles(undefined)
    setChoices(undefined)
    setChoicesDirection(undefined)
    setNote('')
  }, [conflictToken])

  const goTo = (next: ConflictStep) => {
    setError('')
    setStep(next)
  }

  const fetchProfiles = async (token: string): Promise<Profiles> => {
    const res = await getConflictProfilesApi(token)
    return { current: fromApiProfile(res.data.current), other: fromApiProfile(res.data.other) }
  }

  /**
   * A dead conflict token (expired after 15 min, already used, other account gone) answers 400 InvalidConflictToken,
   * only as a localized title like the code errors. The read-only profiles route checks nothing but the token,
   * so a 400 there means the token is dead.
   */
  const isTokenDead = async () => {
    if (!conflictToken) return true
    try {
      const data = await fetchProfiles(conflictToken)
      setProfiles(prev => prev ?? data)
      return false
    } catch (err) {
      return statusOf(err) === 400
    }
  }

  /** Shows the error; a 400 caused by a dead token moves to the "start again" step instead. */
  const handleError = async (err: unknown, onOtherBadRequest?: () => void) => {
    if (statusOf(err) === 400) {
      if (await isTokenDead()) {
        goTo('expired')
        return
      }
      onOtherBadRequest?.()
    }
    setError(getAccountLinkErrorMessage(t, err))
  }

  const run = async (action: (token: string) => Promise<void>, onOtherBadRequest?: () => void) => {
    if (busy || !conflictToken) return
    setBusy(true)
    setError('')
    try {
      await action(conflictToken)
    } catch (err) {
      await handleError(err, onOtherBadRequest)
    } finally {
      setBusy(false)
    }
  }

  const handleSendCode = () =>
    run(async token => {
      await sendConflictCodeApi(token)
      toast.success(t('code_sent_to', { email }))
      setCode('')
      goTo('code')
    })

  const handleChangeCode = (value: string) => setCode(value.replace(/\D/g, '').slice(0, 6))

  const handleOpenFields = () =>
    run(async token => {
      let data = profiles
      if (!data) {
        data = await fetchProfiles(token)
        setProfiles(data)
      }
      if (!choices || choicesDirection !== direction) {
        setChoices(defaultChoicesFor(data.current, data.other, direction))
        setChoicesDirection(direction)
      }
      goTo('fields')
    })

  const handleVerify = () => {
    if (!choices) return
    // Token still alive: the 400 is about the code (wrong / expired / locked): back to the code input.
    return run(async token => {
      const res = await verifyConflictApi({ conflictToken: token, code, direction, profileChoices: choices })
      const { loginResponse, providerLinked } = res.data
      // One toast at a time: the "kept a different login" note matters more than the plain success.
      const notify = (message: string) =>
        providerLinked ? toast.success(message) : toast.info(`${message} ${t('provider_not_moved', { provider })}`)
      if (direction === 'MergeMeIntoOther') {
        notify(t('merge_done_switching'))
        onClose()
        // This account is closed and its token revoked: never keep using the old session.
        if (loginResponse?.token) await switchToLoginResponse(loginResponse)
        else await useAuthStore.getState().logout()
        return
      }
      notify(t('merge_done'))
      await refreshUser()
      onMerged()
      onClose()
    }, () => setStep('code'))
  }

  const handleRequestAdmin = () =>
    run(async token => {
      await requestAdminMergeApi(token, note.trim())
      goTo('adminSent')
    })

  return {
    t,
    step,
    busy,
    error,
    email,
    code,
    codeValid: isValidCode(code),
    direction,
    profiles,
    choices,
    note,
    goTo,
    setDirection,
    setChoices,
    setNote,
    handleChangeCode,
    handleSendCode,
    handleOpenFields,
    handleVerify,
    handleRequestAdmin
  }
}

export default useLinkConflict
