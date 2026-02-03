import React, { FC } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'

import { SubjectTimerResponse } from '../../../utils/types'
import { palette } from '@/theme/colors'
import TimerItem from './TimerItem'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { TYPO } from '@/theme'
import Loading from '@/components/Loading'

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
      <View style={{ maxHeight: 400, width: '100%' }}>
        {loadingItem && <Loading isOverlay={false} />}
        <FlatList
          data={subjects}
          keyExtractor={(item) => item?.id?.toString()}
          style={{ maxHeight: loadingItem ? "auto" : 400, width: '100%' }}
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
      </View>
      <View style={styles.actionContainer}>
        <Pressable>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 14,
              paddingVertical: 8,
              justifyContent: 'center'
            }}
          >
            <Ionicons name="pause-circle-sharp" size={17} color={palette.grey[900]} />
            <Text style={{ color: palette.grey[900], ...TYPO.button3 }}>{t('pause')}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}

export default StudyTimerTab

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'column'
  },
  listContent: {
    gap: '8@ms',
    paddingVertical: '16@ms'
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
