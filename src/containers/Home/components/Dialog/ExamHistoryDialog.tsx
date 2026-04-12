import React, { useState } from 'react'
import { FlatList, Text, TouchableOpacity, View, ScrollView } from 'react-native'
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  incomplete: { label: '미완료', color: '#FEAF06' },
  not_taken: { label: '미응시', color: '#DB4D4D' },
  done: { label: '완료', color: '#3DC674' }
}

const ExamHistoryDialog = ({ t, onClose, open }: Props) => {
  const {
    listExam,
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
    if (item.isNotTaken) return 'not_taken'
    return 'incomplete'
  }

  const filteredList = listExam.filter((item) => {
    if (activeTab === 'all') return true
    return getStatus(item) === activeTab
  })

  const renderExamCard = ({ item }: { item: CourseExamSession }) => {
    const status = getStatus(item)
    const statusCfg = STATUS_CONFIG[status]
    const isDone = status === 'done'

    const dateStr = utcToLocalTime(
      item.startTime,
      t('day_month_format')
    )

    return (
      <View style={styles.examCard}>
        <View style={styles.cardTopRow}>
          <View style={[styles.statusBadge]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{t(statusCfg.label)}</Text>
          </View>
          <Text style={styles.examCode}>{item?.examCode || ''}</Text>

          {isDone && (
            <TouchableOpacity style={styles.resultLink} onPress={() => handleOpenResultDialog(item)}>
              <Text style={styles.resultLinkText}>{t('view_result')}</Text>
              <Ionicons name="chevron-forward" size={13} color={palette.grey[500]} />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text numberOfLines={1} style={styles.examTitle}>
            {dateStr || ''}
          </Text>
          <View style={styles.divider} />
          <Text numberOfLines={1} style={styles.examTitle}>
            {item?.courseName || ''}
          </Text>
          <View style={styles.divider} />
          <Text numberOfLines={1} style={styles.examTitle}>
            {item?.subjectName || ''}
          </Text>
          <View style={styles.divider} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text numberOfLines={1} style={styles.examTitle}>
              {item?.title || ''}
            </Text>
          </View>

        </View>
        <Text style={styles.examMeta}>{item?.teacherName || ''}</Text>

        {!isDone && (
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.applyButton} activeOpacity={0.85} onPress={() => handleJoinExam(item)}>
              <Text style={styles.applyButtonText}>{t('take_exam')}</Text>
              <Ionicons name="chevron-forward" size={16} color={'#FFF'} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  return (
    <SlideDrawerRoot visible={open}>
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
            <FlatList
              data={filteredList}
              ref={scrollViewRef}
              renderItem={renderExamCard}
              keyExtractor={(item, index) => `exam_${index}`}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
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
    gap: 18
  },
  header: {
    flexDirection: 'row',
    paddingVertical: '16@ms',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100]
  },
  divider: {
    height: 12,
    width: 1.5,
    backgroundColor: palette.grey[300],
    marginHorizontal: 8
  },
  headerTitle: {
    fontSize: '17@ms',
    fontWeight: '700',
    color: '#111'
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
    minWidth: 70,
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
    borderWidth: 1,
    borderColor: palette.grey[100]
  },
  sortText: {
    fontSize: '12@ms',
    color: palette.grey[700],
    fontWeight: '500'
  },
  scrollContainer: {
    paddingBottom: 200,
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
    marginBottom: '6@ms'
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
  }
})
