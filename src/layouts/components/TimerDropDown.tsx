import React, { useEffect, useState, useCallback, useRef } from 'react'
import { TouchableRipple } from 'react-native-paper'
import { Animated, Easing, InteractionManager, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme/colors'
import Clock from '@/assets/iconJSX/clock'
import TimerDialog from './TimeDialog'
import AudioGuideModal from './AudioGuideModal'
import TimeUpdateDialog from '@/layouts/partials/Timer/TimeUpdateDialog'

type Props = {
  openTimerDialog: boolean
  isTimerRunning: boolean
  isAlarmRunning: boolean
  studyTimerProps: any
  alarmClockProps: any
  isTextbook?: boolean
  timeUpdateDialogProps: any
  audioGuideModalProps?: any
  speaker: boolean
  disabledSpeaker: boolean
  onToggleSpeaker: () => void
  onToggleTimerDialog: () => void
}

const TimerDropdown = ({
  speaker,
  isTextbook,
  disabledSpeaker,
  openTimerDialog,
  isTimerRunning,
  isAlarmRunning,
  studyTimerProps,
  alarmClockProps,
  timeUpdateDialogProps,
  audioGuideModalProps,
  onToggleSpeaker,
  onToggleTimerDialog
}: Props) => {
  const isRunning = isTextbook && (isTimerRunning || isAlarmRunning)

  const shakeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isAlarmRunning || isTimerRunning) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 1,
              duration: 80,
              useNativeDriver: true,
              easing: Easing.linear
            }),
            Animated.timing(shakeAnim, {
              toValue: -1,
              duration: 80,
              useNativeDriver: true,
              easing: Easing.linear
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 80,
              useNativeDriver: true
            })
          ]),

          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.15,
              duration: 300,
              useNativeDriver: true
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true
            })
          ])
        ])
      ).start()
    } else {
      shakeAnim.setValue(0)
      scaleAnim.setValue(1)
    }
  }, [isAlarmRunning, isTimerRunning])

  const [renderDialog, setRenderDialog] = useState(false)

  useEffect(() => {
    let task: any

    if (openTimerDialog) {
      task = InteractionManager.runAfterInteractions(() => {
        setRenderDialog(true)
      })
    } else {
      setRenderDialog(false)
    }

    return () => task?.cancel?.()
  }, [openTimerDialog])

  const handleToggle = useCallback(() => {
    onToggleTimerDialog()
  }, [onToggleTimerDialog])

  return (
    <View>
      <TouchableRipple onPress={handleToggle} style={styles.iconButton}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: shakeAnim.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-10deg', '10deg']
                })
              },
              { scale: scaleAnim }
            ]
          }}
        >
          <Clock
            color={
              isRunning
                ? palette.main[600]
                : isTextbook
                  ? palette.grey[500]
                  : palette.red[900]
            }
          />
        </Animated.View>
      </TouchableRipple>

      {renderDialog && (
        <TimerDialog
          open={openTimerDialog}
          speaker={speaker}
          disabledSpeaker={disabledSpeaker}
          studyTimerProps={studyTimerProps}
          alarmClockProps={alarmClockProps}
          onToggle={handleToggle}
          onToggleSpeaker={onToggleSpeaker}
        />
      )}

      <TimeUpdateDialog {...timeUpdateDialogProps} />
      {audioGuideModalProps && !isTextbook && <AudioGuideModal {...audioGuideModalProps} />}
    </View>
  )
}

export default React.memo(TimerDropdown)

const styles = ScaledSheet.create({
  iconButton: {
    borderRadius: 6,
    padding: '16@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuContent: {
    backgroundColor: '#FFF',
    minWidth: 250,
    borderRadius: 6
  }
})
