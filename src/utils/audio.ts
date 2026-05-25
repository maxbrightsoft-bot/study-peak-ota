import {
  AudioPlayer,
  AudioSource,
  AudioStatus,
  createAudioPlayer,
  setAudioModeAsync
} from 'expo-audio'

type PlaybackOptions = {
  shouldPlay?: boolean
  isLooping?: boolean
  volume?: number
  isMuted?: boolean
}

export type AppAudioPlayer = AudioPlayer

export const configureAudioMode = setAudioModeAsync

export const createAppAudioPlayer = async (
  source: AudioSource | string | number | null,
  options: PlaybackOptions = {}
) => {
  const player = createAudioPlayer(source)

  player.loop = !!options.isLooping

  if (typeof options.volume === 'number') {
    player.volume = options.volume
  }

  if (typeof options.isMuted === 'boolean') {
    player.muted = options.isMuted
  }

  if (options.shouldPlay) {
    player.play()
  }

  return player
}

export const stopAppAudioPlayer = async (player?: AppAudioPlayer | null) => {
  if (!player) return

  try {
    player.pause()
    await player.seekTo(0).catch(() => undefined)
  } catch {}
}

export const pauseAppAudioPlayer = (player?: AppAudioPlayer | null) => {
  try {
    player?.pause()
  } catch {}
}

export const releaseAppAudioPlayer = (player?: AppAudioPlayer | null) => {
  try {
    player?.remove()
  } catch {}
}

export const stopAndReleaseAppAudioPlayer = async (player?: AppAudioPlayer | null) => {
  await stopAppAudioPlayer(player)
  releaseAppAudioPlayer(player)
}

export const replayAppAudioPlayer = async (player?: AppAudioPlayer | null) => {
  if (!player) return

  await player.seekTo(0).catch(() => undefined)
  player.play()
}

export const getAppAudioStatus = (player: AppAudioPlayer): AudioStatus => player.currentStatus

export const addAppAudioStatusListener = (
  player: AppAudioPlayer,
  listener: (status: AudioStatus) => void
) => player.addListener('playbackStatusUpdate', listener)
