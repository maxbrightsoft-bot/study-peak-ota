import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NoteSearchQuery } from '@/utils/types'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Calendar } from 'react-native-calendars'
import ArrowRightIcon from '@/assets/iconJSX/arrowRight'
import { ScaledSheet } from 'react-native-size-matters'

interface FilterBottomSheetProps {
  isVisible: boolean
  onClose: () => void
  onApply: (filter: Partial<NoteSearchQuery>) => void
  initialFilter: NoteSearchQuery
  subjectOptions: { label: string, value: string | number, id?: number }[]
  categoryOptions: { label: string, value: string | number, id?: number, children?: { label: string, value: string | number, id?: number }[] }[]
}

const EXAM_TYPE_MAPPINGS = [
  { value: 1, labelKey: 'filter_csat' },
  { value: 2, labelKey: 'filter_official_mock' },
  { value: 3, labelKey: 'filter_private_mock' },
  { value: 4, labelKey: 'filter_commercial' },
  { value: 5, labelKey: 'filter_school_past' }
]

const PERIOD_KEYS = [
  { labelKey: 'filter_all', value: 'all' },
  { labelKey: 'filter_last_7_days', value: '7days' },
  { labelKey: 'filter_last_30_days', value: '30days' },
  { labelKey: 'filter_custom', value: 'custom' }
]

