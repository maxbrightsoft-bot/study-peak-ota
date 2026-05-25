import { AppAudioPlayer, stopAndReleaseAppAudioPlayer } from '@/utils/audio'

let activeSound: AppAudioPlayer | null = null
let generation = 0

export const createAudioToastSession = () => {
  generation += 1
  const session = generation

  return {
    session,
    isActive: () => session === generation
  }
}

export const setAudioToastSound = async (sound: AppAudioPlayer, session: number) => {
  if (session !== generation) {
    await stopAndReleaseAppAudioPlayer(sound)
    return false
  }

  activeSound = sound
  return true
}

export const clearAudioToastSound = (sound?: AppAudioPlayer | null) => {
  if (!sound || activeSound === sound) {
    activeSound = null
  }
}

export const stopAudioToastSound = async () => {
  generation += 1
  const sound = activeSound
  activeSound = null

  if (!sound) return

  await stopAndReleaseAppAudioPlayer(sound)
}
