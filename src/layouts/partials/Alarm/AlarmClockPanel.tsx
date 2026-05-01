import React, { FC, useMemo } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import CircularTimer from '../CircularTimer'
import { MAX_TIME_CIRCULAR_TIMER, QUICK_START_OPTIONS } from '../../configs/constants'
import { SubjectTimerResponse } from '../../../utils/types'
import { palette } from '@/theme/colors'
import { AlarmType } from '@/utils/enums'
import PlusIcon from '@/assets/iconJSX/plus'
import ReduceIcon from '@/assets/iconJSX/reduce'

export interface AlarmClockPanelProps {
  subjects: SubjectTimerResponse[]
  isLoading: boolean
  value: number
  max?: number
  onStart: (type: AlarmType, duration: number, subject?: SubjectTimerResponse, enable?: boolean) => void
  onPauseOrResume: () => void
  onChange: (val: number) => void
  onIncrease: (val: number) => void
}

const AlarmClockPanel: FC<AlarmClockPanelProps> = ({
  isLoading,
  value,
  subjects,
  max = MAX_TIME_CIRCULAR_TIMER,
  onChange,
  onIncrease,
  onStart
}) => {
  const { t } = useTranslation()

  const handleIncrease = () => onIncrease(1)
  const handleDecrease = () => onIncrease(-1)

  const subjectOptions = useMemo(() => {
    return subjects
      .filter((i) => i.limitedTimeInMinutes > 0)
      .map((i) => ({
        label: t('subject_section', {
          subject: i.name
        }),
        value: i
      }))
  }, [t, subjects])

  const handleStartSubjectAlarm = (subject: SubjectTimerResponse) => {
    onStart(AlarmType.Subject, subject.limitedTimeInMinutes, subject)
  }

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.setTimeLabel}>{t('set_time')}</Text>

          <View style={styles.counterRow}>
            <View style={styles.flex}>
              <TouchableOpacity disabled={isLoading || value <= 0} style={styles.counterBtn} onPress={handleDecrease}>
                <ReduceIcon />
                <Text style={styles.minutesText}>1 {t('minutes')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.flex}>
              <CircularTimer value={value} edit isOnlyDisplay onChange={onChange} />
            </View>
            <View style={styles.flex}>
              <TouchableOpacity onPress={handleIncrease} style={styles.counterBtn} disabled={isLoading || value >= max}>
                <PlusIcon />
                <Text style={styles.minutesText}>1 {t('minutes')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          data={subjectOptions}
          numColumns={4}
          columnWrapperStyle={{ gap: 8, rowGap: 8 }}
          keyExtractor={(item, i) => `${item.value.id}_${i}`}
          contentContainerStyle={styles.subjectList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.subjectRow}
              disabled={isLoading}
              onPress={() => handleStartSubjectAlarm(item.value)}
            >
              <Text style={[styles.subjectMinutes, { fontSize: 16, fontWeight: '700' }]}>
                {t('minutes_short_format', {
                  mins: item.value.limitedTimeInMinutes
                })}
              </Text>
              <Text style={styles.subjectMinutes}>{item.value.name}</Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          numColumns={3}
          columnWrapperStyle={{ gap: 8, rowGap: 8 }}
          data={QUICK_START_OPTIONS}
          contentContainerStyle={styles.subjectList}
          keyExtractor={(item, i) => `${item}_${i}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={isLoading}
              onPress={() => onStart(AlarmType.Default, item)}
              style={styles.quickBtn}
            >
              <Text style={styles.quickBtnLabel}>
                {t('minutes_short_format', {
                  mins: item
                })}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <TouchableOpacity
        disabled={isLoading || !value}
        onPress={() => onStart(AlarmType.Default, value)}
        style={styles.startBtn}
      >
        <Text style={styles.startBtnLabel}>{t('start_alarm')}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default AlarmClockPanel

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    gap: 16
  },

  topRow: {
    gap: 12,
    marginBottom: 40
  },

  setTime: {
    flex: 1,
    justifyContent: 'center',
    gap: 16
  },

  setTimeLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: palette.grey[500]
  },
  flex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  counterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  counterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.main[600],
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 2
  },

  minutesText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: palette.main[600]
  },

  divider: {
    backgroundColor: palette.grey[100]
  },

  startBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: palette.main[600],
    borderRadius: 12
  },

  startBtnLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    color: '#FFF'
  },

  quickRow: {
    gap: 10,
    maxHeight: 50
  },

  quickBtn: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: palette.grey[100],
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },

  quickBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    color: palette.grey[900]
  },

  subjectList: {},

  subjectBtnLabel: {
    fontSize: 14,
    fontWeight: '600'
  },

  subjectRow: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.sub[50],
    paddingVertical: 11,
    justifyContent: 'center',
    gap: 4,
    borderRadius: 6,
    marginBottom: 8
  },

  subjectText: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
    color: palette.grey[500]
  },

  subjectMinutes: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.sub[400],
    textAlign: 'center'
  }
})
