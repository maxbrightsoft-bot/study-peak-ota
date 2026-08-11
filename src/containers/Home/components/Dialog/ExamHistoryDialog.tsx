import React, { useState, useMemo } from 'react'
import { SectionList, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import useExamResultList from '../../hooks/useExamResultList'
import { isValidTime, utcToLocalTime } from '@/utils/helpers'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { ExamStatus, OrderBy } from '@/utils/enums'
import ExamResult from '@/containers/ExamResult/views'
import SortIcon from '@/assets/iconJSX/sort'
import { CourseExamSession } from '../../configs/type'
import TextTooltip from '@/components/Tooltip/TextTooltip'
import _ from 'lodash'
import moment from 'moment'

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
  const {
    listExam,
    listCourses,
    handleJoinExam,
    scrollViewRef,
    filter,
    handleSort,
    openResultDialog,
    selectedExam,
    handleOpenResultDialog,
    handleCloseResultDialog
  } = useExamResultList({ onClose, open })
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const getStatus = (item: CourseExamSession): 'incomplete' | 'not_taken' | 'done' => {
    if (item.isCompleted) return 'done'
    const isJoined = !!item.studentExamSessionId || item.isImComplete
    if (isJoined && !item.isNotTaken) return 'incomplete'
    return 'not_taken'
  }

  const sections = useMemo(() => {
    const isAsc = filter.sortColumnDirection === OrderBy.ASC

    const processed = (listCourses || [])
      .map((course: any) => {
        const examSessions: CourseExamSession[] = (course.examSessions || []).map((s: any) => ({
          ...s,
          courseId: course.id,
          courseName: course.name
        }))

        const filteredSessions = examSessions.filter((item) => {
          if (activeTab === 'all') return true
          return getStatus(item) === activeTab
        })

        const sortedSessions = _.orderBy(
          filteredSessions,
          [(session) => (session.startTime ? moment(session.startTime).valueOf() : 0)],
          [isAsc ? 'asc' : 'desc']
        )

        const latestTime = sortedSessions.reduce((acc, session) => {
          const t = session.startTime ? moment(session.startTime).valueOf() : 0
          return isAsc ? Math.min(acc, t) : Math.max(acc, t)
        }, isAsc ? Infinity : 0)

        return {
          title: course.name,
          courseId: course.id,
          data: sortedSessions,
          sectionTime: latestTime === Infinity ? 0 : latestTime
        }
      })
      .filter((section: any) => section.data.length > 0)

    return _.orderBy(
      processed,
      ['sectionTime'],
      [isAsc ? 'asc' : 'desc']
    )
  }, [listCourses, activeTab, filter.sortColumnDirection])

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

    return (
      <View style={styles.examCard}>
        <View style={styles.cardTopRow}>
          <View style={[styles.statusBadge]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{t(statusCfg.labelKey)}</Text>
          </View>
          <Text style={styles.examCode}>{item?.examCode || ''}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text numberOfLines={1} style={[styles.examTitle, { flexShrink: 1 }]}>
            {dateStr || ''}
          </Text>
          <View style={styles.divider} />
          <TextTooltip
            text={item?.courseName || ''}
            numberOfLines={1}
            textStyle={styles.examTitle}
            containerStyle={{ flexShrink: 1 }}
          />
          <View style={styles.divider} />
          <TextTooltip
            text={item?.subjectName || ''}
            numberOfLines={1}
            textStyle={styles.examTitle}
            containerStyle={{ flexShrink: 1 }}
          />
          <View style={styles.divider} />
          <TextTooltip
            text={item?.title || ''}
            numberOfLines={1}
            textStyle={styles.examTitle}
            containerStyle={{ flexShrink: 1 }}
          />
        </View>
        <Text style={styles.examMeta}>{item?.teacherName || ''}</Text>

        <View style={styles.cardFooter}>
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
        </View>
      </View>
    )
  }

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('exam_history')}</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.container}>
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {TABS.map((tab) => {
              const active = activeTab === tab.key
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(tab.label)}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
        <View style={{ gap: 10 }}>
          <View style={styles.sortBar}>
            <TouchableOpacity style={styles.sortButton} onPress={() => handleSort()} activeOpacity={0.75}>
              <Text style={styles.sortText}>
                {filter.sortColumnDirection === OrderBy.DESC ? t('recent') : t('oldest')}
              </Text>
              <SortIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <SectionList
              sections={sections}
              ref={scrollViewRef as any}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.classHeader}>
                  <Ionicons name="school" size={16} color={palette.main[600]} />
                  <Text style={styles.classTitle}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => renderExamCard({ item })}
              keyExtractor={(item, index) => `exam_${item.id || index}`}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
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
    gap: '18@ms'
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
    height: '12@ms',
    width: '1.5@ms',
    backgroundColor: palette.grey[300],
    marginHorizontal: '8@ms'
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
    padding: '2@ms'
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
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  sortButton: {
    gap: '4@ms',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
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
    fontWeight: '600',
    color: palette.grey[900],
    marginBottom: 0
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
  }
})
