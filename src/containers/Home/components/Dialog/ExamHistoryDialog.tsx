import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { SectionList, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import useExamResultList from '../../hooks/useExamResultList'
import { utcToLocalTime } from '@/utils/helpers'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { OrderBy } from '@/utils/enums'
import ExamResult from '@/containers/ExamResult/views'
import SortIcon from '@/assets/iconJSX/sort'
import { CourseExamSession } from '../../configs/type'
import TextTooltip from '@/components/Tooltip/TextTooltip'
import SearchInput from '@/components/Input/SearchInput'
import ExamFilterBottomSheet, {
  ExamFilterCriteria,
  DEFAULT_EXAM_FILTER
} from './ExamFilterBottomSheet'
import _ from 'lodash'
import moment from 'moment'
import useAuthStore from '@/store/useAuthStore'

interface Props {
  open: boolean
  onClose: () => void
  t: any
}

type TabKey = 'all' | 'incomplete' | 'not_taken' | 'done'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'all' },
  { key: 'incomplete', label: 'incomplete' },
  { key: 'not_taken', label: 'not_taken' },
  { key: 'done', label: 'done' }
]

const STATUS_CONFIG: Record<string, { labelKey: string; color: string }> = {
  incomplete: { labelKey: 'incomplete_exam', color: '#FEAF06' },
  not_taken: { labelKey: 'not_joined_exam', color: '#DB4D4D' },
  done: { labelKey: 'completed_exam', color: '#3DC674' }
}

