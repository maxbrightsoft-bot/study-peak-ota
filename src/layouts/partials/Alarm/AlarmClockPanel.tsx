import React, { FC, useMemo } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { Button, Divider, IconButton, Text } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'

import CircularTimer from '../CircularTimer'
import { MAX_TIME_CIRCULAR_TIMER, QUICK_START_OPTIONS } from '../../configs/constants'
import { SubjectTimerResponse } from '../../../utils/types'
import { palette } from '@/theme/colors'
import { AlarmType } from '@/utils/enums'

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
    <View style={styles.container}>
      <View style={styles.topRow}>
        <CircularTimer maxMinutes={max} value={value} onChange={onChange} edit />

        <View style={styles.setTime}>
          <Text style={styles.setTimeLabel}>{t('set_time')}</Text>

          <View style={styles.counterRow}>
            <IconButton
              icon="minus"
              size={18}
              style={styles.counterBtn}
              onPress={handleDecrease}
              disabled={isLoading || value <= 0}
            />

            <Text style={styles.minutesText}>
              {t('minutes_short_format', {
                mins: value
              })}
            </Text>

            <IconButton
              icon="plus"
              size={18}
              style={styles.counterBtn}
              onPress={handleIncrease}
              disabled={isLoading || value >= max}
            />
          </View>

          <Divider style={styles.divider} />

          <Button
            mode="contained"
            icon={() => <MaterialIcons name="play-circle-filled" size={18} color={'#FFF'} />}
            disabled={isLoading || !value}
            buttonColor={palette.main[500]}
            onPress={() => onStart(AlarmType.Default, value)}
            contentStyle={styles.startBtnContent}
            labelStyle={styles.startBtnLabel}
          >
            {t('start_alarm')}
          </Button>
        </View>
      </View>

      <FlatList
        data={QUICK_START_OPTIONS}
        horizontal
        keyExtractor={(item, i) => `${item}_${i}`}
        contentContainerStyle={styles.quickRow}
        renderItem={({ item }) => (
          <Button
            mode="outlined"
            disabled={isLoading}
            onPress={() => onStart(AlarmType.Default, item)}
            style={styles.quickBtn}
            labelStyle={styles.quickBtnLabel}
          >
            {t('minutes_short_format', {
              mins: item
            })}
          </Button>
        )}
      />

      <FlatList
        data={subjectOptions}
        keyExtractor={(item, i) => `${item.value.id}_${i}`}
        contentContainerStyle={styles.subjectList}
        renderItem={({ item }) => (
          <Button
            mode="outlined"
            disabled={isLoading}
            onPress={() => handleStartSubjectAlarm(item.value)}
            labelStyle={styles.subjectBtnLabel}
          >
            <View style={styles.subjectBtnContent}>
              <View style={styles.subjectRow}>
                <Text numberOfLines={1} style={styles.subjectText}>
                  {item.label}
                </Text>
                <Text style={styles.subjectMinutes}>
                  (
                  {t('minutes_short_format', {
                    mins: item.value.limitedTimeInMinutes
                  })}
                  )
                </Text>
              </View>
              <Ionicons name="play-circle" size={18} color={palette.main[500]} />
            </View>
          </Button>
        )}
      />
    </View>
  )
}

export default AlarmClockPanel

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16
  },

  topRow: {
    gap: 8
  },

  setTime: {
    flex: 1,
    justifyContent: 'center',
    gap: 16
  },

  setTimeLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: palette.grey[500]
  },

  counterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },

  counterBtn: {
    backgroundColor: palette.grey[50],
    width: 34,
    height: 34
  },

  minutesText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.grey[900]
  },

  divider: {
    backgroundColor: palette.grey[100]
  },

  startBtnContent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 8
  },

  startBtnLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: "#FFF"
  },

  quickRow: {
    gap: 10,
    maxHeight: 50
  },

  quickBtn: {
    flexGrow: 1
  },

  quickBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.main[500]
  },

  subjectList: {
    gap: 8
  },

  subjectBtn: {},

  subjectBtnContent: {
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    gap: 8
  },

  subjectBtnLabel: {
    fontSize: 14,
    fontWeight: '600'
  },

  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 4
  },

  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    color: palette.grey[500]
  },

  subjectMinutes: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.grey[500]
  }
})
