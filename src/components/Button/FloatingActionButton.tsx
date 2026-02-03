import React, { useState } from 'react'
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native'
import { Button, FAB, useTheme } from 'react-native-paper'
import { ExamStatus } from '@/utils/enums'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'

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

const FloatingActionButton: React.FC<Props> = ({
  t,
  status,
  onTogglePauseResume,
  onOpenConfirmDialog,
  isOnlyRestart,
  keys,
  ariaLabel = 'more-actions'
}) => {
  const theme = useTheme()
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
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => setMenuOpen(false))
    } else {
      setMenuOpen(true)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
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

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.menuContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            pointerEvents: menuOpen ? 'auto' : 'none'
          }
        ]}
      >
        {!isOnlyRestart && (
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              onPress={handlePauseResume}
              disabled={isCompleted}
              style={[styles.menuButton, styles.pauseResumeButton, isCompleted && styles.disabledButton]}
            >
              <View style={styles.buttonContent}>
                <Ionicons name={isPaused ? 'play-circle-sharp' : 'pause-circle-sharp'} size={20} color={'#FFF'} />
                <Text style={styles.buttonLabel}>{t(isPaused ? resumeKey : pauseKey)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            disabled={isCompleted}
            onPress={handleRestart}
            style={[styles.menuButton, styles.buttonLabel, styles.restartButton]}
          >
            <View style={styles.buttonContent}>
              <Ionicons name={'refresh-circle-sharp'} size={20} color={'#FFF'} />
              <Text style={styles.buttonLabel}>{t(restartKey)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <FAB
        style={[styles.fab, menuOpen && styles.fabOpen, { backgroundColor: palette.main[300] }]}
        icon={menuOpen ? 'close' : 'dots-vertical'}
        onPress={toggleMenu}
        animated={true}
        color="#FFFFFF"
        accessibilityLabel={ariaLabel}
        size="medium"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 10,
    alignItems: 'flex-end',
    pointerEvents: 'box-none'
  },
  menuContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
    gap: 12
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  menuButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
    minWidth: 'auto'
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
    padding: 10
  },
  buttonLabel: {
    textAlign: 'center',
    color: 'white',
    marginLeft: 8,
    fontSize: 16
  },
  disabledButton: {
    backgroundColor: '#9E9E9E'
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  fabOpen: {
    transform: [{ scale: 0.9 }]
  }
})

export default FloatingActionButton
