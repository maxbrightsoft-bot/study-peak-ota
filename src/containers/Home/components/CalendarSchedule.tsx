import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import useSchedule from '../hooks/useSchedule'
import NoteEvent from './NoteEvent'
import Calendar from './Calendar'

const CalendarSchedule = () => {
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
    loadingConfirmDialog,
    getScheduleListForNoteEvent,
    handleCheckInLesson,
    isOpenDialog: isOpenScheduleDialog,
    handleCloseDialog: handleCloseScheduleDialog,
    handleOpenDialog: handleOpenScheduleDialog,
    isOpenConfirmDialog,
    handleSelectDate,
    handleGetScheduleCount,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    isOpenConfirmDeleteDialog,
    handleCloseConfirmDeleteDialog,
    handleOpenConfirmDeleteDialog,
    handleSubmitSchedule,
    handleDeleteSchedule,
    scheduleRequest,
    handleChangeScheduleRequest,
    handleUpdateScheduleStatus,
  } = useSchedule()

  return (
    <View style={{ flex: 1,  paddingHorizontal: 24,  }}>
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Ionicons name="calendar-clear" size={20} color={palette.grey[700]} />
        <Text style={{ ...TYPO.heading1, color: palette.grey[700], marginLeft: 8 }}>나의 공부 스케줄</Text>
      </View>

      <Calendar
        highlightedDays={highlightedDays}
        selectedDate={selectedDate}
        handleSelectDate={handleSelectDate}
        getScheduleList={getScheduleList}
        loading={loadingConfirmDialog}
        getScheduleListForNoteEvent={getScheduleListForNoteEvent}
        onScheduleCountChange={handleGetScheduleCount}
      />
      {/* Schedule List */}
      <NoteEvent
        t={t}
        loading={loadingConfirmDialog}
        schedules={schedules}
        scheduleRequest={scheduleRequest}
        openTooltipList={openTooltipList}
        handleOpenTooltip={handleOpenTooltip}
        handleCloseTooltip={handleCloseTooltip}
        selectedSchedule={selectedSchedule}
        handleSetSchedule={handleChangeScheduleRequest}
        handleCheckInLesson={handleCheckInLesson}
        isOpenConfirmDialog={isOpenConfirmDialog}
        isOpenScheduleDialog={isOpenScheduleDialog}
        handleCloseConfirmDialog={handleCloseConfirmDialog}
        handleOpenConfirmDialog={handleOpenConfirmDialog}
        handleOpenScheduleDialog={handleOpenScheduleDialog}
        isOpenConfirmDeleteDialog={isOpenConfirmDeleteDialog}
        handleCloseScheduleDialog={handleCloseScheduleDialog}
        handleCloseConfirmDeleteDialog={handleCloseConfirmDeleteDialog}
        handleOpenConfirmDeleteDialog={handleOpenConfirmDeleteDialog}
        handleSubmitSchedule={handleSubmitSchedule}
        handleDeleteSchedule={handleDeleteSchedule}
        handleUpdateScheduleStatus={handleUpdateScheduleStatus}
      />
    </View>
  )
}

export default CalendarSchedule
