import React, { FC } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'

import { SubjectTimerResponse } from '../../../utils/types'
import { palette } from '@/theme/colors'
import TimerItem from './TimerItem'
import { ScaledSheet } from 'react-native-size-matters'
import Loading from '@/components/Loading'
import { TimerStatus } from '@/utils/enums/subject'
import TimerClock from './TimerClock'

export interface StudyTimerTabProps {
  subjects: SubjectTimerResponse[]
  isFetching: boolean
  loadingItem: boolean
  activeTimerId?: number
  time?: number
  onStartOrPause: (data: SubjectTimerResponse, isRestart: boolean) => void
  onEditTimer: (data: SubjectTimerResponse) => void
  onStopTimer: (data: SubjectTimerResponse) => void
}

const StudyTimerTab: FC<StudyTimerTabProps> = ({
  subjects,
  isFetching,
  loadingItem,
  activeTimerId,
  time,
  onStartOrPause,
  onEditTimer,
  onStopTimer
}) => {
  const { t } = useTranslation()

  const itemStart = subjects.find((item) => item.status === TimerStatus.Started || item.status === TimerStatus.Paused)

  if (isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
      </View>
    )
  }

  if (!subjects.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t('no_data')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={{ width: '100%', gap: 11 }}>
        {loadingItem && <Loading isOverlay={false} />}
        {itemStart ? (
          <TimerClock
            isLoading={loadingItem}
            time={time}
            onStartOrPauseTimer={onStartOrPause}
            onTerminate={onStopTimer}
            data={itemStart}
          />
        ) : (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item?.id?.toString()}
            style={{ maxHeight: loadingItem ? 'auto' : 400, width: '100%' }}
            renderItem={({ item }) => (
              <TimerItem
                data={item}
                loading={loadingItem}
                seconds={activeTimerId === item.id ? time : undefined}
                activeTimerId={activeTimerId}
                onStartOrPauseTimer={onStartOrPause}
                onEditTimer={onEditTimer}
                onStopTimer={onStopTimer}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}

export default StudyTimerTab

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'column',
    paddingBottom: 34
  },
  listContent: {
    gap: '8@ms'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.grey[300],
    textAlign: 'center'
  },
  actionContainer: {
    borderTopColor: palette.grey[100],
    borderTopWidth: 1,
    display: 'flex',
    paddingTop: '16@ms',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  }
})
