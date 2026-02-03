import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Audio } from 'expo-av'
import { DEFAULT_AUDIO_URL } from '../../layouts/configs/constants'
import useAudioTimer from '../hooks/useAudioTimer'
import { palette } from '@/theme'
import { getErrorMessage, toast } from '@/utils/helpers'

export type AudioGuideModalProps = {
  open: boolean
  audioUrls: string[]
  onClose: () => void
  onStart: (enableAudio: boolean) => void
}

const AudioGuideModal: React.FC<AudioGuideModalProps> = ({ open, audioUrls, onClose, onStart }) => {
  const { t } = useTranslation()
  const timeSkip = useRef<boolean>(false)
  const audioUrl = audioUrls[0] || DEFAULT_AUDIO_URL
  const soundRef = useRef<Audio.Sound | null>(null)
  const [isPlayAudio, setPlayAudio] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSoundLoaded, setIsSoundLoaded] = useState<boolean>(false)
  useEffect(() => {
    let isMounted = true

    const loadSound = async () => {
      try {
        setIsLoading(true)
        setIsSoundLoaded(false)

        await unloadSound()

        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: false })

        if (isMounted) {
          soundRef.current = sound
          setIsSoundLoaded(true)

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish && !timeSkip.current) {
              handleSkip()
            }
          })
        }
      } catch (error) {
        console.error('Error loading audio:', error)
        if (isMounted) {
          toast.error(getErrorMessage(t, error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (open && audioUrl) {
      loadSound()
    }

    return () => {
      isMounted = false
      unloadSound()
    }
  }, [open, audioUrl, t])

  useEffect(() => {
    if (isPlayAudio && isSoundLoaded && !isLoading) {
      playSound()
    }
  }, [isPlayAudio, isSoundLoaded, isLoading])

  const unloadSound = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded) {
          await soundRef.current.unloadAsync()
        }
        soundRef.current = null
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setIsSoundLoaded(false)
    }
  }

  const stopSound = async () => {
    try {
      if (soundRef.current && isSoundLoaded) {
        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded) {
          await soundRef.current.stopAsync()
        }
      }
    } catch (error: any) {
      if (!error?.message?.includes('sound is not loaded')) {
        console.error('Error stopping audio:', error)
      }
    }
  }

  const playSound = async () => {
    try {
      if (soundRef.current && isSoundLoaded && isPlayAudio && !isLoading) {
        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded) {
          await soundRef.current.setPositionAsync(0)
          await soundRef.current.playAsync()
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      toast.error(getErrorMessage(t, error))
    }
  }

  const handleSkip = async () => {
    timeSkip.current = true
    await stopSound()

    onStart(true)
    onClose()
  }

  const {
    startTime,
    setStartTime,
    handleReset: handleResetAudioTimer,
    remainTimeString,
    handleStartRunning
  } = useAudioTimer({
    onEnded: handleSkip,
    timeSkip
  })

  const reset = async () => {
    setStartTime(null)
    timeSkip.current = false

    await stopSound()

    setPlayAudio(false)
    handleResetAudioTimer()
  }

  const handleCloseDialog = () => {
    onClose()
  }

  const handleDeActive = () => {
    onStart(false)
    onClose()
  }

  const handleActiveAudio = async () => {
    if (isLoading) return

    timeSkip.current = false
    setPlayAudio(true)

    handleStartRunning()
  }

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open])

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={handleCloseDialog}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('voice_guidance_settings')}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.contentInner}>
              {startTime === null ? (
                <View style={styles.textContainer}>
                  <Text style={styles.mainText}>{t('would_you_like_to_enable_voice_guidance')}</Text>
                  <Text style={styles.subText}>
                    {t('a_voice_guidance_will_be_played_just_like_in_the_actual_exam')}
                  </Text>
                  <Text style={styles.subText}>{t('be_sure_to_turn_on_your_speakers')}</Text>
                </View>
              ) : (
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>{remainTimeString}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={[styles.footer, startTime === null ? styles.footerBetween : styles.footerEnd]}>
            {startTime === null && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleDeActive} disabled={isLoading}>
                <Text style={styles.secondaryButtonText}>{t('deactivate')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={startTime === null ? handleActiveAudio : handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>{startTime === null ? t('activate') : t('skip')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 364,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center'
  },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  contentInner: {
    paddingHorizontal: 52
  },
  textContainer: {
    alignItems: 'center',
    gap: 8
  },
  mainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24
  },
  subText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.grey[900],
    textAlign: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#D0D0C8'
  },
  footer: {
    flexDirection: 'row',
    padding: 12
  },
  footerBetween: {
    justifyContent: 'space-between'
  },
  footerEnd: {
    justifyContent: 'flex-end'
  },
  primaryButton: {
    minWidth: 120,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: palette.main[500],
    color: palette.main[500],
    backgroundColor: 'transparent'
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.main[500],
    textAlign: 'center'
  },
  secondaryButton: {
    minWidth: 120,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.main[500],
    textAlign: 'center'
  }
})

export default AudioGuideModal
