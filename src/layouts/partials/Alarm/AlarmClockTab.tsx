import React, { FC, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'

import AlarmClockPanel, { AlarmClockPanelProps } from './AlarmClockPanel'
import AlarmClock, { AlarmClockProps } from './AlarmClock'
import Loading from '@/components/Loading'
import { ScaledSheet } from 'react-native-size-matters'

export interface AlarmClockTabProps {
  isLoading: boolean
  isPlaying: boolean
  panelProps: AlarmClockPanelProps
  alarmProps: AlarmClockProps
  getAlarm: () => Promise<void>
}

const AlarmClockTab: FC<AlarmClockTabProps> = ({ isLoading, isPlaying, panelProps, alarmProps, getAlarm }) => { 
  useEffect(() => {
    getAlarm()
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView>
        {isLoading && (
          <Loading isOverlay={false} />
        )}

        {!isPlaying ? <AlarmClockPanel {...panelProps} /> : <AlarmClock {...alarmProps} />}

        {/* {!isLoading && <View style={styles.note}>{!isPlaying ? <AlarmClockPanelNote /> : <AlarmClockNote />}</View>} */}
      </ScrollView>
    </View>
  )
}

export default AlarmClockTab

const styles = ScaledSheet.create({
  container: {
    gap: '16@ms',
  },
  loading: {
    width: '100%',
    paddingVertical: '16@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  note: {
    marginTop: '4@ms'
  }
})
