import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import { Calendar as CalendarLib, DateData } from 'react-native-calendars'
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import useCalendar from '../hooks/useCalendar'
import moment from 'moment'
import { ScaledSheet } from 'react-native-size-matters'
import { SelectedDateInfo } from '../configs/type'

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
  loading?: boolean
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

  const {
    goToNextMonth,
    goToPreviousMonth,
    marked,
    onDayPress,
    onVisibleMonthsChange,
    currentCalendarMonth,
  } = useCalendar({
    selectedDate,
    handleSelectDate,
    highlightedDays,
    getScheduleList,
    getScheduleListForNoteEvent,
    onScheduleCountChange
  })

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={24} color={palette.grey[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateDisplayButton}>
            <Text style={styles.dateDisplayText}>{moment(selectedDate?.currentDate).format('MM월')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color={palette.grey[400]} />
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
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    justifyContent: "space-between",
    gap: '8@ms'
  },
  navButton: {
    padding: '6@ms',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateDisplayButton: {
    alignItems: 'center'
  },
  dateDisplayText: {
    ...TYPO.body1,
    fontWeight: 600,
    color: "#222222"
  },
  calendarWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: palette.grey[100],
    overflow: 'hidden'
  },
  dayContainer: {
    height: '32@ms',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6
  },
  dayText: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.grey[900]
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
  weekendText: {
    color: '#EC4A67'
  },
  outsideMonthText: {
    color: palette.grey[400]
  },
  dotStyle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.main[600],
    position: 'absolute',
    bottom: '2@ms'
  }
})

export default Calendar
