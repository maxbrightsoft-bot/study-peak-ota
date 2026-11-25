import React, { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import StudyTimerTab, { StudyTimerTabProps } from '../partials/Timer/StudyTimerTab'
import AlarmClockTab, { AlarmClockTabProps } from '../partials/Alarm/AlarmClockTab'
import TimerTabs from '../partials/Timer/TimerTabs'
import { ScaledSheet } from 'react-native-size-matters'
import TabPanel from '@/components/Tab/TabPanel'
import BottomSheet from '@/components/ModalBase/BottomSheet'
import StudyTimerSheetSummary from '@/containers/StudyTimer/components/StudyTimerSheetSummary'
import useStudyTimerStore from '@/store/useStudyTimerStore'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import useResponsive from '@/hooks/useResponsive'

interface Props {
  studyTimerProps: StudyTimerTabProps
  alarmClockProps: AlarmClockTabProps
  speaker: boolean
  disabledSpeaker: boolean
  open: boolean
  onToggleSpeaker: () => void
  onToggle: () => void
}

const TimerDialog: FC<Props> = ({
  open,
  onToggle,
  studyTimerProps,
  alarmClockProps,
}) => {
  const { t } = useTranslation()
  const { height, isLandscape } = useResponsive()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (open) useStudyTimerStore.getState().refreshBadge()
  }, [open])

  const handleOpenMyStudyTimer = () => {
    onToggle()
    navigate(Routes.Auth.StudyTimer)
  }

  return (
    <BottomSheet isVisible={open} onClose={onToggle} titleChildren={<TimerTabs value={value} onChange={setValue} />}>
      <View style={[styles.container, { maxHeight: isLandscape ? height * 0.82 : height * 0.85 }]}>
        <TabPanel value={value} index={0} style={{ flexShrink: 1 }}>
          <StudyTimerSheetSummary onOpenMy={handleOpenMyStudyTimer} />
          <StudyTimerTab {...studyTimerProps} />
        </TabPanel>
        <TabPanel value={value} index={1} style={{ flexShrink: 1 }}>
          <AlarmClockTab {...alarmClockProps} />
        </TabPanel>
      </View>
    </BottomSheet>
  )
}

export default TimerDialog

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '24@ms',
    paddingBottom: '24@ms',
    paddingTop: '20@ms'
  }
})
