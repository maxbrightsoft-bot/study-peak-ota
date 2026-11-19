// One day: records in time order on a single track. Unclosed runs are fixed grey placeholders (excluded from totals).
import React from 'react'
import { Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import { TimerRecordKind } from '../configs/enums'
import {
  formatClock,
  formatDuration,
  showTimelineBlockLabel,
  timelineBlockLabel
} from '../configs/helpers'
import { subjectColor } from '../configs/subjectColor'
import {
  StudyTimerDayResponse,
  StudyTimerRecordResponse,
  StudyTimerSubjectResponse
} from '../configs/types'

type Props = {
  day: StudyTimerDayResponse
  subjects: StudyTimerSubjectResponse[]
}

const UNCLOSED_PLACEHOLDER_MINUTES = 15

const StudyTimerTimeline = ({ day, subjects }: Props) => {
  const { t } = useTranslation()
  const subjectIds = subjects.map((s) => s.id)
  const records = day.records
  const first = records[0]
  const last = records[records.length - 1]
  const hasManual = records.some((r) => r.isManuallyClosed)
  const blockMinutes = (r: StudyTimerRecordResponse) =>
    Math.max(1, r.isClosed ? r.minutes : UNCLOSED_PLACEHOLDER_MINUTES)
  const totalMinutes = records.reduce((sum, r) => sum + blockMinutes(r), 0)

  const legend = [
    { label: t('studytimer_tl_study'), color: palette.main[600] },
    { label: t('studytimer_tl_break'), color: palette.success.light },
    { label: t('studytimer_tl_open'), color: palette.grey[400] }
  ]

  return (
    <View testID="studytimer-timeline">
      <View style={styles.track} testID="studytimer-timeline-bar">
        {records.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('studytimer_tl_none')}</Text>
          </View>
        ) : (
          records.map((r) => {
            const minutes = blockMinutes(r)
            const isBreak = r.isClosed && r.kind !== TimerRecordKind.Study
            const color = !r.isClosed
              ? palette.grey[400]
              : isBreak
                ? palette.success.light
                : subjectColor(r.subjectId, subjectIds)
            const label = showTimelineBlockLabel(minutes, totalMinutes)
              ? timelineBlockLabel(r, subjects, t)
              : ''
            return (
              <View
                key={r.id}
                testID={r.isManuallyClosed ? 'studytimer-tl-manual' : undefined}
                style={[
                  styles.block,
                  { flex: minutes, backgroundColor: color },
                  r.isManuallyClosed && styles.manual
                ]}
              >
                {label ? (
                  <Text
                    numberOfLines={1}
                    style={[styles.blockText, isBreak && styles.blockTextBreak]}
                  >
                    {label}
                  </Text>
                ) : null}
              </View>
            )
          })
        )}
      </View>

      {first && last ? (
        <View style={styles.clock}>
          <Text style={styles.clockText}>{formatClock(first.startedAt)}</Text>
          <Text style={styles.clockText}>{formatClock(last.endedAt || last.startedAt)}</Text>
        </View>
      ) : null}

      <View style={styles.legend}>
        {legend.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
        {hasManual ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendManual]} />
            <Text style={styles.legendText}>{t('studytimer_tl_manual_legend')}</Text>
          </View>
        ) : null}
      </View>

      {day.bySubject.length > 0 ? (
        <View style={styles.grid}>
          {subjects
            .filter((s) => day.bySubject.some((b) => b.subjectId === s.id))
            .map((s) => (
              <View key={s.id} style={styles.gridItem}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: subjectColor(s.id, subjectIds) }]}
                  />
                  <Text style={styles.legendText}>{s.name}</Text>
                </View>
                <Text style={styles.gridValue}>
                  {formatDuration(day.bySubject.find((b) => b.subjectId === s.id)?.minutes ?? 0, t)}
                </Text>
              </View>
            ))}
        </View>
      ) : null}
    </View>
  )
}

export default StudyTimerTimeline

const styles = ScaledSheet.create({
  track: {
    flexDirection: 'row',
    height: '32@ms',
    borderRadius: '8@ms',
    overflow: 'hidden',
    backgroundColor: palette.grey[100]
  },
  block: { height: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  blockText: {
    ...TYPO.caption,
    fontSize: '10@ms',
    fontWeight: '700',
    color: palette.common.white,
    paddingHorizontal: '2@ms'
  },
  // White text is hard to read on the light green break block.
  blockTextBreak: { color: palette.success.dark },
  manual: {
    opacity: 0.65,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.common.white
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...TYPO.caption, color: palette.grey[500] },
  clock: { flexDirection: 'row', justifyContent: 'space-between', marginTop: '6@ms' },
  clockText: { ...TYPO.caption, color: palette.grey[500] },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: '12@ms', marginTop: '10@ms' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: '4@ms' },
  legendDot: { width: '10@ms', height: '10@ms', borderRadius: '3@ms' },
  legendManual: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.grey[500],
    backgroundColor: palette.grey[300]
  },
  legendText: { ...TYPO.caption, color: palette.grey[500] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: '20@ms', marginTop: '16@ms' },
  gridItem: { gap: '2@ms' },
  gridValue: { ...TYPO.heading3, fontWeight: '800', color: palette.grey[900] }
})
