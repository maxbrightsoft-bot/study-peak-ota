import { useState, useEffect, useMemo } from 'react'
import moment from 'moment'
import { palette } from '@/theme'
import { ExamFilterCriteria, DEFAULT_EXAM_FILTER, computeUtcDates } from '../components/Dialog/ExamFilterBottomSheet'

export interface UseExamFilterBottomSheetParams {
  isVisible: boolean
  filter: ExamFilterCriteria
  onApply: (filter: ExamFilterCriteria) => void
  onClose: () => void
  t: any
}

export const useExamFilterBottomSheet = ({
  isVisible,
  filter,
  onApply,
  onClose,
  t
}: UseExamFilterBottomSheetParams) => {
  const [draft, setDraft] = useState<ExamFilterCriteria>(filter)
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false)
  const [calStart, setCalStart] = useState<string | null>(null)
  const [calEnd, setCalEnd] = useState<string | null>(null)

  useEffect(() => {
    if (isVisible) {
      setDraft(filter)
      setCalStart(filter.customStartDate || null)
      setCalEnd(filter.customEndDate || null)
    }
  }, [isVisible, filter])

  const periodOptions: { label: string; value: 'all' | '7days' | '30days' | '90days' | 'custom' }[] = useMemo(
    () => [
      { label: t('filter_all'), value: 'all' },
      { label: t('filter_last_7_days'), value: '7days' },
      { label: t('filter_last_30_days'), value: '30days' },
      { label: t('filter_last_90_days'), value: '90days' },
      { label: t('filter_custom'), value: 'custom' }
    ],
    [t]
  )

  const draftSelectedCount = useMemo(() => {
    let count = 0
    if (draft.courseId !== 'all') count++
    if (draft.subjectName !== 'all') count++
    if (draft.period !== 'all') count++
    if (draft.teacherName !== 'all') count++
    return count
  }, [draft])

  const handleReset = () => {
    setDraft(DEFAULT_EXAM_FILTER)
    setCalStart(null)
    setCalEnd(null)
  }

  const handleApply = () => {
    const { startDate, endDate } = computeUtcDates(
      draft.period,
      draft.customStartDate,
      draft.customEndDate
    )
    const finalFilter: ExamFilterCriteria = {
      ...draft,
      startDate,
      endDate
    }
    onApply(finalFilter)
    onClose()
  }

  const onDayPress = (day: any) => {
    const selectedDate = day.dateString
    if (!calStart || (calStart && calEnd)) {
      setCalStart(selectedDate)
      setCalEnd(null)
    } else if (calStart && !calEnd) {
      if (moment(selectedDate).isBefore(moment(calStart), 'day')) {
        setCalStart(selectedDate)
      } else {
        setCalEnd(selectedDate)
      }
    }
  }

  const getMarkedDates = () => {
    const marked: Record<string, any> = {}
    if (calStart) {
      marked[calStart] = { startingDay: true, color: palette.main[600], textColor: 'white' }

      if (calEnd) {
        marked[calEnd] = { endingDay: true, color: palette.main[600], textColor: 'white' }

        let current = moment(calStart).add(1, 'day')
        const endMom = moment(calEnd)
        while (current.isBefore(endMom, 'day')) {
          marked[current.format('YYYY-MM-DD')] = { color: '#EDE9FE', textColor: palette.main[600] }
          current = current.add(1, 'day')
        }
      }
    }
    return marked
  }

  const handleApplyCalendar = () => {
    if (calStart) {
      const { startDate, endDate } = computeUtcDates('custom', calStart, calEnd)
      setDraft((prev) => ({
        ...prev,
        period: 'custom',
        startDate,
        endDate,
        customStartDate: calStart,
        customEndDate: calEnd
      }))
    }
    setShowCalendarModal(false)
  }

  return {
    draft,
    setDraft,
    showCalendarModal,
    setShowCalendarModal,
    calStart,
    setCalStart,
    calEnd,
    setCalEnd,
    periodOptions,
    draftSelectedCount,
    handleReset,
    handleApply,
    onDayPress,
    getMarkedDates,
    handleApplyCalendar
  }
}

export default useExamFilterBottomSheet
