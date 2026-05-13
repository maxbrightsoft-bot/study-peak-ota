import React, { useCallback, useState } from 'react'
import { View, StyleSheet, Animated, TouchableOpacity, Text, Dimensions, Pressable } from 'react-native'
import { ExamStatus } from '@/utils/enums'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: (key: string) => string
  status?: ExamStatus | null
  isOnlyRestart?: boolean
  onTogglePauseResume: (status: ExamStatus) => void
  onOpenConfirmDialog: () => void
  keys?: {
    pause?: string
    resume?: string
    restart?: string
  }
  ariaLabel?: string
}
const screenWidth = Dimensions.get('window').width

const FloatingActionButton: React.FC<Props> = ({
  t,
  status,
  onTogglePauseResume,
  onOpenConfirmDialog,
  isOnlyRestart,
  keys,
  ariaLabel = 'more-actions'
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current
  const opacityAnim = React.useRef(new Animated.Value(0)).current

  const isPaused = status === ExamStatus.Paused
  const isCompleted = status === ExamStatus.Completed

  const pauseKey = keys?.pause ?? 'pause'
  const resumeKey = keys?.resume ?? 'resume'
  const restartKey = keys?.restart ?? 'restart'

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => setMenuOpen(false))
    } else {
      setMenuOpen(true)
      scaleAnim.setValue(0.9)
      opacityAnim.setValue(0)

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
    }
  }

  const handlePauseResume = () => {
    onTogglePauseResume(isPaused ? ExamStatus.InProgress : ExamStatus.Paused)
    toggleMenu()
  }

  const handleRestart = () => {
    onOpenConfirmDialog()
    toggleMenu()
  }

  useFocusEffect(
    useCallback(() => {
      return () =>
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          })
        ]).start(() => setMenuOpen(false))
    }, [])
  )

  return (
    <Pressable style={styles.container} onPress={() => menuOpen && toggleMenu()}>
      {menuOpen && (
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {!isOnlyRestart && (
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                onPress={handlePauseResume}
                disabled={isCompleted}
                style={[
                  styles.menuButton,
                  styles.pauseResumeButton,
                  isCompleted && styles.disabledButton
                ]}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name={isPaused ? 'play-circle-sharp' : 'pause-circle-sharp'}
                    size={20}
                    color={'#FFF'}
                  />
                  <Text style={styles.buttonLabel}>
                    {t(isPaused ? resumeKey : pauseKey)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              onPress={handleRestart}
              style={[styles.menuButton, styles.restartButton]}
            >
              <View style={styles.buttonContent}>
                <Ionicons name={'refresh-circle-sharp'} size={20} color={'#FFF'} />
                <Text style={styles.buttonLabel}>{t(restartKey)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      <Ionicons
        style={styles.fab}
        onPress={toggleMenu}
        name={menuOpen ? 'close' : 'ellipsis-vertical'}
        size={20}
        color={palette.grey[500]}
      />
    </Pressable>
  )
}

const styles = ScaledSheet.create({
  container: {
    position: 'relative',
    zIndex: 10
  },
  menuContainer: {
    position: 'absolute',
    top: '30@ms',
    right: 0,
    alignItems: 'flex-end',
    gap: '12@ms',
    minWidth: screenWidth,
    zIndex: 9999
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-end'
  },
  menuButton: {
    borderRadius: '24@ms',
    alignSelf: 'flex-start'
  },
  pauseResumeButton: {
    backgroundColor: '#FF9800'
  },
  restartButton: {
    backgroundColor: '#2196F3'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '16@ms',
    paddingVertical: '10@ms',
  },
  buttonLabel: {
    textAlign: 'center',
    color: 'white',
    marginLeft: '8@ms',
    fontSize: '16@ms',
  },
  disabledButton: {
    backgroundColor: '#9E9E9E'
  },
  fab: {
    alignSelf: 'flex-end',
  }
})

export default FloatingActionButton