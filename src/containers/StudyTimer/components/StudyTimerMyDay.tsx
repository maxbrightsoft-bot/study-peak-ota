// The picked day (today by default) with its timeline. A failed request is never shown as "no record".
import React from 'react'
import { Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import CustomCard from '@/components/Card/CustomCard'
import { Skeleton } from '@/components/Skeleton'
import { formatClock, formatDuration } from '../configs/helpers'
import { StudyTimerDayResponse, StudyTimerSubjectResponse } from '../configs/types'
import { StudyTimerMyDayStatus } from '../hooks/useStudyTimerMyDay'
import StudyTimerTimeline from './StudyTimerTimeline'

type Props = {
  date: string
  isToday: boolean
  day: StudyTimerDayResponse | null
  status: StudyTimerMyDayStatus
  subjects: StudyTimerSubjectResponse[]
}

const StudyTimerMyDay = ({ date, isToday, day, status, subjects }: Props) => {
  const { t } = useTranslation()
  const first = day?.records[0]
  const last = day?.records[day.records.length - 1]

  return (
    <CustomCard style={styles.card} radius={16}>
      <View testID="studytimer-my-day">
        <Text style={styles.title}>
          {t(isToday ? 'studytimer_my_today_line' : 'studytimer_my_day_line')} {date}
        </Text>
        {status === 'ready' && day ? (
          <>
            <View style={styles.chips}>
              <View style={[styles.chip, { backgroundColor: palette.main[50] }]}>
                <Text style={[styles.chipText, { color: palette.main[600] }]}>
                  {t('studytimer_tl_study')} {formatDuration(day.studyMinutes, t)}
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: palette.success.lighter }]}>
                <Text style={[styles.chipText, { color: palette.success.dark }]}>
                  {t('studytimer_tl_break')} {formatDuration(day.breakMinutes, t)}
                </Text>
              </View>
              {day.unclosedCount > 0 ? (
                <View style={[styles.chip, { backgroundColor: palette.grey[100] }]}>
                  <Text style={[styles.chipText, { color: palette.grey[700] }]}>
                    {t('studytimer_unclosed_n', { n: day.unclosedCount })}
                  </Text>
                </View>
              ) : null}
            </View>
            {first && last ? (
              <Text style={styles.span}>
                {t('studytimer_tl_span', {
                  a: formatClock(first.startedAt),
                  b: formatClock(last.endedAt || last.startedAt)
                })}
              </Text>
            ) : null}
            <View style={styles.timeline}>
              <StudyTimerTimeline day={day} subjects={subjects} />
            </View>
          </>
        ) : status === 'error' ? (
          <View style={styles.error} testID="studytimer-my-day-error">
            <Text style={styles.errorText}>{t('studytimer_tl_load_failed')}</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            <Skeleton height={32} borderRadius={8} />
          </View>
        )}
      </View>
    </CustomCard>
  )
}

export default StudyTimerMyDay

const styles = ScaledSheet.create({
  card: { padding: '16@ms' },
  title: { ...TYPO.heading3, color: palette.grey[900] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: '6@ms', marginTop: '10@ms' },
  chip: { paddingVertical: '4@ms', paddingHorizontal: '10@ms', borderRadius: '999@ms' },
  chipText: { ...TYPO.caption, fontWeight: '600' },
  span: { ...TYPO.caption, color: palette.grey[500], marginTop: '8@ms' },
  timeline: { marginTop: '12@ms' },
  error: {
    marginTop: '12@ms',
    padding: '12@ms',
    borderRadius: '8@ms',
    backgroundColor: palette.error.lighter
  },
  errorText: { ...TYPO.body3, color: palette.error.dark }
})
