// One bar per day (plain Views). Height ∝ minutes / max(minutes, goal); dashed goal line; tap selects the day.
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet, moderateScale } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { palette, TYPO } from '@/theme'
import { compactDuration, periodGoalLines, toLocalDateIso } from '../configs/helpers'
import { StudyTimerMySummaryResponse } from '../configs/types'

type Props = {
  days: StudyTimerMySummaryResponse['days']
  goal: StudyTimerMySummaryResponse['goal']
  selectedDate: string
  onSelect: (date: string) => void
}

const CHART_HEIGHT = moderateScale(120)
const MONTH_BAR_WIDTH = moderateScale(26)

const StudyTimerMyBars = ({ days, goal, selectedDate, onSelect }: Props) => {
  const { t } = useTranslation()
  const { teacher: goalLine, personal: personalLine } = periodGoalLines(days, goal)
  const max = Math.max(60, goalLine ?? 0, personalLine ?? 0, ...days.map((d) => d.minutes))
  const scroll = days.length > 7

  const chart = (
    <View style={scroll ? styles.chartScroll : styles.chart}>
      {goalLine !== null || personalLine !== null ? (
        <View pointerEvents="none" style={styles.goalArea}>
          {goalLine !== null ? (
            <View style={[styles.goalLine, { bottom: (goalLine / max) * CHART_HEIGHT }]} />
          ) : null}
          {personalLine !== null ? (
            <View
              testID="studytimer-my-personal-line"
              style={[
                styles.goalLine,
                styles.personalLine,
                { bottom: (personalLine / max) * CHART_HEIGHT }
              ]}
            />
          ) : null}
        </View>
      ) : null}
      <View style={styles.bars}>
        {days.map((d) => {
          const date = toLocalDateIso(d.date)
          const selected = date === selectedDate
          const reached = d.goalMinutes !== null && d.minutes >= d.goalMinutes
          return (
            <TouchableOpacity
              key={d.date}
              testID="studytimer-my-day-bar"
              activeOpacity={0.7}
              onPress={() => onSelect(date)}
              style={[styles.col, scroll && { width: MONTH_BAR_WIDTH, flex: 0 }]}
            >
              <View style={styles.slot}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(3, (d.minutes / max) * CHART_HEIGHT),
                      backgroundColor:
                        d.minutes === 0
                          ? palette.grey[200]
                          : reached
                            ? palette.success.main
                            : palette.main[300]
                    },
                    selected && styles.barSelected
                  ]}
                />
              </View>
              <Text style={[styles.label, selected && styles.labelSelected]}>
                {scroll ? moment.utc(d.date).format('D') : moment.utc(d.date).format('M/D')}
              </Text>
              {!scroll ? <Text style={styles.value}>{compactDuration(d.minutes)}</Text> : null}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  const legend =
    personalLine !== null ? (
      <View style={styles.legend} testID="studytimer-my-goal-legend">
        {goalLine !== null ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { borderColor: palette.warning.main }]} />
            <Text style={styles.legendText}>{t('studytimer_my_goal_legend_teacher')}</Text>
          </View>
        ) : null}
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { borderColor: palette.secondary.main }]} />
          <Text style={styles.legendText}>{t('studytimer_my_goal_legend_mine')}</Text>
        </View>
      </View>
    ) : null

  return (
    <View>
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {chart}
        </ScrollView>
      ) : (
        chart
      )}
      {legend}
    </View>
  )
}

export default StudyTimerMyBars

const styles = ScaledSheet.create({
  chart: {
    position: 'relative'
  },
  chartScroll: {
    position: 'relative',
    paddingRight: '4@ms'
  },
  bars: {
    flexDirection: 'row',
    gap: '4@ms'
  },
  col: {
    flex: 1,
    alignItems: 'center'
  },
  slot: {
    height: '120@ms',
    width: '100%',
    justifyContent: 'flex-end'
  },
  bar: {
    width: '100%',
    borderRadius: '4@ms',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  barSelected: {
    borderColor: palette.main[700]
  },
  goalArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '120@ms',
    zIndex: 1
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.warning.main
  },
  personalLine: {
    borderColor: palette.secondary.main
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12@ms',
    marginTop: '8@ms'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },
  legendSwatch: {
    width: '16@ms',
    borderTopWidth: 1,
    borderStyle: 'dashed'
  },
  legendText: {
    ...TYPO.caption,
    color: palette.grey[500]
  },
  label: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginTop: '4@ms'
  },
  labelSelected: {
    color: palette.main[700],
    fontWeight: '700'
  },
  value: {
    ...TYPO.caption,
    color: palette.grey[700]
  }
})
