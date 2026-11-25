import AsyncStorage from '@react-native-async-storage/async-storage'
import { GUEST_ACADEMY_KEY } from '../configs/constants'
import { GuestAcademy } from '../configs/types'

/** The last academy picked on this device (shared tablets keep it for the next child). */
export const loadGuestAcademy = async (): Promise<GuestAcademy | undefined> => {
  try {
    const raw = await AsyncStorage.getItem(GUEST_ACADEMY_KEY)
    if (!raw) return undefined
    const academy = JSON.parse(raw) as Partial<GuestAcademy>
    if (!academy || (!academy.domain && !academy.isLearningSpace)) return undefined
    return {
      name: academy.name || academy.domain || '',
      domain: academy.isLearningSpace ? '' : academy.domain || '',
      isLearningSpace: !!academy.isLearningSpace
    }
  } catch {
    return undefined
  }
}

export const saveGuestAcademy = async (academy: GuestAcademy) => {
  try {
    await AsyncStorage.setItem(GUEST_ACADEMY_KEY, JSON.stringify(academy))
  } catch {
    // Not remembered this time; the picker still works.
  }
}
