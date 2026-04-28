import React, { FC, useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { SubjectTimerResponse } from '../../../utils/types'
import { palette } from '@/theme/colors'
import TimerItem from './TimerItem'
import { ScaledSheet } from 'react-native-size-matters'
import Loading from '@/components/Loading'
import { TimerStatus } from '@/utils/enums/subject'
import TimerClock from './TimerClock'
import CustomSelect from '@/components/Select/CustomSelect'
import { getSubjectListApi } from '@/services/api/subjectService'
import useAuthStore from '@/store/useAuthStore'

export interface StudyTimerTabProps {
  getTimers: () => Promise<void>
  subjects: SubjectTimerResponse[]
  isFetching: boolean
  loadingItem: boolean
  activeTimerId?: number
  time?: number
  onStartOrPause: (data: SubjectTimerResponse, isRestart?: boolean) => void
  onEditTimer: (data: SubjectTimerResponse) => void
  onStopTimer: (data: SubjectTimerResponse, stopTime?: number, callback?: () => void) => void
  hasMore?: boolean
  loadMoreTimers?: () => void
}

const StudyTimerTab: FC<StudyTimerTabProps> = ({
  subjects,
  isFetching,
  loadingItem,
  activeTimerId,
  time,
  onStartOrPause,
  onEditTimer,
  onStopTimer,
  getTimers,
  hasMore,
  loadMoreTimers
}) => {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const [isAdding, setIsAdding] = useState(false)
  const [addingOptions, setAddingOptions] = useState<{label: string, value: number}[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>()
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  useEffect(() => {
    getTimers()
  }, [])

  const handleFetchSubjects = async () => {
    setIsLoadingOptions(true)
    try {
      const res = await getSubjectListApi('', true)
      setAddingOptions(res.data?.items?.map((i: any) => ({ label: i.name, value: i.id })) || [])
    } catch(e) {
    } finally {
      setIsLoadingOptions(false)
    }
  }

  useEffect(() => {
    if (isAdding) {
      handleFetchSubjects()
    } else {
      setSelectedSubjectId(undefined)
    }
  }, [isAdding])

  const handleStartAddedTimer = () => {
    if (selectedSubjectId) {
      onStartOrPause({ id: selectedSubjectId } as SubjectTimerResponse)
      setIsAdding(false)
    }
  }

  const itemStart = subjects.find((item) => item.status === TimerStatus.Started)

  if (isAdding) {
    return (
      <View style={styles.container}>
        <View style={{ width: '100%', gap: 11 }}>
          {isLoadingOptions ? (
            <ActivityIndicator size="small" color={palette.main[600]} style={{ marginVertical: 20 }} />
          ) : (
            <CustomSelect
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              options={addingOptions}
              placeholder={t('select_subject')}
            />
          )}
          <View style={styles.addingActions}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setIsAdding(false)}>
              <Text style={styles.backBtnText}>{t('back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               style={[styles.startBtn, !selectedSubjectId && { opacity: 0.5 }]} 
               disabled={!selectedSubjectId}
               onPress={handleStartAddedTimer}
            >
              <Text style={styles.startBtnText}>{t('start')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  if (isFetching && !subjects.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={palette.main[600]} />
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
            keyExtractor={(item) => `${item.id}_${item.timerId}`}
            style={{ maxHeight: Dimensions.get('window').height * 0.7, width: '100%' }}
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
            onEndReached={loadMoreTimers}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              <View style={{ marginTop: 10, alignItems: 'center' }}>
                {isFetching && subjects.length > 0 && <ActivityIndicator size="small" style={{ marginBottom: 10 }} color={palette.main[600]} />}
                <TouchableOpacity style={styles.addSubjectBtn} onPress={() => setIsAdding(true)}>
                  <Ionicons name="add" size={24} color={palette.main[600]} />
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              <View style={[styles.center, { marginVertical: 20 }]}>
                <Text style={styles.emptyText}>{t('no_data')}</Text>
              </View>
            }
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
  },
  addingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: palette.grey[200]
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.grey[800]
  },
  startBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: palette.main[600]
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF'
  },
  addSubjectBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.main[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  }
})
