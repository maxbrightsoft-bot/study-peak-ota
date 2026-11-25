import { useTranslation } from 'react-i18next'
import useAuthStore from '@/store/useAuthStore'
import { toast } from '@/utils/helpers'
import useLogin from '@/containers/Login/hooks/useLogin'
import { getInfo } from '@/containers/Login/apiClients/accountService'
import { setDataStorage } from '@/utils/storage'
import { ACCESS_TOKEN } from '@/utils/constants'
import { Role } from '@/utils/enums'
import { LoginResponse } from '@/utils/types/login'

/** Session changes after a merge. */
const useSwitchSession = () => {
  const { t } = useTranslation()
  const { handleLogin } = useLogin()

  /**
   * MergeMeIntoOther: this account is closed and its tokens are revoked. Switch to the staying account's sign-in
   * the same way a login stores it (token, academy domain, learning space, user, redirect into the app).
   */
  const switchToLoginResponse = async (loginResponse: LoginResponse) => {
    try {
      // Store the new token first: the interceptor then ignores 401s from requests still sent with the revoked one.
      await setDataStorage(ACCESS_TOKEN, loginResponse.token)
      const { pusher, channel, disconnectPusher, setAcademies } = useAuthStore.getState()
      try {
        // The live connection and its channels belong to the closed account; the layout reconnects for the new user.
        await disconnectPusher(pusher, channel)
      } catch (error) {
        console.warn('[AccountLinks] Pusher disconnect failed:', error)
      }
      setAcademies([])
      // A failing switch logs out (isLogout): never keep the new token with the old user.
      await handleLogin(async () => loginResponse, true)
      // handleLogin reports its own failures instead of throwing: the stored user tells whether the switch happened.
      if (useAuthStore.getState().user?.id !== loginResponse.user?.id) throw new Error('SESSION_SWITCH_FAILED')
    } catch (error) {
      // The old session is already revoked server-side: sign out fully and ask to sign in again.
      console.warn('[AccountLinks] Switching the session failed:', error)
      toast.error(t('please_log_in_again'))
      await useAuthStore.getState().logout()
    }
  }

  /** MergeOtherIntoMe: the session stays, but the profile values may have changed. */
  const refreshUser = async () => {
    const { user, setUser } = useAuthStore.getState()
    if (!user) return
    try {
      const res = await getInfo(Role.Student, !!user.isLearningSpace)
      if (res.data) setUser({ ...user, ...res.data })
    } catch (error) {
      console.warn('[AccountLinks] Refreshing the user failed:', error)
    }
  }

  return { switchToLoginResponse, refreshUser }
}

export default useSwitchSession
