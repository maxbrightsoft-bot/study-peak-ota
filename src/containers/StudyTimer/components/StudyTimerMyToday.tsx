// Today against the goal (the teacher's or the student's own). Own numbers only (UI_GUIDE rule 1); no goal is never rendered as 0 %.
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet, moderateScale } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import CustomCard from '@/components/Card/CustomCard'
import useAuthStore from '@/store/useAuthStore'
import { formatDuration, canEditMyGoal, goalProgress, goalRows, myGoalLabel, ringGoal } from '../configs/helpers'
import { StudyTimerMySummaryResponse } from '../configs/types'
import StudyTimerRing from './StudyTimerRing'

type Props = {
  summary: StudyTimerMySummaryResponse
  onOpenTimer: () => void
  onEditGoal: () => void
}

const StudyTimerMyToday = ({ summary, onOpenTimer, onEditGoal }: Props) => {
  const { t } = useTranslation()
  // Study space (no academy): only the student's own goal exists.
  const isStudySpace = useAuthStore((state) => !state.user?.academyDomain)
  const { today, goal, streak } = summary
  const goalLabel = myGoalLabel(goal, isStudySpace)
  const rows = goalRows(goal, isStudySpace, today.studyMinutes)
  const ringTarget = ringGoal(
    rows.find((r) => r.kind === 'teacher')?.minutes ?? null,
    rows.find((r) => r.kind === 'personal')?.minutes ?? null,
    today.studyMinutes
  )
  const { percent, ringFraction } = goalProgress(ringTarget, today.studyMinutes)
  const hasPersonalRow = rows.some((r) => r.kind === 'personal')
  const emptyText =
    goalLabel === 'spaceNoGoal'
      ? t('studytimer_my_goal_space_none')
      : goalLabel === 'noClass'
        ? t('studytimer_my_no_class')
        : t('studytimer_my_no_goal')
  const teacherCourse =
    goal.courses.find((c) => c.dailyMinutes === goal.teacherMinutes)?.courseName ??
    goal.sourceCourseName ??
    ''
  const editLink = canEditMyGoal(goal) ? (
    <TouchableOpacity
      onPress={onEditGoal}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID="studytimer-my-goal-edit"
    >
      <Text style={styles.goalEdit}>
        {t(hasPersonalRow ? 'studytimer_my_goal_change' : 'studytimer_my_goal_set')}
      </Text>
    </TouchableOpacity>
  ) : null

  return (
    <CustomCard style={styles.card} radius={16}>
      <View testID="studytimer-my-today">
        <Text style={styles.title}>{t('studytimer_my_today_title')}</Text>
        <View style={styles.row}>
          <StudyTimerRing fraction={ringFraction} size={moderateScale(132)}>
            <Text
              style={styles.study}
              testID="studytimer-my-today-study"
              adjustsFontSizeToFit
              numberOfLines={2}
            >
              {formatDuration(today.studyMinutes, t)}
            </Text>
            {percent !== null ? <Text style={styles.percent}>{percent}%</Text> : null}
          </StudyTimerRing>
          <View style={styles.info}>
            {rows.length === 0 ? <Text style={styles.goal}>{emptyText}</Text> : null}
            {rows.map((row) => (
              <View key={row.kind} style={styles.goalRow} testID={`studytimer-my-goal-row-${row.kind}`}>
                <Text style={styles.goal}>
                  {row.kind === 'personal'
                    ? t('studytimer_my_goal_personal', { goal: formatDuration(row.minutes, t) })
                    : teacherCourse
                      ? t('studytimer_my_goal', {
                          goal: formatDuration(row.minutes, t),
                          course: teacherCourse
                        })
                      : t('studytimer_my_goal_no_course', { goal: formatDuration(row.minutes, t) })}
                </Text>
                {row.reached ? (
                  <Text style={[styles.status, { color: palette.success.dark }]}>
                    {t('studytimer_my_goal_reached')}
                    {row.percent !== null ? ` · ${row.percent}%` : ''}
                  </Text>
                ) : row.remaining !== null ? (
                  <Text style={styles.status}>
                    {t('studytimer_my_remaining', { time: formatDuration(row.remaining, t) })}
                    {row.percent !== null ? ` · ${row.percent}%` : ''}
                  </Text>
                ) : null}
                {row.kind === 'personal' ? editLink : null}
              </View>
            ))}
            {!hasPersonalRow ? editLink : null}
            <View style={styles.chips}>
              <View style={[styles.chip, { backgroundColor: palette.main[50] }]}>
                <Text
                  style={[styles.chipText, { color: palette.main[600] }]}
                  testID="studytimer-my-streak"
                >
                  {t('studytimer_my_streak', { n: streak.current })}
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: palette.grey[100] }]}>
                <Text style={[styles.chipText, { color: palette.grey[700] }]}>
                  {t('studytimer_my_recorded30', {
                    n: streak.recordedDaysLast30
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={onOpenTimer}
          testID="studytimer-my-open-timer"
        >
          <Ionicons
            name="play-circle-outline"
            size={moderateScale(20)}
            color={palette.common.white}
          />
          <Text style={styles.buttonText}>{t('studytimer_my_open_timer')}</Text>
        </TouchableOpacity>
        {rows.some((r) => r.kind === 'teacher') && goal.courses.length > 1 ? (
          <Text style={styles.footnote}>{t('studytimer_my_goal_rule')}</Text>
        ) : null}
      </View>
    </CustomCard>
  )
}

export default StudyTimerMyToday

const styles = ScaledSheet.create({
  card: {
    padding: '16@ms'
  },
  title: {
    ...TYPO.heading3,
    color: palette.grey[900]
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16@ms',
    marginTop: '12@ms'
  },
  study: {
    ...TYPO.heading3,
    color: palette.grey[900],
    textAlign: 'center'
  },
  percent: {
    ...TYPO.body3,
    fontWeight: '700',
    color: palette.grey[500]
  },
  info: {
    flex: 1,
    gap: '8@ms'
  },
  goalRow: {
    gap: '2@ms'
  },
  goal: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  goalEdit: {
    ...TYPO.body3,
    fontWeight: '600',
    color: palette.main[600]
  },
  status: {
    ...TYPO.body2,
    fontWeight: '700',
    color: palette.grey[900]
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '6@ms'
  },
  chip: {
    paddingVertical: '4@ms',
    paddingHorizontal: '10@ms',
    borderRadius: '999@ms'
  },
  chipText: {
    ...TYPO.caption,
    fontWeight: '600'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6@ms',
    marginTop: '16@ms',
    paddingVertical: '12@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.main[600]
  },
  buttonText: {
    ...TYPO.button2,
    color: palette.common.white
  },
  footnote: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginTop: '12@ms'
  }
})
