import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import { palette, TYPO } from '@/theme'
import CustomCard from '@/components/Card/CustomCard'
import Clock from '@/assets/iconJSX/clock'
import Next from '@/assets/iconJSX/next'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import useTimers from '@/layouts/hooks/useTimer'
import { TimerStatus } from '@/utils/enums'
import Pause from '@/assets/iconJSX/pause'
import useAuthStore from '@/store/useAuthStore'
import moment from 'moment'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import useServerTime from '@/hooks/useServerTime'
import { parseUTC } from '@/utils/helpers'


const StudyTimerCard = () => {
  const setIsOpenTimerDialog = useAuthStore(state => state.setIsOpenTimerDialog)
  const { t } = useTranslation()
  const { studyTimerProps, getTimers } = useTimers(false, () => { })
  const { subjects, activeTimerId, time, onStartOrPause, loadingItem, isFetching } = studyTimerProps
  const { getServerNow } = useServerTime()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    getTimers()
  }, [])

  useEffect(() => {
    if (subjects.length > 0 && selectedId === null) {
      const active = subjects.find(s => s.id === activeTimerId)
      setSelectedId(active ? active.id : subjects[0].id)
    }
  }, [subjects, activeTimerId])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartStop = () => {
    const selected = subjects.find(s => s.id === selectedId)
    if (!selected) return

    const isStarted = selected.status === TimerStatus.Started
    const isPaused = selected.status === TimerStatus.Paused
    const isStopped = selected.status === TimerStatus.Stopped
    const isLimited = selected.limitedTimeReached

    const isPausedSameToday = isPaused && moment.utc(selected.lastPauseTime).isSame(moment(), 'day')
    const isRestart = isLimited || isStopped || (isPaused && !isPausedSameToday)

    if (isLimited && isStarted) {
      studyTimerProps.onStopTimer(selected)
    } else {
      onStartOrPause(selected, isRestart)
    }
  }

  const selectedTimer = subjects.find(s => s.id === selectedId)

  const getDisplayTimeInSeconds = () => {
    const nowTime = getServerNow()
    if (!selectedTimer) return 0
    const limitedTime = Math.floor(selectedTimer.limitedTime / 1000)
    const duration = Math.floor(selectedTimer.duration / 1000)

    switch (selectedTimer.status) {
      case TimerStatus.Started:
        if (selectedTimer.limitedTimeReached) return limitedTime
        if (activeTimerId !== selectedTimer.id) return duration
        if (time != null) return time
        {
          const ref = selectedTimer.lastResumeTime && selectedTimer.lastResumeTime !== '0001-01-01T00:00:00'
            ? selectedTimer.lastResumeTime
            : selectedTimer.startTime
          const start = parseUTC(ref)
          const elapsedMs = isNaN(start) ? 0 : nowTime - start
          return duration + Math.floor(Math.max(0, elapsedMs) / 1000)
        }
      case TimerStatus.Stopped:
        return 0
      default:
        return duration
    }
  }

  const displayTime = getDisplayTimeInSeconds()
  const isCurrentRunning = selectedId === activeTimerId && selectedTimer?.status === TimerStatus.Started
  const isRestartIcon = selectedTimer && (selectedTimer.limitedTimeReached || selectedTimer.status === TimerStatus.Stopped || (selectedTimer.status === TimerStatus.Paused && !moment.utc(selectedTimer.lastPauseTime).isSame(moment(), 'day')))

  return (
    <CustomCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrapper}>
            <Clock width={16} height={16} color={palette.main[600]} />
          </View>
          <Text style={styles.title}>{t('study_timer')}</Text>
        </View>
        <Text style={styles.subtitle}>{t('timer_on_and_start_study')}</Text>
      </View>

      {isFetching && subjects.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.main[600]} />
        </View>
      ) : subjects.length > 0 ? (
        <>
          <View style={styles.categoryRow}>
            {subjects.slice(0, 4).map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.categoryBtn,
                  selectedId === subject.id && styles.categoryBtnActive
                ]}
                onPress={() => setSelectedId(subject.id)}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.categoryText,
                    selectedId === subject.id && styles.categoryTextActive
                  ]}
                >
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={{ backgroundColor: palette.main[50], borderRadius: 8, alignItems: 'center', justifyContent: 'center', width: 30, height: 38 }}
              onPress={() => setIsOpenTimerDialog(true)}
            >
              <AntDesign name="plus" size={20} color={palette.main[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.timerRow}>
            <Text style={styles.timerText}>{formatTime(displayTime)}</Text>
            <TouchableOpacity
              style={[styles.startBtn, loadingItem && { opacity: 0.7 }]}
              onPress={handleStartStop}
              disabled={loadingItem}
            >
              {loadingItem ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : isCurrentRunning ? (
                <Pause width={12} height={12} color="#FFF" />
              ) : isRestartIcon ? (
                <Ionicons name="reload" size={14} color="#FFF" />
              ) : (
                <Next width={12} height={12} color="#FFF" />
              )}
              <Text style={styles.startBtnText}>
                {loadingItem ? t('loading') : isCurrentRunning ? t('pause') : isRestartIcon ? t('restart') : t('start')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('no_data')}</Text>
          <TouchableOpacity
            style={{ backgroundColor: palette.main[50], borderRadius: 8, alignItems: 'center', justifyContent: 'center', width: 44, height: 44, marginTop: 16 }}
            onPress={() => setIsOpenTimerDialog(true)}
          >
            <AntDesign name="plus" size={20} color={palette.main[600]} />
          </TouchableOpacity>
        </View>
      )}
    </CustomCard>
  )
}

export default StudyTimerCard

const styles = ScaledSheet.create({
  card: {
    padding: '16@ms',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
  },
  iconWrapper: {
    backgroundColor: palette.main[50],
    padding: '4@ms',
    borderRadius: 999,
  },
  title: {
    ...TYPO.heading3,
    color: palette.grey[900],
  },
  subtitle: {
    fontSize: '11@ms',
    color: palette.main[600],
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: '8@ms',
    marginBottom: '20@ms',
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: '8@ms',
    backgroundColor: palette.main[50],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBtnActive: {
    backgroundColor: palette.main[600],
  },
  categoryText: {
    fontSize: '13@ms',
    color: palette.main[600],
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontSize: '32@ms',
    fontWeight: '700',
    color: palette.grey[900],
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.main[600],
    paddingVertical: '10@ms',
    paddingHorizontal: '18@ms',
    borderRadius: 999,
    gap: '6@ms',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '20@ms',
  },
  emptyText: {
    ...TYPO.body4,
    color: palette.grey[400],
  },
  loadingContainer: {
    height: '100@ms',
    alignItems: 'center',
    justifyContent: 'center',
  }
})