export default function FilterBottomSheet({ isVisible, onClose, onApply, initialFilter, subjectOptions, categoryOptions }: FilterBottomSheetProps) {
  const { t } = useTranslation()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedExamTypes, setSelectedExamTypes] = useState<number[]>([])
  const [period, setPeriod] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [showCustomDateModal, setShowCustomDateModal] = useState<boolean>(false)
  const [hasIncorrectOrImage, setHasIncorrectOrImage] = useState<boolean>(false)

  useEffect(() => {
    if (isVisible) {
      setSelectedSubjects(initialFilter.subjectNames || [])
      setSelectedCategories(initialFilter.categoryNames || [])
      setSelectedExamTypes(initialFilter.examTypes || [])
      setHasIncorrectOrImage(initialFilter.hasIncorrectOrImage || false)

      if (initialFilter.startDate) {
        setCustomStartDate(new Date(initialFilter.startDate))
      } else {
        setCustomStartDate(null)
      }
      if (initialFilter.endDate) {
        setCustomEndDate(new Date(initialFilter.endDate))
      } else {
        setCustomEndDate(null)
      }
    }
  }, [isVisible, initialFilter])

  const handleApply = () => {
    const formatStr = 'YYYY-MM-DD'
    const finalStartDate = customStartDate ? dayjs(customStartDate).format(formatStr) : undefined
    const finalEndDate = customEndDate ? dayjs(customEndDate).format(formatStr) : undefined

    onApply({
      subjectNames: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      categoryNames: selectedCategories.length > 0 ? selectedCategories : undefined,
      examTypes: selectedExamTypes.length > 0 ? selectedExamTypes : undefined,
      startDate: finalStartDate,
      endDate: finalEndDate,
      hasIncorrectOrImage: hasIncorrectOrImage || undefined
    })
    onClose()
  }

  const handleReset = () => {
    setSelectedSubjects([])
    setSelectedCategories([])
    setSelectedExamTypes([])
    setPeriod('all')
    setCustomStartDate(null)
    setCustomEndDate(null)
    setHasIncorrectOrImage(false)
  }

  const toggleSelection = <T extends string | number>(list: T[], setList: (l: T[]) => void, item: T) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const toggleSubject = (val: string) => {
    if (val === 'all') setSelectedSubjects([])
    else toggleSelection(selectedSubjects, setSelectedSubjects, val)
  }

  const toggleCategory = (val: string) => {
    if (selectedCategories.includes(val)) {
      // Unselecting
      const parentOpt = categoryOptions.find(opt => opt.value === val)
      if (parentOpt && parentOpt.children) {
        const childValues = parentOpt.children.map(c => c.value as string)
        setSelectedCategories(selectedCategories.filter(c => c !== val && !childValues.includes(c)))
      } else {
        setSelectedCategories(selectedCategories.filter(c => c !== val))
      }
    } else {
      // Selecting
      setSelectedCategories([...selectedCategories, val])
    }
  }

  const onDayPress = (day: any) => {
    const selectedDate = new Date(day.dateString)
    
    if (!customStartDate || (customStartDate && customEndDate)) {
      setCustomStartDate(selectedDate)
      setCustomEndDate(null)
    } else if (customStartDate && !customEndDate) {
      if (dayjs(selectedDate).isBefore(dayjs(customStartDate), 'day')) {
        setCustomStartDate(selectedDate)
      } else {
        setCustomEndDate(selectedDate)
      }
    }
  }

  const getMarkedDates = () => {
    const marked: any = {}
    
    if (customStartDate) {
      const startStr = dayjs(customStartDate).format('YYYY-MM-DD')
      marked[startStr] = { startingDay: true, color: '#7C3AED', textColor: 'white' }
      
      if (customEndDate) {
        const endStr = dayjs(customEndDate).format('YYYY-MM-DD')
        marked[endStr] = { endingDay: true, color: '#7C3AED', textColor: 'white' }
        
        let current = dayjs(startStr).add(1, 'day')
        while (current.isBefore(dayjs(endStr), 'day')) {
          marked[current.format('YYYY-MM-DD')] = { color: '#EDE9FE', textColor: '#7C3AED' }
          current = current.add(1, 'day')
        }
      }
    }
    return marked
  }

  const totalSelected = selectedSubjects.length + selectedCategories.length + selectedExamTypes.length + (customStartDate || customEndDate ? 1 : 0) + (hasIncorrectOrImage ? 1 : 0)

  if (!isVisible) return null

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 50 }} />
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{t('filter_title')}</Text>
            {totalSelected > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalSelected}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>{t('filter_reset')}</Text>
          </TouchableOpacity>
        </View>

        {/* Body */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 1. Subject */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.numberIcon}><Text style={styles.numberText}>1</Text></View>
              <Text style={styles.sectionTitle}>{t('filter_subject')}</Text>
            </View>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, selectedSubjects.length === 0 && styles.chipActive]}
                onPress={() => toggleSubject('all')}
              >
                <Text style={[styles.chipText, selectedSubjects.length === 0 && styles.chipTextActive]}>{t('filter_all')}</Text>
              </TouchableOpacity>
              {subjectOptions.map(opt => {
                const isActive = selectedSubjects.includes(opt.label)
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleSubject(opt.label)}
                  >
                    <View style={[styles.dot, isActive ? { backgroundColor: '#7C3AED' } : { backgroundColor: '#D1D5DB' }]} />
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* 2. Category */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.numberIcon}><Text style={styles.numberText}>2</Text></View>
              <Text style={styles.sectionTitle}>{t('filter_category')}</Text>
              {selectedCategories.length > 0 && <Text style={styles.selectedCount}>{t('filter_n_selected', { n: selectedCategories.length })}</Text>}
            </View>
            <View style={styles.chipRow}>
              {categoryOptions.map(opt => {
                const isActive = selectedCategories.includes(opt.value as string)
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleCategory(opt.value as string)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Child Categories */}
            {categoryOptions.filter(opt => selectedCategories.includes(opt.value as string) && opt.children && opt.children.length > 0).map(parentOpt => (
              <View key={`child-box-${parentOpt.value}`} style={styles.childCategoryBox}>
                <Text style={styles.childCategoryLabel}>{t('filter_subcategory', { parent: parentOpt.label })}</Text>
                <View style={styles.chipRow}>
                  {parentOpt.children!.map(child => {
                    const isChildActive = selectedCategories.includes(child.value as string)
                    return (
                      <TouchableOpacity
                        key={child.value}
                        style={[styles.chip, isChildActive && styles.chipActive]}
                        onPress={() => toggleCategory(child.value as string)}
                      >
                        <Text style={[styles.chipText, isChildActive && styles.chipTextActive]}>{child.label}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* 3. Exam Type */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.numberIcon}><Text style={styles.numberText}>3</Text></View>
              <Text style={styles.sectionTitle}>{t('filter_exam_type')}</Text>
              {selectedExamTypes.length > 0 && <Text style={styles.selectedCount}>{t('filter_n_selected', { n: selectedExamTypes.length })}</Text>}
            </View>
            <View style={styles.chipRow}>
              {EXAM_TYPE_MAPPINGS.map(item => {
                const label = t(item.labelKey)
                const isActive = selectedExamTypes.includes(item.value)
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleSelection(selectedExamTypes, setSelectedExamTypes, item.value)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* 4. Period */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.numberIcon}><Text style={styles.numberText}>4</Text></View>
              <Text style={styles.sectionTitle}>{t('filter_period')}</Text>
            </View>
            <View style={styles.chipRow}>
              {PERIOD_KEYS.map(opt => {
                const isActive = period === opt.value
                let displayText = t(opt.labelKey)
                if (opt.value === 'custom' && customStartDate) {
                  const startStr = dayjs(customStartDate).format('DD/MM/YYYY')
                  if (customEndDate) {
                    const endStr = dayjs(customEndDate).format('DD/MM/YYYY')
                    displayText = `${startStr} - ${endStr}`
                  } else {
                    displayText = startStr
                  }
                }
                
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => {
                      if (opt.value === 'custom') {
                        setShowCustomDateModal(true)
                      } else {
                        setPeriod(opt.value)
                        setCustomStartDate(null)
                        setCustomEndDate(null)
                      }
                    }}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{displayText}</Text>
                    {opt.value === 'custom' && (
                      <ArrowRightIcon color={isActive ? '#7C3AED' : '#374151'} style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* 5. Additional Condition */}
          <View style={[styles.section, { borderBottomWidth: 0 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.numberIcon}><Text style={styles.numberText}>5</Text></View>
              <Text style={styles.sectionTitle}>{t('filter_additional')}</Text>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('filter_memo_or_image_only')}</Text>
              <Switch
                value={hasIncorrectOrImage}
                onValueChange={setHasIncorrectOrImage}
                trackColor={{ false: "#D1D5DB", true: "#7C3AED" }}
                thumbColor={"#FFFFFF"}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>{t('filter_cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>{t('filter_apply')}</Text>
            {totalSelected > 0 ? (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>{t('filter_n_applied', { n: totalSelected })}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal visible={showCustomDateModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, width: '90%' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#111827' }}>{t('filter_custom')}</Text>
            <View style={{ marginBottom: 24 }}>
              <Calendar
                markingType={'period'}
                markedDates={getMarkedDates()}
                onDayPress={onDayPress}
                maxDate={dayjs().format('YYYY-MM-DD')}
                theme={{
                  todayTextColor: '#7C3AED',
                  arrowColor: '#7C3AED',
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setShowCustomDateModal(false)} style={{ paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 }}>
                <Text style={{ color: '#6B7280', fontWeight: '500' }}>{t('filter_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (customStartDate || customEndDate) {
                  setPeriod('custom')
                }
                setShowCustomDateModal(false)
              }} style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#7C3AED', borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('filter_apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  )
}

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
  },
  titleText: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#7C3AED',
    width: '22@ms',
    height: '22@ms',
    borderRadius: '11@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: '12@ms',
    fontWeight: '700',
  },
  resetBtn: {
    width: '50@ms',
    alignItems: 'flex-end',
  },
  resetText: {
    color: '#7C3AED',
    fontSize: '14@ms',
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: '20@ms',
    paddingBottom: '20@ms',
  },
  section: {
    marginTop: '28@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#F3F4F6',
    paddingBottom: '28@ms',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  numberIcon: {
    width: '22@ms',
    height: '22@ms',
    borderRadius: '6@ms',
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '8@ms',
  },
  numberText: {
    color: '#7C3AED',
    fontSize: '12@ms',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  selectedCount: {
    fontSize: '13@ms',
    color: '#9CA3AF',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '10@ms',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '16@ms',
    paddingVertical: '10@ms',
    borderRadius: '20@ms',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  chipActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  dot: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    marginRight: '6@ms',
  },
  chipText: {
    fontSize: '14@ms',
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#7C3AED',
  },
  childCategoryBox: {
    marginTop: '16@ms',
    padding: '16@ms',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: '12@ms',
  },
  childCategoryLabel: {
    fontSize: '13@ms',
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: '12@ms',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: '14@ms',
    color: '#4B5563',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderTopWidth: '1@ms',
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: '16@ms',
    marginRight: '12@ms',
    borderRadius: '12@ms',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: '16@ms',
    color: '#4B5563',
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: '16@ms',
    borderRadius: '12@ms',
    borderWidth: '1@ms',
    borderColor: 'transparent',
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: '16@ms',
    color: '#FFF',
    fontWeight: '600',
  },
  badgeSmall: {
    marginLeft: '8@ms',
    backgroundColor: '#A78BFA',
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    borderRadius: '10@ms',
  },
  badgeSmallText: {
    color: '#FFF',
    fontSize: '12@ms',
    fontWeight: '600',
  }
})
