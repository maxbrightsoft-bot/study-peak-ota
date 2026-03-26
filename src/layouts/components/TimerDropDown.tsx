import React, { useEffect, useState, useCallback } from 'react'
import { TouchableRipple } from 'react-native-paper'
import { InteractionManager, View } from 'react-native'
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
        {isRunning ? <Clock color={palette.main[600]} /> : <Clock color={isTextbook ? palette.grey[500] : "#FFF"} />}
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
