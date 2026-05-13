import React, { FC, useEffect, useRef } from 'react'
import { Modal, Text, StyleSheet, Animated } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Audio } from 'expo-av'

import { DEFAULT_AUDIO_URL } from '../../configs/constants'
import { SubjectTimerResponse } from '@/utils/types'
import useInactiveWarning from '@/layouts/hooks/useInactiveWarning'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  isRunning: boolean
  onPauseTimer: (onSuccess?: (data: SubjectTimerResponse) => void, onError?: (error: any) => void) => void
}

const InactiveWarningOverlay: FC<Props> = ({ isRunning, onPauseTimer }) => {
  const { t } = useTranslation()
  const { showWarning } = useInactiveWarning(isRunning, onPauseTimer)

  const opacity = useRef(new Animated.Value(1)).current
  const soundRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    if (!showWarning) return

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    )

    animation.start()
    return () => animation.stop()
  }, [showWarning])

  useEffect(() => {
    const playSound = async () => {
      const { sound } = await Audio.Sound.createAsync({ uri: DEFAULT_AUDIO_URL }, { shouldPlay: true, isLooping: true })
      soundRef.current = sound
    }

    if (showWarning) {
      playSound()
    } else {
      soundRef.current?.stopAsync()
      soundRef.current?.unloadAsync()
      soundRef.current = null
    }

    return () => {
      soundRef.current?.unloadAsync()
    }
  }, [showWarning])

  if (!showWarning) return null

  return (
    <Modal visible transparent animationType="fade">
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Text style={styles.title}>🚨 {t('time_to_report_survival')} 🚨</Text>
        <Text style={styles.subtitle}>
          {t('no_movement_was_detected_for_half_an_hour')}
          {'\n'}
          {t('please_touch_the_screen_once')}
        </Text>
      </Animated.View>
    </Modal>
  )
}

export default InactiveWarningOverlay

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#CBCED4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16@ms'
  },
  title: {
    fontSize: '28@ms',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#434343'
  },
  subtitle: {
    marginTop: '16@ms',
    fontSize: '18@ms',
    textAlign: 'center',
    color: '#434343'
  }
})
