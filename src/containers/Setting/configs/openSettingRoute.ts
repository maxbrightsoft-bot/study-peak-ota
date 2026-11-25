import { navigate } from '@/navigators/NavigationHelpers'

/**
 * The settings dialog is rendered by the header, i.e. outside the tab navigator that owns the
 * screens, so `useNavigation().navigate` cannot reach them ("action NAVIGATE was not handled").
 * Close the dialog, then navigate through the root navigation ref.
 */
export const openSettingRoute = (routeName: string, onClose: () => void) => {
  onClose()
  navigate(routeName)
}
