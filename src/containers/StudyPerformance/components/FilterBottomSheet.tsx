import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, SafeAreaView, StatusBar } from 'react-native'
import { NoteSearchQuery } from '@/utils/types'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

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
  { labelKey: 'filter_this_semester', value: 'semester' }
]

export default function FilterBottomSheet({ isVisible, onClose, onApply, initialFilter, subjectOptions, categoryOptions }: FilterBottomSheetProps) {
  const { t } = useTranslation()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedExamTypes, setSelectedExamTypes] = useState<number[]>([])
  const [period, setPeriod] = useState<string>('all')
  const [hasMemo, setHasMemo] = useState<boolean>(false)

  useEffect(() => {
    if (isVisible) {
      setSelectedSubjects(initialFilter.subjectNames || [])
      setSelectedCategories(initialFilter.categoryNames || [])
      setSelectedExamTypes(initialFilter.examTypes || [])
      setHasMemo(initialFilter.hasMemoOrImage || false)

      if (!initialFilter.startDate) {
        setPeriod('all')
      } else {
        const diff = dayjs().diff(dayjs(initialFilter.startDate), 'day')
        if (diff <= 7) setPeriod('7days')
        else if (diff <= 30) setPeriod('30days')
        else setPeriod('custom')
      }
    }
  }, [isVisible, initialFilter])

  const handleApply = () => {
    let startDate: string | undefined = undefined
    let endDate: string | undefined = undefined

    if (period === '7days') {
      startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
    } else if (period === '30days') {
      startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
    }

    onApply({
      subjectNames: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      categoryNames: selectedCategories.length > 0 ? selectedCategories : undefined,
      examTypes: selectedExamTypes.length > 0 ? selectedExamTypes : undefined,
      startDate,
      endDate,
      hasMemoOrImage: hasMemo || undefined
    })
    onClose()
  }

  const handleReset = () => {
    setSelectedSubjects([])
    setSelectedCategories([])
    setSelectedExamTypes([])
    setPeriod('all')
    setHasMemo(false)
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

  const totalSelected = selectedSubjects.length + selectedCategories.length + selectedExamTypes.length + (period !== 'all' ? 1 : 0) + (hasMemo ? 1 : 0)

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
            {totalSelected > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalSelected}</Text>
              </View>
            )}
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
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setPeriod(opt.value)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{t(opt.labelKey)}</Text>
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
                value={hasMemo}
                onValueChange={setHasMemo}
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
            {totalSelected > 0 && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>{t('filter_n_applied', { n: totalSelected })}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#7C3AED',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    width: 50,
    alignItems: 'flex-end',
  },
  resetText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginTop: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  numberIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  numberText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  selectedCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  chipActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#7C3AED',
  },
  childCategoryBox: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  childCategoryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  badgeSmall: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeSmallText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  }
})