const ExamHistoryDialog = ({ t, onClose, open }: Props) => {
  const isParentMode = !!useAuthStore(state => state.parentViewMode?.isActive)
  const [search, setSearch] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [filterCriteria, setFilterCriteria] = useState<ExamFilterCriteria>(DEFAULT_EXAM_FILTER)
  const [openFilterSheet, setOpenFilterSheet] = useState<boolean>(false)
  const {
    listCourses,
    handleJoinExam,
    scrollViewRef,
    filter,
    handleSort,
    openResultDialog,
    selectedExam,
    handleOpenResultDialog,
    handleCloseResultDialog,
    handleLoadMore,
    hasMore,
    isFetchingMore,
    loadingExams
  } = useExamResultList({ onClose, open, filterCriteria, activeTab, search })

  useEffect(() => {
    if (!open) {
      setFilterCriteria(DEFAULT_EXAM_FILTER)
      setActiveTab('all')
      setSearch('')
      setOpenFilterSheet(false)
    }
  }, [open])

  const handleTabChange = (key: TabKey) => {
    if (activeTab !== key) {
      setActiveTab(key)
      setFilterCriteria(DEFAULT_EXAM_FILTER)
    }
  }

  const handleSearchChange = (text: string) => {
    setSearch(text)
  }

  const [knownCourses, setKnownCourses] = useState<{ id: number | string; name: string }[]>([])
  const [knownSubjects, setKnownSubjects] = useState<string[]>([])
  const [knownTeachers, setKnownTeachers] = useState<string[]>([])

  useEffect(() => {
    if (!listCourses || listCourses.length === 0) return

    setKnownCourses((prev) => {
      const existingIds = new Set(prev.map((c) => c.id))
      const toAdd = listCourses
        .filter((c: any) => !existingIds.has(c.id ?? c.name))
        .map((c: any) => ({ id: c.id ?? c.name, name: c.name }))
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev
    })

    setKnownSubjects((prev) => {
      const existing = new Set(prev)
      const toAdd: string[] = []
      listCourses.forEach((c: any) => {
        ;(c.examSessions || []).forEach((s: any) => {
          if (s.subjectName && s.subjectName.trim() && !existing.has(s.subjectName.trim())) {
            existing.add(s.subjectName.trim())
            toAdd.push(s.subjectName.trim())
          }
        })
      })
      return toAdd.length > 0 ? [...prev, ...toAdd].sort() : prev
    })

    setKnownTeachers((prev) => {
      const existing = new Set(prev)
      const toAdd: string[] = []
      listCourses.forEach((c: any) => {
        ;(c.examSessions || []).forEach((s: any) => {
          if (s.teacherName && s.teacherName.trim() && !existing.has(s.teacherName.trim())) {
            existing.add(s.teacherName.trim())
            toAdd.push(s.teacherName.trim())
          }
        })
      })
      return toAdd.length > 0 ? [...prev, ...toAdd].sort() : prev
    })
  }, [listCourses])

  const courseOptions = useMemo(() => {
    const options = knownCourses.map((c: any) => ({
      label: t(c.name, { defaultValue: c.name }),
      value: c.id
    }))
    return [{ label: t('all_classes') || '전체 수업', value: 'all' }, ...options]
  }, [knownCourses, t])

  const subjectOptions = useMemo(() => {
    return [
      { label: t('filter_all'), value: 'all' },
      ...knownSubjects.map((s) => ({ label: s, value: s }))
    ]
  }, [knownSubjects, t])

  const periodOptions: { label: string; value: 'all' | '7days' | '30days' | '90days' }[] = useMemo(
    () => [
      { label: t('filter_all'), value: 'all' },
      { label: t('filter_last_7_days'), value: '7days' },
      { label: t('filter_last_30_days'), value: '30days' },
      { label: t('filter_last_90_days'), value: '90days' }
    ],
    [t]
  )

  const teacherOptions = useMemo(() => {
    return [
      { label: t('filter_all'), value: 'all' },
      ...knownTeachers.map((tr) => ({ label: tr, value: tr }))
    ]
  }, [knownTeachers, t])

  const getStatus = (item: CourseExamSession): 'incomplete' | 'not_taken' | 'done' => {
    if (item.isCompleted) return 'done'
    const isJoined = !!item.studentExamSessionId || item.isImComplete
    if (isJoined && !item.isNotTaken) return 'incomplete'
    return 'not_taken'
  }



  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterCriteria.courseId !== 'all') count++
    if (filterCriteria.subjectName !== 'all') count++
    if (filterCriteria.period !== 'all') count++
    if (filterCriteria.teacherName !== 'all') count++
    return count
  }, [filterCriteria])

  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string; onRemove: () => void }[] = []

    if (filterCriteria.courseId !== 'all') {
      const matchCourse = courseOptions.find((c) => c.value === filterCriteria.courseId)
      tags.push({
        key: 'course',
        label: `${t('filter_class') || '수업'}: ${matchCourse?.label || filterCriteria.courseId}`,
        onRemove: () => setFilterCriteria((prev) => ({ ...prev, courseId: 'all' }))
      })
    }

    if (filterCriteria.subjectName !== 'all') {
      tags.push({
        key: 'subject',
        label: `${t('filter_subject') || '과목'}: ${filterCriteria.subjectName}`,
        onRemove: () => setFilterCriteria((prev) => ({ ...prev, subjectName: 'all' }))
      })
    }

    if (filterCriteria.period !== 'all') {
      let periodLabel = ''
      if (filterCriteria.period === 'custom' && filterCriteria.customStartDate) {
        const startStr = moment(filterCriteria.customStartDate).format('DD/MM')
        if (filterCriteria.customEndDate) {
          const endStr = moment(filterCriteria.customEndDate).format('DD/MM')
          periodLabel = `${startStr} ~ ${endStr}`
        } else {
          periodLabel = moment(filterCriteria.customStartDate).format('DD/MM/YYYY')
        }
      } else {
        const matchPeriod = periodOptions.find((p) => p.value === filterCriteria.period)
        periodLabel = matchPeriod?.label || filterCriteria.period
      }

      tags.push({
        key: 'period',
        label: `${t('filter_period') || '기간'}: ${periodLabel}`,
        onRemove: () =>
          setFilterCriteria((prev) => ({
            ...prev,
            period: 'all',
            startDate: null,
            endDate: null,
            customStartDate: null,
            customEndDate: null
          }))
      })
    }

    if (filterCriteria.teacherName !== 'all') {
      tags.push({
        key: 'teacher',
        label: `${t('filter_teacher') || '선생님'}: ${filterCriteria.teacherName}`,
        onRemove: () => setFilterCriteria((prev) => ({ ...prev, teacherName: 'all' }))
      })
    }

    return tags
  }, [filterCriteria, courseOptions, periodOptions, t])

  const sections = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (listCourses || [])
      .map((course: any) => {
        const rawClassName = course.name || ''
        const localizedClassName = t(rawClassName, { defaultValue: rawClassName })
        const isClassMatch =
          query.length > 0 &&
          (rawClassName.toLowerCase().includes(query) || localizedClassName.toLowerCase().includes(query))

        const examSessions: CourseExamSession[] = (course.examSessions || [])
          .map((s: any) => ({
            ...s,
            courseId: course.id,
            courseName: course.name
          }))
          .filter((item: CourseExamSession) => {
            if (activeTab !== 'all' && getStatus(item) !== activeTab) {
              return false
            }
            if (query.length > 0) {
              if (isClassMatch) return true
              const matchTitle = item.title?.toLowerCase().includes(query)
              const matchCode = item.examCode?.toLowerCase().includes(query)
              const matchSubject = item.subjectName?.toLowerCase().includes(query)
              const matchTeacher = item.teacherName?.toLowerCase().includes(query)
              return !!(matchTitle || matchCode || matchSubject || matchTeacher)
            }
            return true
          })
        return {
          title: course.name,
          courseId: course.id,
          data: examSessions
        }
      })
      .filter((section: any) => section.data.length > 0)
  }, [listCourses, activeTab, search, t])

  const renderFooter = () => {
    if (isFetchingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={palette.main[600]} />
        </View>
      )
    }
    return null
  }

  const renderExamCard = ({ item }: { item: CourseExamSession }) => {
    const status = getStatus(item)
    const statusCfg = STATUS_CONFIG[status]
    const isDone = status === 'done'
    const isIncomplete = status === 'incomplete'

    const dateStr = utcToLocalTime(
      item.startTime,
      t('day_month_format')
    )

    const getButtonText = () => {
      if (isDone) return t('exam_results')
      if (isIncomplete) return t('solve_undone_questions')
      return t('join_exam')
    }

    const handleButtonClick = () => {
      if (isDone) {
        handleOpenResultDialog(item)
      } else {
        handleJoinExam(item)
      }
    }

    const metaItems = [
      { key: 'date', text: dateStr || '' },
      { key: 'course', text: t(item?.courseName || '', { defaultValue: item?.courseName || '' }) },
      { key: 'subject', text: item?.subjectName || '' },
      { key: 'teacher', text: item?.teacherName || '' }
    ].filter((m) => !!m.text)

    return (
      <View style={styles.examCard}>
        <View style={styles.cardTopRow}>
          <View style={[styles.statusBadge]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{t(statusCfg.labelKey)}</Text>
          </View>
          <Text style={styles.examCode}>{item?.examCode || ''}</Text>
        </View>

        <Text style={styles.examTitle}>{item?.title || ''}</Text>

        <View style={styles.examMetaRow}>
          {metaItems.map((meta, idx) => (
            <React.Fragment key={meta.key}>
              {idx > 0 && <View style={styles.divider} />}
              <TextTooltip
                text={meta.text}
                numberOfLines={1}
                textStyle={styles.examMeta}
                containerStyle={{ flexShrink: 1 }}
              />
            </React.Fragment>
          ))}
        </View>

        {!isParentMode && <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.applyButton, isDone && styles.resultButton]}
            activeOpacity={0.85}
            onPress={handleButtonClick}
          >
            <Text style={[styles.applyButtonText, isDone && styles.resultButtonText]}>
              {getButtonText()}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={isDone ? palette.main[600] : '#FFF'} />
          </TouchableOpacity>
        </View>}
      </View>
    )
  }

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800] || '#222'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('exam_history')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.container}>
        <View style={styles.searchBox}>
          <SearchInput
            value={search}
            onChangeText={handleSearchChange}
            placeholder={t('search_exam') || '시험 검색'}
          />
        </View>
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {TABS.map((tab) => {
              const active = activeTab === tab.key
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab]}
                  onPress={() => handleTabChange(tab.key)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(tab.label)}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
        <View style={{ gap: 10 }}>
          {/* Action Bar with Filter and Sort */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
              onPress={() => setOpenFilterSheet(true)}
              activeOpacity={0.75}
            >
              <Ionicons
                name="options-outline"
                size={16}
                color={activeFilterCount > 0 ? palette.main[600] : palette.grey[700]}
              />
              <Text style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}>
                {t('filter_title') || '필터'}
              </Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sortButton} onPress={() => handleSort()} activeOpacity={0.75}>
              <Text style={styles.sortText}>
                {filter.sortColumnDirection === OrderBy.DESC ? t('recent') : t('oldest')}
              </Text>
              <SortIcon />
            </TouchableOpacity>
          </View>

          {/* Active Filter Tags */}
          {activeFilterTags.length > 0 && (
            <View style={styles.activeTagsRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activeTagsContainer}
              >
                {activeFilterTags.map((tag) => (
                  <TouchableOpacity
                    key={tag.key}
                    style={styles.activeTag}
                    onPress={tag.onRemove}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.activeTagText}>{tag.label}</Text>
                    <Ionicons name="close" size={14} color={palette.grey[600]} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.clearAllBtn}
                  onPress={() => setFilterCriteria(DEFAULT_EXAM_FILTER)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.clearAllText}>{t('clear_all') || '초기화'}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <View style={styles.content}>
            <SectionList
              sections={sections}
              ref={scrollViewRef as any}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.classHeader}>
                  <Ionicons name="school" size={16} color={palette.main[600]} />
                  <Text style={styles.classTitle}>{t(title, { defaultValue: title })}</Text>
                </View>
              )}
              renderItem={({ item }) => renderExamCard({ item })}
              keyExtractor={(item, index) => `exam_${item.id || index}`}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                !loadingExams ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('no_exam_history') || '시험 기록이 없습니다'}</Text>
                  </View>
                ) : (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={palette.main[600]} />
                  </View>
                )
              }
            />
          </View>
        </View>
      </View>
      {openResultDialog && (
        <ExamResult
          onClose={handleCloseResultDialog}
          examCode={selectedExam?.examCode}
          examSessionId={selectedExam?.id}
          studentExamSessionId={selectedExam?.studentExamSessionId}
        />
      )}

      {/* Filter Bottom Sheet */}
      <ExamFilterBottomSheet
        isVisible={openFilterSheet}
        onClose={() => setOpenFilterSheet(false)}
        filter={filterCriteria}
        onApply={(newFilter) => setFilterCriteria(newFilter)}
        courseOptions={courseOptions}
        subjectOptions={subjectOptions}
        teacherOptions={teacherOptions}
        t={t}
      />
    </SlideDrawerRoot>
  )
}

