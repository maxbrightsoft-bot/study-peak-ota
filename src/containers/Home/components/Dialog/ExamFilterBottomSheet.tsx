import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import BottomSheet from '@/components/ModalBase/BottomSheet'
import { Calendar } from 'react-native-calendars'
import moment from 'moment'
import { utcToLocalTime } from '@/utils/helpers'
import useExamFilterBottomSheet from '../../hooks/useExamFilterBottomSheet'

export interface ExamFilterCriteria {
  courseId: number | string
  subjectName: string
  period: 'all' | '7days' | '30days' | '90days' | 'custom'
  startDate?: string | null // UTC ISO string e.g. "2026-10-14T17:00:00.000Z"
  endDate?: string | null   // UTC ISO string e.g. "2026-10-20T16:59:59.999Z"
  customStartDate?: string | null // Local YYYY-MM-DD
  customEndDate?: string | null   // Local YYYY-MM-DD
  teacherName: string
}

export const DEFAULT_EXAM_FILTER: ExamFilterCriteria = {
  courseId: 'all',
  subjectName: 'all',
  period: 'all',
  startDate: null,
  endDate: null,
  customStartDate: null,
  customEndDate: null,
  teacherName: 'all'
}

interface Props {
  isVisible: boolean
  onClose: () => void
  filter: ExamFilterCriteria
  onApply: (filter: ExamFilterCriteria) => void
  courseOptions: { label: string; value: number | string }[]
  subjectOptions: { label: string; value: string }[]
  teacherOptions: { label: string; value: string }[]
  t: any
}

export const computeUtcDates = (
  period: ExamFilterCriteria['period'],
  customStart?: string | null,
  customEnd?: string | null
): { startDate: string | null; endDate: string | null } => {
  if (period === 'all') {
    return { startDate: null, endDate: null }
  }

  if (period === '7days') {
    return {
      startDate: moment().subtract(7, 'days').startOf('day').utc().toISOString(),
      endDate: moment().endOf('day').utc().toISOString()
    }
  }

  if (period === '30days') {
    return {
      startDate: moment().subtract(30, 'days').startOf('day').utc().toISOString(),
      endDate: moment().endOf('day').utc().toISOString()
    }
  }

  if (period === '90days') {
    return {
      startDate: moment().subtract(90, 'days').startOf('day').utc().toISOString(),
      endDate: moment().endOf('day').utc().toISOString()
    }
  }

  if (period === 'custom' && customStart) {
    const end = customEnd || customStart
    return {
      startDate: moment(customStart).startOf('day').utc().toISOString(),
      endDate: moment(end).endOf('day').utc().toISOString()
    }
  }

  return { startDate: null, endDate: null }
}

