import { Audio } from 'expo-av'

let activeSound: Audio.Sound | null = null
let generation = 0

export const createAudioToastSession = () => {
  generation += 1
  const session = generation

  return {
    session,
    isActive: () => session === generation
  }
}

export const setAudioToastSound = async (sound: Audio.Sound, session: number) => {
  if (session !== generation) {
    await sound.stopAsync().catch(() => undefined)
    await sound.unloadAsync().catch(() => undefined)
    return false
  }

  activeSound = sound
  return true
}

export const clearAudioToastSound = (sound?: Audio.Sound | null) => {
  if (!sound || activeSound === sound) {
    activeSound = null
  }
}

export const stopAudioToastSound = async () => {
  generation += 1
  const sound = activeSound
  activeSound = null

  if (!sound) return

  await sound.stopAsync().catch(() => undefined)
  await sound.unloadAsync().catch(() => undefined)
}
