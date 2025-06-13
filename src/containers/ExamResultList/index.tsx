import CustomDropDown from '@/components/DropDown/CustomDropDown'
import { KeyboardAvoidingView, Platform, FlatList, Text, TouchableOpacity, View } from 'react-native'
import useExamResultList from './hooks/useExamResultList'
import { ExamSession } from '@/utils/types'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import SearchInput from '@/components/Input/SearchInput'
import moment from 'moment'
import { highlightText, utcToLocalTime } from '@/utils/helpers'
import ExamResult from '../ExamResult/views'

const ExamResultList = () => {
  const {
    t,
    listExam,
    groupExams,
    search,
    expandedId,
    handleBack,
    toggleExpand,
    handleViewResult,
    selectedExam,
    onChangeSearch
  } = useExamResultList()

  // Render item for search results
  const renderSearchItem = ({ item }: { item: ExamSession }) => (
    <TouchableOpacity onPress={() => handleViewResult(item)} activeOpacity={0.8}>
      <View style={styles.examItem}>
        <View style={styles.examContent}>
          <View style={styles.examHeader}>
            <Text style={styles.examTitle}>{highlightText(item?.title || '', search)}</Text>
            <Text style={styles.examScore}>{t('score_format', { score: item?.score })}</Text>
          </View>
          <View style={styles.examFooter}>
            <Text style={styles.examDate}>{utcToLocalTime(item.startTime, t('date_format'))}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Render item for grouped exams
  const renderGroupItem = ({ item, index }: { item: [string, ExamSession[]]; index: number }) => {
    const [key, exams] = item
    return (
      <View style={styles.groupExamContainer}>
        <CustomDropDown
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.titleText}>{moment(key).format(t('date_format_exam'))}</Text>
              <Text style={styles.scoreText}>{t('cases', { number: exams.length })}</Text>
            </View>
          }
          expanded={expandedId === index}
          onPress={() => toggleExpand(index)}
        >
          {exams.map((exam: ExamSession, index) => (
            <TouchableOpacity key={`${key}_${index}`} onPress={() => handleViewResult(exam)} activeOpacity={0.8}>
              <View style={styles.examItem}>
                <View style={styles.examContent}>
                  <View style={styles.examHeader}>
                    <Text style={styles.examTitle}>{exam?.title || ''}</Text>
                    <Text style={styles.examScore}>{t('score_format', { score: exam?.score })}</Text>
                  </View>
                  <View style={styles.examFooter}>
                    <Text style={styles.examDate}>{utcToLocalTime(exam.startTime, t('date_format'))}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </CustomDropDown>
      </View>
    )
  }

  return (
    <View style={styles.container}>
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
            renderItem={renderSearchItem}
            keyExtractor={(item, index) => `search_${index}`}
            contentContainerStyle={styles.scrollContainer}
          />
        ) : (
          <FlatList
            data={Object.entries(groupExams || {})}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item[0]}
            contentContainerStyle={styles.scrollContainer}
          />
        )}
      </KeyboardAvoidingView>
      {!!selectedExam && <ExamResult onClose={handleBack} examCode={selectedExam?.code || ''} />}
    </View>
  )
}

export default ExamResultList

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[50]
  },
  searchBox: {
    borderBottomWidth: 1,
    paddingTop: '24@ms',
    paddingHorizontal: '24@ms',
    paddingBottom: '24@ms',
    backgroundColor: '#FFF',
    borderColor: palette.grey[100]
  },
  scrollContainer: {
    gap: '8@ms',
    paddingBottom: '20@vs'
  },
  titleText: {
    ...TYPO.button3,
    color: palette.grey[300]
  },
  scoreText: {
    ...TYPO.button3,
    color: palette.grey[900]
  },
  groupExamContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms'
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms',
    gap: '8@ms',
    borderRadius: '4@ms',
    marginBottom: '8@vs'
  },
  checkboxContainer: {
    paddingTop: '2@vs'
  },
  checkbox: {
    width: '20@ms',
    height: '20@ms'
  },
  examContent: {
    flex: 1
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '4@vs'
  },
  examTitle: {
    fontWeight: '600',
    fontSize: '14@ms',
    flexShrink: 1
  },
  examScore: {
    fontWeight: '600',
    fontSize: '14@ms',
    marginLeft: '8@ms'
  },
  examFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  examDate: {
    fontWeight: '500',
    fontSize: '10@ms',
    color: palette.grey[500]
  }
})