export default ExamHistoryDialog

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg[100],
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    gap: '16@ms'
  },
  header: {
    flexDirection: 'row',
    paddingVertical: '16@ms',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    backgroundColor: '#FFF',
    borderBottomWidth: '1@ms',
    borderBottomColor: palette.grey[100]
  },
  divider: {
    height: '11@ms',
    width: '1@ms',
    backgroundColor: palette.grey[300],
    marginHorizontal: '6@ms'
  },
  headerTitle: {
    fontSize: '17@ms',
    fontWeight: '700',
    color: '#111'
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    marginTop: '14@ms',
    marginBottom: '8@ms',
    paddingHorizontal: '2@ms'
  },
  classTitle: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  content: {},
  backButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrapper: {},
  tabsContainer: {
    flexDirection: 'row'
  },
  tab: {
    minWidth: '70@ms',
    paddingHorizontal: '18@ms',
    paddingVertical: '6@ms'
  },
  tabActive: {
    color: palette.main[600]
  },
  tabText: {
    textAlign: 'center',
    fontSize: '14@ms',
    fontWeight: '500',
    color: '#858588'
  },
  tabTextActive: {
    color: palette.main[600],
    fontWeight: '700'
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    backgroundColor: '#FFF',
    paddingHorizontal: '14@ms',
    paddingVertical: '7@ms',
    borderRadius: '20@ms',
    borderWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  filterButtonActive: {
    borderColor: palette.main[600],
    backgroundColor: '#F5F3FF'
  },
  filterButtonText: {
    fontSize: '12@ms',
    color: palette.grey[800],
    fontWeight: '600'
  },
  filterButtonTextActive: {
    color: palette.main[600]
  },
  filterBadge: {
    backgroundColor: palette.main[600],
    borderRadius: '10@ms',
    paddingHorizontal: '6@ms',
    paddingVertical: '1@ms',
    marginLeft: '2@ms'
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: '10@ms',
    fontWeight: '700'
  },
  activeTagsRow: {
    marginTop: '-2@ms'
  },
  activeTagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    paddingVertical: '2@ms'
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5@ms',
    backgroundColor: '#FFF',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB',
    paddingHorizontal: '10@ms',
    paddingVertical: '5@ms',
    borderRadius: '16@ms'
  },
  activeTagText: {
    fontSize: '11@ms',
    color: palette.grey[800],
    fontWeight: '500'
  },
  clearAllBtn: {
    paddingHorizontal: '6@ms',
    paddingVertical: '4@ms'
  },
  clearAllText: {
    fontSize: '11@ms',
    color: palette.grey[500],
    fontWeight: '500',
    textDecorationLine: 'underline'
  },
  sortButton: {
    gap: '4@ms',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: '12@ms',
    paddingVertical: '7@ms',
    borderRadius: '20@ms',
    borderWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  sortText: {
    fontSize: '12@ms',
    color: palette.grey[700],
    fontWeight: '500'
  },
  scrollContainer: {
    paddingBottom: '200@ms',
    gap: '12@ms'
  },
  examCard: {
    backgroundColor: '#FFF',
    borderRadius: '13@ms',
    paddingHorizontal: '15@ms',
    paddingVertical: '20@ms'
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '8@ms',
    gap: '8@ms'
  },
  statusBadge: {
    borderRadius: '6@ms'
  },
  statusText: {
    fontSize: '11@ms',
    fontWeight: '700'
  },
  examCode: {
    fontSize: '12@ms',
    color: palette.grey[500],
    flex: 1
  },
  resultLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2@ms'
  },
  resultLinkText: {
    fontSize: '12@ms',
    color: palette.grey[500],
    fontWeight: '500'
  },
  examTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.grey[900],
    marginBottom: '6@ms',
    lineHeight: '22@ms'
  },
  examMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: '4@ms'
  },
  examMeta: {
    fontSize: '12@ms',
    color: palette.grey[700]
  },
  attemptBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: '8@ms',
    paddingVertical: '3@ms',
    borderRadius: '20@ms',
    marginTop: '8@ms'
  },
  attemptText: {
    fontSize: '11@ms',
    fontWeight: '600'
  },
  cardFooter: {
    marginTop: '14@ms',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: '18@ms',
    paddingVertical: '10@ms',
    borderRadius: '24@ms',
    gap: '4@ms'
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: '13@ms',
    fontWeight: '700'
  },
  resultButton: {
    backgroundColor: '#FFF',
    borderWidth: '1@ms',
    borderColor: palette.main[600]
  },
  resultButtonText: {
    color: palette.main[600]
  },
  searchBox: {
    marginBottom: '2@ms'
  },
  emptyContainer: {
    paddingVertical: '40@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: '14@ms',
    color: palette.grey[500],
    fontWeight: '500'
  },
  footerLoader: {
    paddingVertical: '16@ms',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
