import React, { FC, useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { SubjectTimerResponse } from '../../../utils/types'
import { getDisplayTime } from '../../configs/fn'
import { palette } from '@/theme/colors'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  value: number
  data?: SubjectTimerResponse
  seconds?: number
  activeTimerId?: number
  selectedDate?: moment.Moment
  onChange: (newValue: number) => void
}

const TimeLineTabs: FC<Props> = ({ value, data, seconds, activeTimerId, selectedDate, onChange }) => {
  const { t } = useTranslation()

  const today = moment()
  const isToday = today.isSame(selectedDate, 'day')
  const date = selectedDate?.format(t('date_format'))

  const displayedTime = useMemo(
    () => getDisplayTime(t, data, activeTimerId, seconds),
    [data?.id, data?.status, data?.duration, seconds, activeTimerId, t]
  )

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabsRow}>
        <Pressable onPress={() => onChange(0)} style={styles.tab}>
          <Text style={[styles.tabText, value === 0 && styles.activeText]}>
            {value === 0 ? `${t('current_timer')} (${displayedTime})` : t('current_timer')}
          </Text>
          {value === 0 && <View style={styles.indicator} />}
        </Pressable>
        <Pressable onPress={() => onChange(1)} style={styles.tab}>
          <Text style={[styles.tabText, value === 1 && styles.activeText]}>
            {value === 1 ? (isToday ? `${t('today')} (${date})` : date) : t('today')}
          </Text>
          {value === 1 && <View style={styles.indicator} />}
        </Pressable>
      </View>

      <View style={styles.bottomLine} />
    </View>
  )
}

export default TimeLineTabs

const styles = ScaledSheet.create({
  wrapper: {
    paddingHorizontal: '12@ms',
    position: 'relative'
  },
  tabsRow: {
    flexDirection: 'row'
  },
  tab: {
    paddingVertical: '15@ms',
    paddingHorizontal: '12@ms',
    position: 'relative'
  },
  tabText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.grey[500],
    lineHeight: '18@ms'
  },
  activeText: {
    color: palette.main[700],
  },
  indicator: {
    position: 'absolute',
    bottom: '1@ms',
    left: 0,
    right: 0,
    height: '1@ms',
    backgroundColor: palette.main[500]
  },
  bottomLine: {
    height: '1@ms',
    backgroundColor: palette.grey[100],
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  }
})
