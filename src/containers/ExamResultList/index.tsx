import CustomDropDown from '@/components/DropDown/CustomDropDown'
import { KeyboardAvoidingView, Platform, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useExamResultList from './hooks/useExamResultList'
import { ExamSessionResponse } from '@/utils/types'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import SearchInput from '@/components/Input/SearchInput'
import moment from 'moment'
import { highlightText, isValidTime, utcToLocalTime } from '@/utils/helpers'
import ExamResult from '../ExamResult/views'
import HeaderAction from '@/layouts/components/HeaderAction'

const ExamResultList = () => {
  const {
    t,
    listExam,
    groupExams,
    search,
    scrollViewRef,
    expandedId,
    handleBack,
    toggleExpand,
    handleViewResult,
    selectedExam,
    onChangeSearch
  } = useExamResultList()
  const insets = useSafeAreaInsets()

  const renderExamCard = (exam: ExamSessionResponse, highlight = false) => (
    <TouchableOpacity onPress={() => handleViewResult(exam)} activeOpacity={0.85}>
      <View style={styles.examCard}>
        <View style={styles.examTopRow}>
          <Text numberOfLines={2} style={styles.examTitle}>
            {highlight ? highlightText((exam?.title || '').trim(), search) : (exam?.title || '').trim()}
          </Text>

          {(exam.studentTotalAttemptTime || 0) > 1 && (
            <View
              style={[
                styles.attemptBadge,
                {
                  backgroundColor: exam.isSelected ? palette.main[100] : palette.red[100]
                }
              ]}
            >
              <Text
                style={[
                  styles.attemptText,
                  {
                    color: exam.isSelected ? palette.main[700] : palette.red[900]
                  }
                ]}
              >
                {`#${exam.studentAttemptNumber + 1}/${exam.studentTotalAttemptTime}`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.examBottomRow}>
          <Text style={styles.examDate}>
            {utcToLocalTime(
              isValidTime(exam.studentStartTime) ? exam.studentStartTime : exam.startTime,
              t('date_format')
            )}
          </Text>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{t('score_format', { score: exam?.score })}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderSearchItem = ({ item }: { item: ExamSessionResponse }) => renderExamCard(item, true)

  const renderGroupItem = ({ item, index }: { item: [string, ExamSessionResponse[]]; index: number }) => {
    const [key, exams] = item

    return (
      <View style={styles.groupExamContainer}>
        <CustomDropDown
          title={
            <View style={styles.groupHeader}>
              <Text style={styles.groupDate}>{moment(key).format(t('date_format_exam'))}</Text>
              <Text style={styles.groupCase}>{t('cases', { number: exams.length })}</Text>
            </View>
          }
          expanded={expandedId === index}
          onPress={() => toggleExpand(index)}
        >
          {exams.map((exam, idx) => (
            <View key={`${key}_${idx}`}>{renderExamCard(exam)}</View>
          ))}
        </CustomDropDown>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.headerTitle}>{t('my_grades')}</Text>
        <View>
          <HeaderAction />
        </View>
      </View>
      <View style={styles.searchBox}>
        <SearchInput value={search} onChangeText={onChangeSearch} placeholder={t('search_placeholder')} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        {search.length ? (
          <FlatList
            data={listExam}
            ref={scrollViewRef}
            renderItem={renderSearchItem}
            keyExtractor={(item, index) => `search_${index}`}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            ref={scrollViewRef}
            data={Object.entries(groupExams || {})}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item[0]}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>

      {!!selectedExam && (
        <ExamResult
          onClose={handleBack}
          examCode={selectedExam?.code || ''}
          examSessionId={selectedExam.id}
          studentExamSessionId={selectedExam?.studentExamSessionId}
        />
      )}
    </View>
  )
}

export default ExamResultList

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[50]
  },
  header: {
    paddingVertical: '20@ms',
    paddingHorizontal: '18@ms',
    borderBottomWidth: '1@ms',
    backgroundColor: '#FFF',
    borderColor: palette.grey[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: '20@ms',
    fontWeight: 600,
    color: '#222222'
  },
  searchBox: {
    paddingTop: '24@ms',
    paddingHorizontal: '20@ms'
  },

  scrollContainer: {
    paddingHorizontal: '20@ms',
    paddingTop: '16@ms',
    paddingBottom: '28@vs',
    gap: '16@ms'
  },

  groupExamContainer: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    paddingVertical: '8@ms',
  },

  groupHeader: {
    paddingHorizontal: '20@ms',
    paddingVertical: '10@ms'
  },

  groupDate: {
    ...TYPO.button3,
    color: palette.grey[900],
    fontWeight: '600'
  },

  groupCase: {
    fontSize: '12@ms',
    color: palette.grey[400],
    marginTop: '2@ms'
  },

  examCard: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    padding: '18@ms',
    marginHorizontal: '16@ms',
    marginBottom: '14@ms',
    borderWidth: '1@ms',
    borderColor: palette.grey[100]
  },

  examTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12@ms'
  },

  examTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    flex: 1,
    color: palette.grey[900]
  },

  attemptBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '20@ms'
  },

  attemptText: {
    fontSize: '11@ms',
    fontWeight: '600'
  },

  examBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  examDate: {
    fontSize: '12@ms',
    color: palette.grey[500],
    fontWeight: '500'
  },

  scoreBadge: {
    backgroundColor: palette.main[100],
    paddingHorizontal: '14@ms',
    paddingVertical: '6@ms',
    borderRadius: '20@ms'
  },

  scoreText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: palette.main[700]
  }
})
