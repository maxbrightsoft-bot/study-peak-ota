import React, { FC, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { IconButton, Chip, Button } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment, { Moment } from 'moment'
import { useTranslation } from 'react-i18next'

import { RecordItem, TimeLine, Timer } from '../../configs/types'
import { getDisplayDiffTime, getPrevTimes } from '../../configs/fn'
import { DEFAULT_TIME_IN_MINUTES } from '../../configs/constants'
import TimerDivider from './TimerDivider'
import { palette } from '@/theme/colors'
import { TimerStatus } from '@/utils/enums'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  data: RecordItem
  single?: boolean
  prevItem?: RecordItem
  nextItem?: RecordItem
  date?: moment.Moment
  onError?: (error: boolean) => void
  onUpdate: (data: RecordItem, newTime: Moment) => void
  onAdd: (data: RecordItem, newRecord: TimeLine) => void
  onDelete: (data: RecordItem) => void
  onDeleteTimer?: (timerIndex: number) => void
  onAddTimer?: (timerIndex: number, timer: Timer) => void
}

const TimerLineItem: FC<Props> = ({
  data,
  single,
  prevItem,
  nextItem,
  date,
  onUpdate,
  onAdd,
  onDelete,
  onDeleteTimer,
  onAddTimer,
  onError
}) => {
  const { t } = useTranslation()
  const { timer, isStart, time, status } = data

  const timeValue = moment.utc(time).local()
  const prevTimeValue = prevItem?.time ? moment.utc(prevItem.time).local() : undefined
  const nextTimeValue = nextItem?.time ? moment.utc(nextItem.time).local() : undefined

  const [showPicker, setShowPicker] = useState(false)

  const title = useMemo(() => {
    switch (status) {
      case TimerStatus.Stopped:
        return t('stopped')
      case TimerStatus.Paused:
        return t('paused')
      default:
        return isStart ? t('started') : t('resumed')
    }
  }, [status, isStart, t])

  const minTime = useMemo(() => {
    if (prevTimeValue && prevTimeValue.isSame(timeValue, 'day')) {
      return prevTimeValue.clone().add(1, 'second')
    }
    return undefined
  }, [prevTimeValue?.toISOString(), timeValue.toISOString()])

  const maxTime = useMemo(() => {
    if (nextTimeValue && nextTimeValue.isSame(timeValue, 'day')) {
      return nextTimeValue.clone().add(-1, 'second')
    }
    if (timeValue.isSame(moment(), 'day')) return moment()
    return undefined
  }, [nextTimeValue?.toISOString(), timeValue.toISOString()])

  const handleUpdateTime = (_: any, dateValue?: Date) => {
    setShowPicker(false)
    if (!dateValue) return

    const newMoment = moment(dateValue)
    if (!newMoment.isValid()) {
      onError?.(true)
      return
    }

    const invalid = (!!minTime && newMoment.isBefore(minTime)) || (!!maxTime && newMoment.isAfter(maxTime))

    onError?.(invalid)
    onUpdate(data, newMoment)
  }

  const handleAddRecord = () => {
    let startMoment = timeValue.clone().add(-DEFAULT_TIME_IN_MINUTES - 1, 'minutes')
    let endMoment = timeValue.clone().add(-1, 'minutes')

    if (!startMoment.isSame(endMoment, 'day')) {
      endMoment = endMoment.clone().startOf('day').add(-1, 'minutes')
      startMoment = endMoment.clone().add(-1, 'minutes')
    }

    const totalDiff = endMoment.diff(startMoment, 'milliseconds')
    const newRecord: TimeLine = {
      id: 0,
      startedAt: startMoment.utc().toISOString(),
      stoppedAt: endMoment.utc().toISOString(),
      totalTime: totalDiff
    }

    onAdd(data, newRecord)
  }

  const handleAddTimer = () => {
    const { startMoment, endMoment } = getPrevTimes(timeValue)
    const totalDiff = endMoment.diff(startMoment, 'milliseconds')

    const newRecord: TimeLine = {
      id: 0,
      startedAt: startMoment.utc().toISOString(),
      stoppedAt: endMoment.utc().toISOString(),
      totalTime: totalDiff
    }

    const newTimer: Timer = {
      id: 0,
      duration: totalDiff,
      status: TimerStatus.Stopped,
      startTime: newRecord.startedAt,
      limitedTimeReached: false,
      limitedTime: timer.limitedTime,
      records: [newRecord],
      lastPauseTime: '',
      lastResumeTime: '',
      name: '',
      rowVersion: '',
      timerId: 0
    }

    onAddTimer?.(data.timerIndex, newTimer)
  }

  const timeRange = useMemo(() => {
    if (status !== TimerStatus.Started || !nextTimeValue) return null
    return getDisplayDiffTime(t, timeValue, nextTimeValue)
  }, [status, nextTimeValue?.toISOString(), timeValue.toISOString(), t])

  return (
    <View style={styles.container}>
      {status === TimerStatus.Started && isStart && (
        <TimerDivider
          data={timer}
          starting
          noActions={single}
          onAddTimer={handleAddTimer}
          onRemoveTimer={() => onDeleteTimer?.(data.timerIndex)}
        />
      )}

      <View style={styles.row}>
        <View style={styles.left}>
          <Button mode="outlined" style={{ borderRadius: 8 }} onPress={() => setShowPicker(true)}>
            {timeValue.format('HH:mm:ss')}
          </Button>

          {timeRange && (
            <View style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Chip compact style={styles.chip} textStyle={{ color: '#FFF' }}>
                {timeRange}
              </Chip>
            </View>
          )}
        </View>

        <View style={styles.center}>
          <View
            style={[
              styles.dot,
              status === TimerStatus.Paused && styles.dotPaused,
              status === TimerStatus.Stopped && styles.dotStopped
            ]}
          />
          {status !== TimerStatus.Stopped && <View style={styles.line} />}
        </View>

        <View style={styles.right}>
          <Text style={styles.title}>{title}</Text>

          {status === TimerStatus.Started && (
            <View style={styles.actions}>
              <IconButton
                icon={() => <FontAwesome5 name="trash" size={16} color="red" />}
                size={16}
                style={styles.icon}
                disabled={timer.records.length <= 1}
                onPress={() => onDelete(data)}
              />
              <IconButton
                icon={() => <Ionicons name="add" size={16} />}
                size={16}
                onPress={handleAddRecord}
                style={styles.icon}
              />
            </View>
          )}
        </View>
      </View>

      {showPicker && <DateTimePicker mode="time" value={timeValue.toDate()} onChange={handleUpdateTime} is24Hour />}
    </View>
  )
}

export default TimerLineItem

const styles = ScaledSheet.create({
  container: {
  },
  row: {
    flexDirection: 'row',
    paddingVertical: '12@ms'
  },
  left: {
    width: '50%'
  },
  timeText: {
    fontSize: '14@ms',
    fontWeight: '500'
  },
  chip: {
    marginTop: '4@ms',
    borderRadius: '8@ms',
    backgroundColor: palette.main[500]
  },
  center: {
    width: '24@ms',
    alignItems: 'center'
  },
  dot: {
    width: '10@ms',
    height: '10@ms',
    borderRadius: '5@ms',
    backgroundColor: palette.main[500]
  },
  dotPaused: {
    backgroundColor: 'orange'
  },
  dotStopped: {
    backgroundColor: 'red'
  },
  line: {
    width: '2@ms',
    flex: 1,
    backgroundColor: palette.main[500]
  },
  right: {
    flex: 1,
    paddingLeft: '8@ms'
  },
  title: {
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: '4@ms'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16@ms',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: '4@ms'
  },
  icon: {
    backgroundColor: palette.grey[50],
    width: '24@ms',
    height: '24@ms'
  }
})
