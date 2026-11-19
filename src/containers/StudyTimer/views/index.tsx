import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import { Skeleton } from '@/components/Skeleton'
import { goBack } from '@/navigators/NavigationHelpers'
import useAuthStore from '@/store/useAuthStore'
import useStudyTimerStore from '@/store/useStudyTimerStore'
import { todayIso, toLocalDateIso } from '../configs/helpers'
import useStudyTimerMyDay from '../hooks/useStudyTimerMyDay'
import StudyTimerMyPeriod from '../components/StudyTimerMyPeriod'
import StudyTimerMyDay from '../components/StudyTimerMyDay'
import useStudyTimerMy from '../hooks/useStudyTimerMy'
import StudyTimerMyToday from '../components/StudyTimerMyToday'
import StudyTimerMyUnclosed from '../components/StudyTimerMyUnclosed'
import StudyTimerMyMessages from '../components/StudyTimerMyMessages'
import useStudyTimerMyMessages from '../hooks/useStudyTimerMyMessages'
import useStudyTimerMyGoal from '../hooks/useStudyTimerMyGoal'
import StudyTimerMyGoalDialog from '../components/StudyTimerMyGoalDialog'

/** Route params of Routes.Auth.StudyTimer (messageId opens that inbox message, used by the messages section). */
export type StudyTimerRouteParams = { messageId?: number }

const StudyTimerMyView = () => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { summary, window, setPeriod, shift, status, errorText, reload, refreshKey } =
    useStudyTimerMy()
  const goalForm = useStudyTimerMyGoal(reload)
  const [pickedDate, setPickedDate] = useState<string | null>(null)
  const today = summary ? toLocalDateIso(summary.period.today) : todayIso()
  // A picked day stays while it is inside the window; otherwise the day card falls back to today.
  const selectedDate = useMemo(
    () => (pickedDate && pickedDate >= window.from && pickedDate <= window.to ? pickedDate : today),
    [pickedDate, window.from, window.to, today]
  )
  const {
    day,
    status: dayStatus,
    reload: dayReload
  } = useStudyTimerMyDay(selectedDate, status === 'ready', refreshKey)
  const [refreshing, setRefreshing] = useState(false)
  const route = useRoute()
  const focusMessageId =
    Number((route.params as StudyTimerRouteParams | undefined)?.messageId) || undefined
  const inbox = useStudyTimerMyMessages(focusMessageId, status === 'ready', refreshKey)
  const scrollRef = useRef<ScrollView>(null)
  const inboxReload = inbox.reload
  // A closed run changes both the summary (unclosed list, totals) and the day timeline.
  const handleChanged = useCallback(() => {
    reload()
    dayReload()
  }, [reload, dayReload])

  // Keep the header / sheet / home badge in step with what this page just loaded.
  useEffect(() => {
    if (status === 'ready' && summary) useStudyTimerStore.getState().setBadgeFromSummary(summary)
  }, [status, summary])
  const inboxUnread = inbox.unreadCount
  const inboxHasItems = inbox.items.length > 0
  useEffect(() => {
    if (status === 'ready' && !inbox.loading && inboxHasItems)
      useStudyTimerStore.getState().setUnreadMessages(inboxUnread)
  }, [status, inbox.loading, inboxHasItems, inboxUnread])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([reload(), inboxReload(), dayReload()])
    } finally {
      setRefreshing(false)
    }
  }, [reload, inboxReload, dayReload])

  // Scroll the page so a pushed message is visible (measure against the ScrollView's content view).
  const handleFocusItem = useCallback((node: View) => {
    const inner = scrollRef.current?.getInnerViewNode()
    if (!inner) return
    node.measureLayout(
      inner,
      (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true }),
      () => {}
    )
  }, [])

  const handleOpenTimer = useCallback(() => {
    useAuthStore.getState().setIsOpenTimerDialog(true)
  }, [])

  const renderBody = () => {
    if (status === 'forbidden') {
      return (
        <View style={styles.box} testID="studytimer-my-no-permission">
          <Text style={styles.boxText}>{t('studytimer_my_no_permission')}</Text>
        </View>
      )
    }
    if (status === 'error') {
      return (
        <View style={styles.box} testID="studytimer-my-error">
          <Text style={styles.boxText}>{errorText || t('studytimer_unknown_error')}</Text>
          <TouchableOpacity style={styles.retry} onPress={reload}>
            <Text style={styles.retryText}>{t('try_again')}</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (status === 'loading' || !summary) {
      return (
        <View style={styles.skeleton} testID="studytimer-my-skeleton">
          <Skeleton height={140} borderRadius={12} />
          <Skeleton height={96} borderRadius={12} />
          <Skeleton height={180} borderRadius={12} />
        </View>
      )
    }
    return (
      <View style={styles.sections}>
        <StudyTimerMyToday
          summary={summary}
          onOpenTimer={handleOpenTimer}
          onEditGoal={goalForm.openDialog}
        />
        <StudyTimerMyGoalDialog
          open={goalForm.open}
          isSaving={goalForm.isSaving}
          goal={summary.goal}
          onClose={goalForm.closeDialog}
          onSave={goalForm.save}
        />
        <StudyTimerMyUnclosed
          items={summary.unclosed}
          subjects={summary.subjects}
          onChanged={handleChanged}
        />
        <StudyTimerMyMessages
          items={inbox.items}
          unreadCount={inbox.unreadCount}
          loading={inbox.loading}
          loadingMore={inbox.loadingMore}
          hasMore={inbox.hasMore}
          focusMessageId={focusMessageId}
          loadMore={inbox.loadMore}
          markRead={inbox.markRead}
          reply={inbox.reply}
          onChanged={reload}
          onFocusItem={handleFocusItem}
        />
        <StudyTimerMyPeriod
          summary={summary}
          window={window}
          selectedDate={selectedDate}
          onSelectDate={setPickedDate}
          onSetPeriod={setPeriod}
          onShift={shift}
        />
        <StudyTimerMyDay
          date={selectedDate}
          isToday={selectedDate === today}
          day={day}
          status={dayStatus}
          subjects={summary.subjects}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={palette.grey[900]} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('studytimer_my_title')}</Text>
          <Text style={styles.subtitle}>{t('studytimer_my_subtitle')}</Text>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {renderBody()}
      </ScrollView>
    </View>
  )
}

export default StudyTimerMyView

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg[100]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    backgroundColor: palette.common.white
  },
  headerText: {
    flex: 1
  },
  title: {
    ...TYPO.heading1,
    color: palette.grey[900]
  },
  subtitle: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  content: {
    flexGrow: 1,
    padding: '16@ms'
  },
  sections: {
    gap: '12@ms'
  },
  skeleton: {
    gap: '12@ms'
  },
  box: {
    alignItems: 'center',
    gap: '12@ms',
    padding: '24@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.common.white
  },
  boxText: {
    ...TYPO.body2,
    color: palette.grey[700],
    textAlign: 'center'
  },
  retry: {
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '8@ms',
    backgroundColor: palette.primary.main
  },
  retryText: {
    ...TYPO.body2,
    color: palette.primary.contrastText
  }
})
