import CustomDropDown from '@/components/DropDown/CustomDropDown'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
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
    // examCodeActive,
    search,
    expandedId,
    handleBack,
    toggleExpand,
    handleViewResult,
    selectedExam,
    onChangeSearch
  } = useExamResultList()
  return (
    <View style={styles.container}>
      <SearchInput value={search} onChangeText={onChangeSearch} placeholder={t('search_placeholder')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {search.length
            ? listExam?.map((exam: ExamSession, index) => (
                <TouchableOpacity key={index} onPress={() => handleViewResult(exam)} activeOpacity={0.8}>
                  <View style={[styles.examItem]}>
                    <View style={styles.examContent}>
                      <View style={styles.examHeader}>
                        <Text style={[styles.examTitle]}>{highlightText(exam?.title || '', search)}</Text>
                        <Text style={[styles.examScore]}>{t('score_format', { score: exam?.score })}</Text>
                      </View>

                      <View style={styles.examFooter}>
                        <Text style={[styles.examDate]}>{utcToLocalTime(exam.startTime, t('date_format'))}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            : groupExams &&
              Object.entries(groupExams).map(([key, exams], examIndex) => (
                <View key={examIndex}>
                  <CustomDropDown
                    title={
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={styles.titleText}> {moment(key).format(t('date_format_exam'))}</Text>
                        <Text style={styles.scoreText}> {t('cases', { number: exams.length })}</Text>
                      </View>
                    }
                    expanded={expandedId === examIndex}
                    onPress={() => toggleExpand(examIndex)}
                  >
                    {exams?.map((exam: ExamSession, index) => (
                      <TouchableOpacity
                        key={`${examIndex}_${index}`}
                        onPress={() => handleViewResult(exam)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.examItem]}>
                          <View style={styles.examContent}>
                            <View style={styles.examHeader}>
                              <Text style={[styles.examTitle]}>{exam?.title || ''}</Text>
                              <Text style={[styles.examScore]}>{t('score_format', { score: exam?.score })}</Text>
                            </View>
                            <View style={styles.examFooter}>
                              <Text style={[styles.examDate]}>{utcToLocalTime(exam.startTime, t('date_format'))}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </CustomDropDown>
                </View>
              ))}
        </ScrollView>
      </KeyboardAvoidingView>
      <ExamResult onClose={handleBack} examCode={selectedExam?.code || ''} />
    </View>
  )
}

export default ExamResultList

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: '24@ms',
    gap: '24@ms',
    paddingTop: '24@ms'
  },
  searchBox: {
    flexDirection: 'row',
    alignContent: 'center',
    borderWidth: 1,
    borderColor: palette.grey[100],
    gap: 12,
    borderRadius: '255@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms'
  },
  scrollContainer: {
    gap: '8@ms'
  },
  titleText: {
    ...TYPO.button3,
    color: palette.grey[300]
  },
  scoreText: {
    ...TYPO.button3,
    color: palette.grey[900]
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '12@ms',
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
    fontSize: '10@ms'
  }
})
