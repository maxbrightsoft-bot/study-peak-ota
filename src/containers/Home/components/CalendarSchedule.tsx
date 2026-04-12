import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import useSchedule from '../hooks/useSchedule'
import NoteEvent from './NoteEvent'
import Calendar from './Calendar'
import { ScaledSheet } from 'react-native-size-matters'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import CreateNewScheduleDialog from './Dialog/CreateNewScheduleDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'

type Props = {
  isVisible: boolean
  onClose: () => void
}

const CalendarSchedule = ({ isVisible, onClose }: Props) => {
  const {
    t,
    schedules,
    selectedDate,
    openTooltipList,
    handleOpenTooltip,
    handleCloseTooltip,
    selectedSchedule,
    highlightedDays,
    getScheduleList,
    getScheduleListForNoteEvent,
    handleCheckInLesson,
    isOpenDialog: isOpenScheduleDialog,
    handleCloseDialog: handleCloseScheduleDialog,
    handleOpenDialog: handleOpenScheduleDialog,
    handleSelectDate,
    isOpenDialog,
    handleOpenDialog,
    handleCloseDialog,
    handleCreateSchedule,
    handleGetScheduleCount,
    isOpenConfirmDeleteDialog,
    handleCloseConfirmDeleteDialog,
    handleOpenConfirmDeleteDialog,
    handleDeleteSchedule,
    handleUpdateScheduleStatus
  } = useSchedule()

  return (
    <SlideDrawerRoot visible={isVisible}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>{t('schedule_detail')}</Text>
        </View>
        <View></View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 25, backgroundColor: palette.grey[50] }}>
        <Calendar
          highlightedDays={highlightedDays}
          selectedDate={selectedDate}
          handleSelectDate={handleSelectDate}
          getScheduleList={getScheduleList}
          getScheduleListForNoteEvent={getScheduleListForNoteEvent}
          onScheduleCountChange={handleGetScheduleCount}
        />
        <NoteEvent
          t={t}
          schedules={schedules}
          selectedDate={selectedDate}
          handleCreateSchedule={handleCreateSchedule}
          openTooltipList={openTooltipList}
          handleOpenTooltip={handleOpenTooltip}
          handleCloseTooltip={handleCloseTooltip}
          selectedSchedule={selectedSchedule}
          handleCheckInLesson={handleCheckInLesson}
          isOpenScheduleDialog={isOpenScheduleDialog}
          handleOpenScheduleDialog={handleOpenScheduleDialog}
          isOpenConfirmDeleteDialog={isOpenConfirmDeleteDialog}
          handleCloseScheduleDialog={handleCloseScheduleDialog}
          handleCloseConfirmDeleteDialog={handleCloseConfirmDeleteDialog}
          handleOpenConfirmDeleteDialog={handleOpenConfirmDeleteDialog}
          handleDeleteSchedule={handleDeleteSchedule}
          handleUpdateScheduleStatus={handleUpdateScheduleStatus}
        />
        <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <Button
            mode="contained"
            style={styles.newScheduleButton}
            labelStyle={styles.newScheduleButtonLabel}
            contentStyle={styles.newScheduleButtonContent}
            onPress={() => handleOpenDialog()}
          >
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.newScheduleButtonText}>{t('add_new_schedule')}</Text>
            </View>
          </Button>
        </View>
      </View>
      <CreateNewScheduleDialog
        open={isOpenDialog}
        onClose={() => {
          handleCloseDialog()
        }}
        t={t}
        onSubmit={(values) => {
          handleCreateSchedule(values)
          handleCloseDialog()
        }}
        schedule={selectedSchedule}
      />
      <ConfirmDialog
        open={!!selectedSchedule && isOpenConfirmDeleteDialog}
        toggle={handleCloseConfirmDeleteDialog}
        text={t('are_you_sure_you_want_to_delete_the_schedule', {
          name: selectedSchedule?.title
        })}
        confirmText={selectedSchedule?.title}
        onConfirm={handleDeleteSchedule}
        isDelete
      />
    </SlideDrawerRoot>
  )
}

export default CalendarSchedule

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms'
  },
  newScheduleButton: {
    borderRadius: 12,
    backgroundColor: palette.main[600],
    paddingHorizontal: '14@ms',
    paddingVertical: '16@ms'
  },
  newScheduleButtonContent: {
    height: 'auto'
  },
  newScheduleButtonLabel: {
    marginVertical: 0,
    marginHorizontal: 0
  },
  newScheduleButtonText: {
    ...TYPO.button2,
    color: '#fff',
    marginLeft: '4@ms'
  }
})
