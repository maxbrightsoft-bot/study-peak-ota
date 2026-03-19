import { useCallback, useEffect, useMemo, useState } from "react";

import { ScheduleFormData, ScheduleResponse, SelectedDateInfo } from "../configs/type";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { palette } from "@/theme";
import moment from "moment";
import { DateData } from "react-native-calendars";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";

type Props = {
  getScheduleList: (loading: boolean) => void;
  getScheduleListForNoteEvent: () => void;
  onScheduleCountChange: () => void
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
  selectedDate?: SelectedDateInfo
  highlightedDays: number[]
};

const useCalendar = ({ selectedDate, highlightedDays, handleSelectDate }: Props) => {
  const { t } = useTranslation();
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(selectedDate?.currentDate || moment().toISOString())
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
              borderColor: palette.main[600],
              borderWidth: 1,
              borderRadius: 16,
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


  return {
    t,
    marked,
    goToNextMonth, 
    goToPreviousMonth,
    onDayPress,
    currentCalendarMonth,
    onVisibleMonthsChange,
  };
};

export default useCalendar;
