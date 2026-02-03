import React, { Fragment, useEffect, useState, useCallback } from 'react'
import { Menu, TouchableRipple } from 'react-native-paper'
import { InteractionManager } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'

import TimerIcon from '../../assets/icons/timer_icon.svg'
import { palette } from '@/theme/colors'

import TimerDialog from './TimeDialog'
import AudioGuideModal from './AudioGuideModal'
import TimeUpdateDialog from '@/layouts/partials/Timer/TimeUpdateDialog'

type Props = {
  openTimerDialog: boolean
  isTimerRunning: boolean
  isAlarmRunning: boolean
  studyTimerProps: any
  alarmClockProps: any
  timeUpdateDialogProps: any
  audioGuideModalProps: any
  speaker: boolean
  disabledSpeaker: boolean
  onToggleSpeaker: () => void
  onToggleTimerDialog: () => void
}

const TimerDropdown = ({
  speaker,
  disabledSpeaker,
  openTimerDialog,
  isTimerRunning,
  isAlarmRunning,
  studyTimerProps,
  alarmClockProps,
  timeUpdateDialogProps,
  audioGuideModalProps,
  onToggleSpeaker,
  onToggleTimerDialog,
}: Props) => {
  const isRunning = isTimerRunning || isAlarmRunning

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
    <Fragment>
      <Menu
        visible={openTimerDialog}
        onDismiss={handleToggle}
        anchorPosition="bottom"
        anchor={
          <TouchableRipple onPress={handleToggle} style={styles.iconButton}>
            {isRunning ? (
              <Ionicons
                name="timer"
                size={40}
                color={palette.main[500]}
              />
            ) : (
              <TimerIcon />
            )}
          </TouchableRipple>
        }
        style={{
          boxShadow: '0px 0px 4px 0px #00000040',
          marginTop: 12,
        }}
        contentStyle={styles.menuContent}
      >
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
      </Menu>

      <TimeUpdateDialog {...timeUpdateDialogProps} />
      <AudioGuideModal {...audioGuideModalProps} />
    </Fragment>
  )
}

export default React.memo(TimerDropdown)

const styles = ScaledSheet.create({
  iconButton: {
    borderRadius: 6,
    padding: '16@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    backgroundColor: '#FFF',
    minWidth: 250,
    borderRadius: 6,
  },
})
