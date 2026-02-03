import React, { FC, useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { Button, Chip, ActivityIndicator } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTranslation } from 'react-i18next'
import { SubjectTimerResponse } from '../../../utils/types'
import TimeLineTabs from './TimeLineTabs'
import TimeLineTabPanel from './TimeLineTabPanel'
import TimerLineItem from './TimerLineItem'
import TimerLastDivider from './TimerLastDivider'
import { RecordItem } from '../../configs/types'
import useTimeUpdate from '@/layouts/hooks/useTimeUpdate'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'

export interface TimeUpdateDialogProps {
  open: boolean
  data?: SubjectTimerResponse
  seconds?: number
  activeTimerId?: number
  onClose: () => void
}

const TimeUpdateDialog: FC<TimeUpdateDialogProps> = ({ open, data, seconds, activeTimerId, onClose }) => {
  const { t } = useTranslation()
  const [showDatePicker, setShowDatePicker] = useState(false)

  const {
    isTimeError,
    value,
    selectedDate,
    loading,
    flatData,
    isEdited,
    totalTime,
    currentTimeLines,
    today,
    handleUpdateTimerRecords,
    handleChangeDate,
    handleAddNextTimer,
    handleClose,
    handleDeleteRecord,
    handleAddRecord,
    handleUpdateTime,
    handleAddTimer,
    handleRemoveTimer,
    handleChange,
    handleTimeErrors
  } = useTimeUpdate(open, onClose, data)

  return (
    <CommonDialog isVisible={open} onClose={handleClose} title={t('updating_timeline')}>
      <TimeLineTabs
        value={value}
        onChange={handleChange}
        data={data}
        activeTimerId={activeTimerId}
        seconds={seconds}
        selectedDate={selectedDate}
      />
      {!loading && (
        <TimeLineTabPanel value={value} index={0}>
          <View style={{ maxHeight: 400, width: '100%' }}>
          <FlatList
            data={flatData}
            keyExtractor={(item, index) => `${index}_${item.id}`}
            style={{ width: '100%', maxHeight: 400 }}
            scrollEnabled
            renderItem={({ item, index }) => (
              <TimerLineItem
                data={item}
                prevItem={flatData[index - 1]}
                nextItem={flatData[index + 1]}
                onUpdate={handleUpdateTime}
                onAdd={handleAddRecord}
                onDelete={handleDeleteRecord}
                onError={(val) => handleTimeErrors(index, val)}
                single
              />
            )}
          />
          </View>
        </TimeLineTabPanel>
      )}
      <TimeLineTabPanel value={value} index={1}>
        <View style={styles.dateRow}>
          <Button mode="outlined" style={{ borderRadius: 8 }} disabled={loading} onPress={() => setShowDatePicker(true)}>
            {selectedDate?.format(t('date_format'))}
          </Button>

          {!loading && !!currentTimeLines.length && <Chip style={{ backgroundColor: palette.main[500], borderRadius: 8 }} textStyle={{ color: "#FFF" }}>{totalTime}</Chip>}
        </View>

        {!loading && (
          <View style={{ maxHeight: 400, width: '100%' }}>
            <FlatList
              data={[...flatData, 'last']}
              keyExtractor={(_, i) => i.toString()}
              style={{ maxHeight: 400, width: '100%' }}
              renderItem={({ item, index }) =>
                item === 'last' ? (
                  <TimerLastDivider
                    lastItem={flatData[index - 1]}
                    selectedDate={selectedDate}
                    onAddTimer={handleAddNextTimer}
                  />
                ) : (
                  <TimerLineItem
                    data={item as RecordItem}
                    prevItem={flatData[index - 1]}
                    nextItem={flatData[index + 1]}
                    date={selectedDate}
                    onUpdate={handleUpdateTime}
                    onAdd={handleAddRecord}
                    onDelete={handleDeleteRecord}
                    onAddTimer={handleAddTimer}
                    onDeleteTimer={handleRemoveTimer}
                    onError={(val) => handleTimeErrors(index, val)}
                  />
                )
              }
            />
          </View>
        )}
      </TimeLineTabPanel>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      )}

      <View style={styles.actions}>
        <Button onPress={onClose}>{t('cancel')}</Button>
        <Button mode="contained" disabled={loading || !isEdited || isTimeError} onPress={handleUpdateTimerRecords}>
          {t('save')}
        </Button>
      </View>

      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={selectedDate?.toDate() ?? new Date()}
          maximumDate={today.toDate()}
          onChange={(_, date) => {
            setShowDatePicker(false)
            date && handleChangeDate(date)
          }}
        />
      )}
    </CommonDialog>
  )
}

export default TimeUpdateDialog

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 12
  },
  content: {
    paddingHorizontal: 0
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12
  },
  dateRow: {
    width: '100%',
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12
  }
})
