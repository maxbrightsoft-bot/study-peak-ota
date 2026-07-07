import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'
import { DEFAULT_AUDIO_URL } from '../../layouts/configs/constants'
import useAudioTimer from '../hooks/useAudioTimer'
import { palette } from '@/theme'
import { getErrorMessage, toast } from '@/utils/helpers'
import Loading from '@/components/Loading'
import { ScaledSheet } from 'react-native-size-matters'

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

  const unloadSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {})
        soundRef.current = null
      }
    } catch (error) {
      console.error('Error unloading sound:', error)
    } finally {
      setIsSoundLoaded(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadSound = async () => {
      if (!audioUrl || !open) return

      try {
        setIsLoading(true)
        setIsSoundLoaded(false)

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        }).catch(err => console.log('Audio mode error:', err))

        await unloadSound()

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl.replace('http://', 'https://') },
          {
            shouldPlay: false,
            volume: 1.0,
            isMuted: false
          }
        )

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
          setIsSoundLoaded(false)
          toast.error(getErrorMessage(t, error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSound()

    return () => {
      isMounted = false
      unloadSound()
    }
  }, [open, audioUrl])

  useEffect(() => {
    if (isPlayAudio && isSoundLoaded && !isLoading) {
      playSound()
    }
  }, [isPlayAudio, isSoundLoaded, isLoading])

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
        // Ensure audio mode is active right before playing on iOS
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          allowsRecordingIOS: false,
        }).catch(() => {})

        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded) {
          await soundRef.current.setPositionAsync(0)
          // Adding a very small delay for iOS to be ready
          if (Platform.OS === 'ios') {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
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
        {isLoading && <Loading isOverlay={true} />}
        <View style={styles.container}>
          <View style={styles.header}>
            <View />
            <Text style={styles.title}>{t('voice_guidance_settings')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={palette.grey[900]} />
            </TouchableOpacity>
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

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '20@ms'
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8@ms',
    width: '364@ms',
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: '2@ms' },
    shadowOpacity: 0.1,
    shadowRadius: '8@ms',
    elevation: '5@ms'
  },
  header: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms',
    borderBottomWidth: '1@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center'
  },
  content: {
    paddingVertical: '32@ms',
    paddingHorizontal: '24@ms'
  },
  contentInner: {
    paddingHorizontal: '52@ms'
  },
  closeButton: {
    padding: '4@ms'
  },
  textContainer: {
    alignItems: 'center',
    gap: '8@ms'
  },
  mainText: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: '8@ms',
    lineHeight: '24@ms'
  },
  subText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: '20@ms'
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerText: {
    fontSize: '32@ms',
    fontWeight: '700',
    color: palette.grey[900],
    textAlign: 'center'
  },
  divider: {
    height: '1@ms',
    backgroundColor: '#D0D0C8'
  },
  footer: {
    flexDirection: 'row',
    padding: '12@ms'
  },
  footerBetween: {
    justifyContent: 'space-between'
  },
  footerEnd: {
    justifyContent: 'flex-end'
  },
  primaryButton: {
    minWidth: '120@ms',
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '4@ms',
    borderWidth: '1@ms',
    borderColor: palette.main[500],
    backgroundColor: 'transparent'
  },
  primaryButtonText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.main[500],
    textAlign: 'center'
  },
  secondaryButton: {
    minWidth: '120@ms',
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '4@ms'
  },
  secondaryButtonText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.main[500],
    textAlign: 'center'
  }
})

export default AudioGuideModal
