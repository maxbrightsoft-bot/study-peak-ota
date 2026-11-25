import { CommonActions } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import i18n from '@/languages/i18n'
import { navigationRef } from '@/navigators/NavigationHelpers'
import { MainRoutes, Routes } from '@/navigators/RouteName'
import { stopGuestPusher } from './guestPusher'
import { clearGuestSession } from './guestSession'

/** Forgets the guest on this device: token, local answer backups and the guest Pusher connection. */
export const dropGuestState = async () => {
  await clearGuestSession()
  await stopGuestPusher()
}

/**
 * Back to the code screen for the next child, with Login under it and nothing else: Back can't
 * return to an exam or a result that is over.
 */
export const resetToGuestStart = () => {
  const navigation = navigationRef?.current
  if (!navigation?.isReady?.()) return
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: MainRoutes.UnAuthStack,
          state: {
            index: 1,
            routes: [{ name: Routes.UnAuth.Login }, { name: Routes.UnAuth.GuestCode }]
          }
        }
      ]
    })
  )
}

let isExpiring = false

/** The guest token was revoked, ended or expired (401): the session is over. */
export const expireGuestSession = async () => {
  if (isExpiring) return
  isExpiring = true
  try {
    await dropGuestState()
    Toast.show({ type: 'error', text1: i18n.t('guest_session_ended') })
    resetToGuestStart()
  } finally {
    isExpiring = false
  }
}
