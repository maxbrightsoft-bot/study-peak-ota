import React, { FC, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import StudyTimerTab, { StudyTimerTabProps } from '../partials/Timer/StudyTimerTab'
import AlarmClockTab, { AlarmClockTabProps } from '../partials/Alarm/AlarmClockTab'
import TimerTabs from '../partials/Timer/TimerTabs'
import { ScaledSheet } from 'react-native-size-matters'
import TabPanel from '@/components/Tab/TabPanel'

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
  studyTimerProps,
  alarmClockProps,
  speaker,
  disabledSpeaker,
  onToggleSpeaker
}) => {
  const { t } = useTranslation()
  const [value, setValue] = useState(0)

  return (
    <View style={styles.container}>
      <TimerTabs value={value} onChange={setValue} />

      <TabPanel value={value} index={0}>
        <StudyTimerTab {...studyTimerProps} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <AlarmClockTab {...alarmClockProps} />
      </TabPanel>
    </View>
  )
}

export default TimerDialog

const styles = ScaledSheet.create({
  container: {
    padding: "16@ms",
  },
})