const ExamFilterBottomSheet = ({
  isVisible,
  onClose,
  filter,
  onApply,
  courseOptions,
  subjectOptions,
  teacherOptions,
  t
}: Props) => {
  const {
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
  } = useExamFilterBottomSheet({
    isVisible,
    filter,
    onApply,
    onClose,
    t
  })

  const titleChildren = (
    <View style={styles.titleRow}>
      <Text style={styles.titleText}>{t('filter_title')}</Text>
      {draftSelectedCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{draftSelectedCount}</Text>
        </View>
      )}
    </View>
  )

  const closeChildren = (
    <View style={styles.headerRight}>
      <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
        <Ionicons name="refresh-outline" size={14} color={palette.grey[600]} />
        <Text style={styles.resetText}>{t('filter_reset')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
        <Ionicons name="close" size={20} color={palette.grey[700]} />
      </TouchableOpacity>
    </View>
  )

  if (!isVisible) return null

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        titleChildren={titleChildren}
        closeChildren={closeChildren}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Course / Class */}
          {courseOptions.length > 1 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="school-outline" size={16} color={palette.main[600]} />
                <Text style={styles.sectionTitle}>{t('filter_class')}</Text>
              </View>
              <View style={styles.chipGrid}>
                {courseOptions.map((opt) => {
                  const isActive = draft.courseId === opt.value
                  return (
                    <TouchableOpacity
                      key={`course_${opt.value}`}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setDraft((prev) => ({ ...prev, courseId: opt.value }))}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[styles.chipText, isActive && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          {/* 2. Subject */}
          {subjectOptions.length > 2 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={16} color={palette.main[600]} />
                <Text style={styles.sectionTitle}>{t('filter_subject')}</Text>
              </View>
              <View style={styles.chipGrid}>
                {subjectOptions.map((opt) => {
                  const isActive = draft.subjectName === opt.value
                  return (
                    <TouchableOpacity
                      key={`subj_${opt.value}`}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setDraft((prev) => ({ ...prev, subjectName: opt.value }))}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[styles.chipText, isActive && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          {/* 3. Period */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={16} color={palette.main[600]} />
              <Text style={styles.sectionTitle}>{t('filter_period')}</Text>
            </View>
            <View style={styles.chipGrid}>
              {periodOptions.map((opt) => {
                const isActive = draft.period === opt.value
                let displayText = opt.label
                if (opt.value === 'custom' && (draft.startDate || draft.customStartDate)) {
                  const s = utcToLocalTime(
                    draft.startDate || draft.customStartDate || undefined,
                    'DD/MM'
                  )
                  const hasEnd = Boolean(draft.endDate || draft.customEndDate)
                  const e = hasEnd
                    ? utcToLocalTime(draft.endDate || draft.customEndDate || undefined, 'DD/MM')
                    : ''

                  if (s && e && s !== e) {
                    displayText = `${s} ~ ${e}`
                  } else if (s) {
                    displayText = s
                  }
                }

                return (
                  <TouchableOpacity
                    key={`period_${opt.value}`}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => {
                      if (opt.value === 'custom') {
                        setCalStart(draft.customStartDate || null)
                        setCalEnd(draft.customEndDate || null)
                        setShowCalendarModal(true)
                      } else {
                        const { startDate, endDate } = computeUtcDates(opt.value)
                        setDraft((prev) => ({
                          ...prev,
                          period: opt.value,
                          startDate,
                          endDate,
                          customStartDate: null,
                          customEndDate: null
                        }))
                      }
                    }}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[styles.chipText, isActive && styles.chipTextActive]}
                      numberOfLines={1}
                    >
                      {displayText}
                    </Text>
                    {opt.value === 'custom' && (
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={isActive ? palette.main[600] : palette.grey[500]}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* 4. Teacher (if multiple teachers) */}
          {teacherOptions.length > 2 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={16} color={palette.main[600]} />
                <Text style={styles.sectionTitle}>{t('filter_teacher')}</Text>
              </View>
              <View style={styles.chipGrid}>
                {teacherOptions.map((opt) => {
                  const isActive = draft.teacherName === opt.value
                  return (
                    <TouchableOpacity
                      key={`teacher_${opt.value}`}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setDraft((prev) => ({ ...prev, teacherName: opt.value }))}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[styles.chipText, isActive && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>
              {t('filter_apply')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Custom Date Range Calendar Modal */}
      <Modal visible={showCalendarModal} transparent animationType="fade">
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalBox}>
            <View style={styles.calendarHeaderRow}>
              <Text style={styles.calendarModalTitle}>{t('filter_custom')}</Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={palette.grey[600]} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Calendar
                markingType={'period'}
                markedDates={getMarkedDates()}
                onDayPress={onDayPress}
                theme={{
                  todayTextColor: palette.main[600],
                  arrowColor: palette.main[600]
                }}
              />
            </View>

            <View style={styles.calendarActions}>
              <TouchableOpacity
                onPress={() => setShowCalendarModal(false)}
                style={styles.calendarCancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyCalendar}
                style={styles.calendarApplyBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.calendarApplyText}>{t('filter_apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default ExamFilterBottomSheet

const styles = ScaledSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  titleText: {
    fontSize: '17@ms',
    fontWeight: '700',
    color: '#111'
  },
  badge: {
    backgroundColor: palette.main[600],
    borderRadius: '10@ms',
    paddingHorizontal: '7@ms',
    paddingVertical: '2@ms'
  },
  badgeText: {
    color: '#FFF',
    fontSize: '11@ms',
    fontWeight: '700'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms'
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@ms',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms'
  },
  resetText: {
    fontSize: '13@ms',
    color: palette.grey[700],
    fontWeight: '500'
  },
  closeBtn: {
    padding: '4@ms'
  },
  scroll: {
    maxHeight: '380@ms'
  },
  scrollContent: {
    paddingHorizontal: '20@ms',
    paddingTop: '6@ms',
    paddingBottom: '16@ms',
    gap: '20@ms'
  },
  section: {
    gap: '10@ms'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },
  sectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8@ms'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '14@ms',
    paddingVertical: '7@ms',
    borderRadius: '20@ms',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF'
  },
  chipActive: {
    borderColor: palette.main[600],
    backgroundColor: '#F5F3FF'
  },
  chipText: {
    fontSize: '13@ms',
    color: palette.grey[700],
    fontWeight: '500'
  },
  chipTextActive: {
    color: palette.main[600],
    fontWeight: '700'
  },
  footer: {
    paddingHorizontal: '20@ms',
    paddingTop: '12@ms',
    borderTopWidth: '1@ms',
    borderTopColor: '#F3F4F6'
  },
  applyBtn: {
    backgroundColor: palette.main[600],
    paddingVertical: '13@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: '15@ms',
    fontWeight: '700'
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20@ms'
  },
  calendarModalBox: {
    backgroundColor: 'white',
    padding: '20@ms',
    borderRadius: '16@ms',
    width: '100%',
    maxWidth: '360@ms'
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12@ms'
  },
  calendarModalTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#111827'
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: '10@ms',
    marginTop: '12@ms'
  },
  calendarCancelBtn: {
    paddingVertical: '8@ms',
    paddingHorizontal: '14@ms',
    borderRadius: '8@ms'
  },
  calendarCancelText: {
    color: palette.grey[600],
    fontWeight: '500',
    fontSize: '14@ms'
  },
  calendarApplyBtn: {
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    backgroundColor: palette.main[600],
    borderRadius: '8@ms'
  },
  calendarApplyText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: '14@ms'
  }
})
