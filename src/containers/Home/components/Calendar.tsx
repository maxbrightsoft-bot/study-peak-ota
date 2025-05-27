import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { Calendar as CalendarLib, DateData } from 'react-native-calendars'
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import useCalendar from '../hooks/useCalendar'
import moment from 'moment'
import { ScaledSheet } from 'react-native-size-matters'
import CreateNewScheduleConfirmDialog from './Dialog/CreateNewScheduleConfirmDialog'
import CreateNewScheduleDialog from './Dialog/CreateNewScheduleDialog'

type SelectedDateInfo = {
  startDate: string
  endDate: string
  currentDate: string
  isTotalMonth: boolean
}

type Props = {
  handleSelectDate: ({
    startDate,
    endDate,
    currentDate,
    isTotalMonth
  }: {
    startDate: string
    endDate: string
    currentDate: string
    isTotalMonth?: boolean
  }) => void
  getScheduleList: () => void
  getScheduleListForNoteEvent: () => void
  selectedDate?: SelectedDateInfo
  highlightedDays: number[]
  onScheduleCountChange: () => void
}

const Calendar = (calendarProps: Props) => {
  const {
    selectedDate,
    handleSelectDate,
    getScheduleList,
    getScheduleListForNoteEvent,
    highlightedDays,
    onScheduleCountChange
  } = calendarProps

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(selectedDate?.currentDate || moment().toISOString())

  const {
    t,
    isOpenDialog,
    selectedSchedule,
    handleCloseDialog,
    handleOpenDialog,
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handleCreateSchedule,
    handleSetScheduleRequest,
    scheduleRequest
  } = useCalendar({
    getScheduleList,
    getScheduleListForNoteEvent,
    onScheduleCountChange
  })

  useEffect(() => {
    if (selectedDate?.currentDate) {
      if (moment(selectedDate.currentDate).format('YYYY-MM') !== moment(currentCalendarMonth).format('YYYY-MM')) {
        setCurrentCalendarMonth(selectedDate.currentDate)
      }
    }
  }, [selectedDate?.currentDate])

  const changeMonth = (amount: number) => {
    const newMonth = moment(currentCalendarMonth).add(amount, 'month').toISOString()
    setCurrentCalendarMonth(newMonth)
  }

  const goToNextMonth = () => {
    const nextMonth = moment(selectedDate?.currentDate).clone().add(1, 'month').local()
    const startOfMonth = nextMonth.clone().startOf('M').startOf('day')
    const endOfMonth = nextMonth.clone().endOf('M').endOf('day')
    const now = moment().startOf('day')
    const current = now.isBetween(startOfMonth, endOfMonth) ? now : startOfMonth
    handleSelectDate({
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      currentDate: current.toISOString(),
      isTotalMonth: false
    })
    changeMonth(1)
  }

  const goToPreviousMonth = () => {
    const previousMonth = moment(selectedDate?.currentDate).clone().subtract(1, 'month').local()
    const startOfMonth = previousMonth.clone().startOf('M').startOf('day')
    const endOfMonth = previousMonth.clone().endOf('M').endOf('day')
    const now = moment().startOf('day')
    const current = now.isBetween(startOfMonth, endOfMonth) ? now : startOfMonth
    handleSelectDate({
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      currentDate: current.toISOString(),
      isTotalMonth: false
    })
    changeMonth(-1)
  }

  const onDayPress = useCallback(
    (day: DateData) => {
      const dateMoment = moment(day.dateString)

      handleSelectDate({
        ...(selectedDate ?? {
          startDate: moment().startOf('M').startOf('day').toISOString(),
          endDate: moment().endOf('M').endOf('day').toISOString()
        }),
        currentDate: dateMoment.startOf('day').toISOString()
      })
    },
    [handleSelectDate]
  )

  const onVisibleMonthsChange = useCallback(
    (months: DateData[]) => {
      if (months.length > 0 && months[0].dateString) {
        const newMonthMoment = moment(months[0].dateString)
        if (newMonthMoment.format('YYYY-MM') !== moment(currentCalendarMonth).format('YYYY-MM')) {
          setCurrentCalendarMonth(newMonthMoment.toISOString())
        }
      }
    },
    [currentCalendarMonth]
  )

  const marked = useMemo(() => {
    const markedDates: { [key: string]: MarkingProps } = {}
    const monthStr = moment(currentCalendarMonth).format('YYYY-MM')

    highlightedDays.forEach((dayNumber) => {
      const dateStr = `${monthStr}-${String(dayNumber).padStart(2, '0')}`
      if (moment(dateStr, 'YYYY-MM-DD').isValid() && moment(dateStr).format('YYYY-MM') === monthStr) {
        markedDates[dateStr] = { marked: true, dotColor: palette.main[500] }
      }
    })

    if (selectedDate?.currentDate) {
      const selectedDateStr = moment(selectedDate.currentDate).format('YYYY-MM-DD')
      if (moment(selectedDate.currentDate).format('YYYY-MM') === monthStr) {
        markedDates[selectedDateStr] = {
          ...markedDates[selectedDateStr],
          selected: true,
          selectedColor: 'transparent',
          selectedTextColor: palette.grey[900],
          customStyles: {
            container: {
              borderColor: palette.main[500],
              borderWidth: 1,
              borderRadius: 6,
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center'
            },
            text: {
              color: palette.grey[900],
              fontWeight: 'bold'
            }
          }
        }
      }
    }
    return markedDates
  }, [selectedDate?.currentDate, highlightedDays, currentCalendarMonth])

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Button
          mode="outlined"
          style={styles.newScheduleButton}
          labelStyle={styles.newScheduleButtonLabel}
          contentStyle={styles.newScheduleButtonContent}
          onPress={() => handleOpenDialog()}
        >
          <View style={{ flexDirection: 'row' }}>
            <Ionicons name="add-circle" size={20} color={palette.main[500]} />
            <Text style={styles.newScheduleButtonText}>새 스케줄</Text>
          </View>
        </Button>

        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={20} color={palette.grey[700]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateDisplayButton}>
            <Text style={styles.dateDisplayText}>{moment(selectedDate?.currentDate).format('MM월 DD일')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={20} color={palette.grey[700]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarWrapper}>
        <CalendarLib
          key={currentCalendarMonth}
          current={currentCalendarMonth}
          onDayPress={onDayPress}
          onMonthChange={onVisibleMonthsChange}
          markedDates={marked}
          markingType={'custom'}
          theme={calendarTheme}
          hideExtraDays={false}
          renderHeader={false}
          hideArrows={true}
          hideDayNames={true}
          dayComponent={({ date, state, marking }: { date?: DateData; state?: string; marking?: MarkingProps }) => {
            if (!date) return <View style={styles.dayContainer} />

            const dateMoment = moment(date.dateString)
            const isWeekend = dateMoment.day() === 0 || dateMoment.day() === 6
            const isOutsideMonth =
              state === 'disabled' || dateMoment.format('YYYY-MM') !== moment(currentCalendarMonth).format('YYYY-MM')

            const dayTextStyle: any = [
              styles.dayText,
              isOutsideMonth && styles.outsideMonthText,
              isWeekend && !isOutsideMonth && styles.weekendText,
              marking?.selected && styles.selectedDayText
            ]

            const containerStyle = [styles.dayContainer, marking?.selected ? marking.customStyles?.container : {}]

            return (
              <TouchableOpacity onPress={() => onDayPress(date)} disabled={isOutsideMonth} style={containerStyle}>
                <Text style={dayTextStyle}>{date.day}</Text>
                {marking?.marked && !isOutsideMonth && <View style={styles.dotStyle} />}
              </TouchableOpacity>
            )
          }}
        />
      </View>
      <CreateNewScheduleDialog
        open={isOpenDialog}
        onClose={() => {
          handleCloseDialog()
          handleSetScheduleRequest()
        }}
        t={t}
        onSubmit={(values) => {
          handleOpenConfirmDialog(values)
          handleCloseDialog()
        }}
        schedule={selectedSchedule}
      />
      <CreateNewScheduleConfirmDialog
        open={isOpenConfirmDialog}
        onClose={() => {
          handleCloseConfirmDialog()
          handleOpenDialog()
        }}
        t={t}
        newSchedule={scheduleRequest}
        onSubmit={handleCreateSchedule}
      />
    </View>
  )
}

