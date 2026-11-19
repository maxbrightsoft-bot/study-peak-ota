import React, { useCallback, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import CustomCard from '@/components/Card/CustomCard'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { getMyWrongNoteSummaryApi } from '@/containers/MyWrongNote/apiClients'
import { deadlineChip, isDeadlineNear, resolveDeadlineState } from '@/containers/MyWrongNote/configs/helpers'
import useNowTick from '@/containers/MyWrongNote/hooks/useNowTick'
import { deadlineTone } from '@/containers/MyWrongNote/configs/look'
import { MyDeadlineState } from '@/containers/MyWrongNote/configs/enums'
import { MyWrongNoteSummaryResponse } from '@/containers/MyWrongNote/configs/types'

const MyWrongNoteCard = () => {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<MyWrongNoteSummaryResponse | undefined>()

  // Feature flag off (404) or any error: the card simply does not render.
  useFocusEffect(
    useCallback(() => {
      let active = true
      getMyWrongNoteSummaryApi()
        .then(({ data }) => {
          if (active) setSummary(data)
        })
        .catch(() => {
          if (active) setSummary(undefined)
        })
      return () => {
        active = false
      }
    }, [])
  )

  // Tick once a minute while the next deadline is inside the due-soon window (hook runs before the early return).
  const nowMs = useNowTick(isDeadlineNear(summary?.nextDeadline?.deadlineAt))

  if (!summary) return null

  const { nextDeadline } = summary
  const deadlineState = nextDeadline
    ? resolveDeadlineState(MyDeadlineState.Open, nextDeadline.deadlineAt, nowMs)
    : MyDeadlineState.None
  const tone = deadlineTone(deadlineState)

  // deepLinkKey makes the hub treat this as a fresh navigation (no exam = show the list).
  const openHub = () =>
    navigate(Routes.Auth.MyWrongNote, { deepLinkKey: Date.now(), examSessionId: undefined })
  const openExam = () =>
    nextDeadline &&
    navigate(Routes.Auth.MyWrongNote, {
      deepLinkKey: Date.now(),
      examSessionId: nextDeadline.examSessionId
    })

  return (
    <CustomCard style={styles.card} onPress={openHub}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('mywrongnote_home_card_title')}</Text>
        <Ionicons name="chevron-forward" size={18} color={palette.grey[400]} />
      </View>
      <View style={styles.countsRow}>
        <Text style={[styles.count, styles.countTodo]}>{t('mywrongnote_chip_todo', { n: summary.todoCount })}</Text>
        <Text style={[styles.count, styles.countRejected]}>{t('mywrongnote_chip_rejected', { n: summary.rejectedCount })}</Text>
        <Text style={[styles.count, styles.countPending]}>{t('mywrongnote_chip_pending', { n: summary.pendingCount })}</Text>
        <Text style={styles.count}>{t('mywrongnote_chip_approved', { n: summary.approvedCount })}</Text>
      </View>
      {nextDeadline && (
        <TouchableOpacity
          style={[styles.deadline, { backgroundColor: tone.bg }]}
          onPress={openExam}
          activeOpacity={0.8}
        >
          <Text numberOfLines={1} style={[styles.deadlineText, { color: tone.color }]}>
            {nextDeadline.title} · {deadlineChip(MyDeadlineState.Open, nextDeadline.deadlineAt, t, nowMs)}
          </Text>
        </TouchableOpacity>
      )}
    </CustomCard>
  )
}

export default MyWrongNoteCard

const styles = ScaledSheet.create({
  card: {
    padding: '16@ms',
    backgroundColor: palette.common.white,
    borderRadius: '16@ms'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12@ms'
  },
  title: {
    ...TYPO.heading3,
    color: palette.grey[900]
  },
  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8@ms'
  },
  count: {
    ...TYPO.body4,
    color: palette.grey[700],
    backgroundColor: palette.grey[100],
    paddingHorizontal: '10@ms',
    paddingVertical: '4@ms',
    borderRadius: '999@ms',
    overflow: 'hidden'
  },
  // Same colours as the hub's count chips (MyWrongNoteHeader).
  countTodo: {
    color: palette.error.dark,
    backgroundColor: palette.error.lighter
  },
  countRejected: {
    color: palette.warning.darker,
    backgroundColor: palette.warning.lighter
  },
  countPending: {
    color: palette.success.dark,
    backgroundColor: palette.green_support[100]
  },
  deadline: {
    marginTop: '12@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    borderRadius: '10@ms'
  },
  deadlineText: {
    ...TYPO.button4
  }
})
