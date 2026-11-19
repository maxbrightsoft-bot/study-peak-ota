// Study-timer sheet header: today vs. the teacher's goal, unclosed-timer hint, and the entry to the 내 순공 page.
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import useAuthStore from '@/store/useAuthStore'
import useStudyTimerStore from '@/store/useStudyTimerStore'
import { FEATURE_STUDYTIMER } from '@/utils/constants'
import { Role } from '@/utils/enums'
import { formatDuration } from '../configs/helpers'

type Props = { onOpenMy: () => void }

const StudyTimerSheetSummary = ({ onOpenMy }: Props) => {
  const { t } = useTranslation()
  const isStudent = useAuthStore((s) => !!s.user?.roles?.includes(Role.Student))
  const badge = useStudyTimerStore((s) => s.badge)
  if (!FEATURE_STUDYTIMER || !isStudent || !badge) return null

  const { todayMinutes, goalMinutes, unclosedCount } = badge
  const hasGoal = goalMinutes !== null && goalMinutes > 0
  const todayText = `${t('studytimer_my_today_line')} ${formatDuration(todayMinutes, t)}`
  const line = hasGoal
    ? `${todayText} / ${t('studytimer_my_goal_line')} ${formatDuration(goalMinutes as number, t)}`
    : todayText

  return (
    <View style={styles.container} testID="studytimer-sheet-summary">
      <Text style={styles.hint}>{t('studytimer_header_subject_hint')}</Text>
      <TouchableOpacity style={styles.box} onPress={onOpenMy} activeOpacity={0.7}>
        <View style={styles.row}>
          <View style={styles.texts}>
            <Text style={styles.line}>{line}</Text>
            {!hasGoal && <Text style={styles.meta}>{t('studytimer_my_no_goal')}</Text>}
            {unclosedCount > 0 && (
              <Text style={styles.alert}>
                {t('studytimer_my_unclosed_title', { n: unclosedCount })}
              </Text>
            )}
          </View>
          <View style={styles.link}>
            <Text style={styles.linkText}>{t('studytimer_my_title')}</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.main[600]} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default StudyTimerSheetSummary

const styles = ScaledSheet.create({
  container: {
    gap: '8@ms',
    marginBottom: '12@ms'
  },
  hint: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  box: {
    padding: '12@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.main[50]
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  texts: {
    flex: 1,
    gap: '2@ms'
  },
  line: {
    ...TYPO.body2,
    color: palette.grey[900]
  },
  meta: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  alert: {
    ...TYPO.body3,
    color: palette.error.main
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  linkText: {
    ...TYPO.body2,
    color: palette.main[600]
  }
})