const calendarTheme = {
  backgroundColor: 'white',
  calendarBackground: 'white',
  textSectionTitleColor: palette.grey[600],
  selectedDayBackgroundColor: palette.main[500],
  selectedDayTextColor: '#ffffff',
  todayTextColor: palette.main[500],
  dayTextColor: palette.grey[900],
  textDisabledColor: palette.grey[400],
  dotColor: palette.main[500],
  selectedDotColor: '#ffffff',
  monthTextColor: palette.grey[900],
  indicatorColor: palette.main[500],
  textDayFontWeight: '400',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '500',
  textDayFontSize: 14,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 12,
  'stylesheet.calendar.header': { header: { height: 0, opacity: 0 } }
}

const styles = ScaledSheet.create({
  container: {},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16@ms'
  },
  newScheduleButton: {
    borderRadius: 8,
    borderColor: palette.main[500],
    borderWidth: 1,
    paddingHorizontal: '0@ms'
  },
  newScheduleButtonContent: {
    paddingVertical: '6@ms',
    paddingHorizontal: '10@ms',
    height: 'auto'
  },
  newScheduleButtonLabel: {
    marginVertical: 0,
    marginHorizontal: 0
  },
  newScheduleButtonText: {
    ...TYPO.button2,
    color: palette.main[500],
    marginLeft: '4@ms'
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  navButton: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: palette.grey[300],
    padding: '6@ms',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateDisplayButton: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: palette.grey[300],
    paddingVertical: '7@ms',
    paddingHorizontal: '12@ms',
    minWidth: '80@ms',
    alignItems: 'center'
  },
  dateDisplayText: {
    ...TYPO.body1,
    fontWeight: '600',
    color: palette.grey[900]
  },
  calendarWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: palette.grey[300],
    overflow: 'hidden'
  },
  dayContainer: {
    width: '32@ms',
    height: '32@ms',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6
  },
  dayText: {
    fontSize: 14,
    color: palette.grey[900]
  },
  selectedDayText: {
    fontWeight: 'bold',
    color: palette.grey[900]
  },
  weekendText: {
    color: 'red'
  },
  outsideMonthText: {
    color: palette.grey[400]
  },
  dotStyle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.main[500],
    position: 'absolute',
    bottom: '2@ms'
  }
})

export default Calendar
