// Week / month of the student's own study: change vs previous, days on goal, bars, subject split.
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet, moderateScale } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import CustomCard from '@/components/Card/CustomCard'
import { StudyTimerMyPeriod as Period } from '../configs/enums'
import {
  canShiftForward,
  formatDuration,
  formatSignedDuration,
  toLocalDateIso
} from '../configs/helpers'
import { subjectColor } from '../configs/subjectColor'
import { StudyTimerMySummaryResponse, StudyTimerMyWindow } from '../configs/types'
import StudyTimerMyBars from './StudyTimerMyBars'

type Props = {
  summary: StudyTimerMySummaryResponse
  window: StudyTimerMyWindow
  selectedDate: string
  onSelectDate: (date: string) => void
  onSetPeriod: (period: Period) => void
  onShift: (dir: 1 | -1) => void
}

const StudyTimerMyPeriod = ({
  summary,
  window,
  selectedDate,
  onSelectDate,
  onSetPeriod,
  onShift
}: Props) => {
  const { t } = useTranslation()
  const forwardOk = canShiftForward(window)
  const subjectIds = summary.subjects.map((s) => s.id)
  const total = Math.max(1, summary.studyMinutes)
  const hasGoal = summary.days.some((d) => d.goalMinutes !== null)
  const up = summary.changeMinutes >= 0

  const segments = [
    { value: Period.Week, label: t('studytimer_my_week'), testID: 'studytimer-my-period-week' },
    { value: Period.Month, label: t('studytimer_my_month'), testID: 'studytimer-my-period-month' }
  ]

  return (
    <CustomCard style={styles.card} radius={16}>
      <View testID="studytimer-my-period">
        <Text style={styles.title}>{t('studytimer_my_period_title')}</Text>
        <View style={styles.nav}>
          <TouchableOpacity
            testID="studytimer-my-prev"
            style={styles.arrow}
            onPress={() => onShift(-1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={moderateScale(20)} color={palette.grey[800]} />
          </TouchableOpacity>
          <View style={styles.segment}>
            {segments.map((s) => {
              const on = window.period === s.value
              return (
                <TouchableOpacity
                  key={s.value}
                  testID={s.testID}
                  style={[styles.segmentItem, on && styles.segmentOn]}
                  onPress={() => onSetPeriod(s.value)}
                >
                  <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{s.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity
            testID="studytimer-my-next"
            style={[styles.arrow, !forwardOk && styles.arrowOff]}
            disabled={!forwardOk}
            onPress={() => onShift(1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={moderateScale(20)} color={palette.grey[800]} />
          </TouchableOpacity>
        </View>
        <Text style={styles.range}>
          {toLocalDateIso(summary.period.from)} — {toLocalDateIso(summary.period.to)}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{t('studytimer_my_total')}</Text>
            <Text style={[styles.statValue, { color: palette.main[600] }]}>
              {formatDuration(summary.studyMinutes, t)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{t('studytimer_my_vs_previous')}</Text>
            <Text
              style={[styles.statValue, { color: up ? palette.success.dark : palette.error.dark }]}
            >
              {formatSignedDuration(summary.changeMinutes, t)}
            </Text>
          </View>
          {hasGoal ? (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('studytimer_my_goal_days')}</Text>
              <Text style={[styles.statValue, { color: palette.grey[900] }]}>
                {summary.goalReachedDays} / {summary.days.length}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bars}>
          <StudyTimerMyBars
            days={summary.days}
            goal={summary.goal}
            selectedDate={selectedDate}
            onSelect={onSelectDate}
          />
        </View>
        <Text style={styles.hint}>{t('studytimer_my_bar_hint')}</Text>

        <View style={styles.subjects}>
          {summary.subjects
            .filter((s) => summary.bySubject.some((b) => b.subjectId === s.id && b.minutes > 0))
            .map((s) => {
              const minutes = summary.bySubject.find((b) => b.subjectId === s.id)?.minutes ?? 0
              const color = subjectColor(s.id, subjectIds)
              return (
                <View key={s.id} style={styles.subjectRow}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.subjectName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        { width: `${Math.round((minutes / total) * 100)}%`, backgroundColor: color }
                      ]}
                    />
                  </View>
                  <Text style={styles.subjectValue}>{formatDuration(minutes, t)}</Text>
                </View>
              )
            })}
        </View>
      </View>
    </CustomCard>
  )
}

export default StudyTimerMyPeriod

const styles = ScaledSheet.create({
  card: { padding: '16@ms' },
  title: { ...TYPO.heading3, color: palette.grey[900] },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '12@ms'
  },
  arrow: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.grey[100]
  },
  arrowOff: { opacity: 0.35 },
  segment: {
    flexDirection: 'row',
    padding: '3@ms',
    borderRadius: '999@ms',
    backgroundColor: palette.grey[100]
  },
  segmentItem: {
    paddingVertical: '6@ms',
    paddingHorizontal: '14@ms',
    borderRadius: '999@ms'
  },
  segmentOn: { backgroundColor: palette.common.white },
  segmentText: { ...TYPO.body3, color: palette.grey[500], fontWeight: '600' },
  segmentTextOn: { color: palette.main[700] },
  range: { ...TYPO.caption, color: palette.grey[500], marginTop: '8@ms', textAlign: 'center' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: '20@ms', marginTop: '12@ms' },
  stat: { gap: '2@ms' },
  statLabel: { ...TYPO.caption, color: palette.grey[500] },
  statValue: { ...TYPO.heading3, fontWeight: '800' },
  bars: { marginTop: '16@ms' },
  hint: { ...TYPO.caption, color: palette.grey[500], marginTop: '8@ms' },
  subjects: { gap: '8@ms', marginTop: '16@ms' },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: '8@ms' },
  dot: { width: '8@ms', height: '8@ms', borderRadius: '4@ms' },
  subjectName: { ...TYPO.body3, width: '56@ms', color: palette.grey[800], fontWeight: '600' },
  track: {
    flex: 1,
    height: '8@ms',
    borderRadius: '999@ms',
    overflow: 'hidden',
    backgroundColor: palette.grey[100]
  },
  fill: { height: '100%', borderRadius: '999@ms' },
  subjectValue: {
    ...TYPO.body3,
    width: '84@ms',
    textAlign: 'right',
    color: palette.grey[800],
    fontWeight: '700'
  }
})
