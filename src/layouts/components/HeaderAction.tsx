import { View, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import useTimers from '../hooks/useTimer'
import useAlarm from '../hooks/useAlarm'
import TimerDropDown from './TimerDropDown'
import AudioGuideModal from './AudioGuideModal'
import { useFocusEffect } from '@react-navigation/native'
import useAuthStore from '@/store/useAuthStore'
import Setting from '@/containers/Setting/view'
import SettingIcon from '@/assets/iconJSX/setting'
import { palette } from '@/theme'
import { currentScreen } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'

const HeaderAction = () => {
  const { user } = useAuthStore()
  const [openTimerDialog, setOpenTimerDialog] = useState<boolean>(false)
  const [openSettingDialog, setOpenSettingDialog] = useState<boolean>(false)

  const handleTimerDialogToggle = () => {
    setOpenTimerDialog(state => !state)
  }

  const handleOpenSettingDialog = () => setOpenSettingDialog(true)
  const handleCloseSettingDialog = () => setOpenSettingDialog(false)

  const {
    timers,
    getTimers,
    studyTimerProps,
    timeUpdateDialogProps,
    isTimerRunning,
  } = useTimers(openTimerDialog, handleTimerDialogToggle)

  const {
    isAlarmRunning,
    speaker,
    getAlarm,
    disabledSpeaker,
    audioGuideModalProps,
    handleToggleSpeaker,
    alarmClockProps,
  } = useAlarm(openTimerDialog, timers)

  useFocusEffect(
    useCallback(() => {
      getTimers()
      getAlarm()
    }, [user?.academyDomain])
  )

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TimerDropDown
        speaker={speaker}
        disabledSpeaker={disabledSpeaker}
        openTimerDialog={openTimerDialog}
        alarmClockProps={alarmClockProps}
        isAlarmRunning={isAlarmRunning}
        isTimerRunning={isTimerRunning}
        studyTimerProps={studyTimerProps}
        timeUpdateDialogProps={timeUpdateDialogProps}
        onToggleSpeaker={handleToggleSpeaker}
        onToggleTimerDialog={handleTimerDialogToggle}
      />
      <TouchableOpacity onPress={() => handleOpenSettingDialog()}>
        <SettingIcon color={currentScreen() === Routes.Auth.Home ? "#FFF": palette.grey[300]} />
      </TouchableOpacity>
      <AudioGuideModal {...audioGuideModalProps} />
      <Setting open={openSettingDialog} onClose={handleCloseSettingDialog} />
    </View>
  )
}

export default HeaderAction