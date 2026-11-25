import React, { FC, useEffect } from 'react'
import { View, ScrollView } from 'react-native'

import AlarmClockPanel, { AlarmClockPanelProps } from './AlarmClockPanel'
import AlarmClock, { AlarmClockProps } from './AlarmClock'
import Loading from '@/components/Loading'
import { ScaledSheet } from 'react-native-size-matters'
import useResponsive from '@/hooks/useResponsive'

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

  const { height, isLandscape } = useResponsive()

  return (
    <View style={styles.container}>
      <ScrollView
        style={[styles.scroll, { maxHeight: isLandscape ? height * 0.7 : height * 0.78 }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {isLoading && (
          <Loading isOverlay={false} fullScreen={false} />
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
    flexShrink: 1,
    width: '100%'
  },
  scroll: {
    flexShrink: 1,
    width: '100%'
  },
  scrollContent: {
    paddingBottom: '40@ms'
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
