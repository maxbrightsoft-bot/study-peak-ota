import React from 'react'
import { View, Text, ScrollView, Platform, KeyboardAvoidingView } from 'react-native'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import useExam from './hooks/useExam'
import NotFoundExam from '@/components/NotFoundExam'
import Loading from '@/components/Loading'
import HangOnDialog from './components/HangOnDialog'
import LiveResultDialog from './components/LiveResultDialog'
import ExamResult from '../ExamResult/views'
import { QuestionGroupResponse } from './config/types'
import ExamQuestionGroup from './components/ExamQuestionGroup'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'

type Props = {
  examCode: string
}

const DoExam = ({ examCode }: Props) => {
  const {
    t,
    exam,
    isEnding,
    endExam,
    questionListMapped,
    questionList,
    remainTime,
    remainTimeString,
    totalTimeString,
    isNotFoundExam,
    expandedId,
    questionRefs,
    scrollViewRef,
    scrollToNextQuestion,
    currentIndex,
    openResultDialog,
    liveResultDialog,
    toggleExpand,
    handleCloseResultDialog,
    handleExamEnd,
    handleDetailExamResult,
    handleCloseLiveResultDialog,
    updateQuestionAnswer,
    updateQuestionStar,
    onFishedExam
  } = useExam({ examCode })

  if (isNotFoundExam) return <NotFoundExam title={'the_exam_code_you_are_looking_for_was_not_found'} />
  return (
    <View style={styles.container}>
      {!openResultDialog && (
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{exam?.title}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.subtitle}>{t('title')}</Text>
              {/* <Text style={styles.subtitle}>Page #</Text> */}
            </View>
          </View>
          <Text style={styles.currentQuestion}>{`${t('question')} ${currentIndex + 1}`}</Text>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1, position: 'relative' }}
      >
        <View style={{ height: '85%', paddingBottom: 40 }}>
          <ScrollView  contentContainerStyle={styles.scrollContainer} ref={scrollViewRef} scrollEventThrottle={16}>
            {questionListMapped.map((questionGroup: QuestionGroupResponse, groupIndex: number) => (
              <React.Fragment key={`group-${questionGroup.id}`}>
                <ExamQuestionGroup
                  t={t}
                  data={questionGroup}
                  questionRefs={questionRefs}
                  scrollToNextQuestion={scrollToNextQuestion}
                  updateQuestionStar={updateQuestionStar}
                  updateQuestionAnswer={updateQuestionAnswer}
                  groupIndex={groupIndex}
                  expandedId={expandedId}
                  questionList={questionList}
                  toggleExpand={toggleExpand}
                />
              </React.Fragment>
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLeft}>{remainTimeString}</Text>
            <Text style={styles.totalTime}>{`/ ${totalTimeString}`}</Text>
          </View>
          <Ionicons onPress={onFishedExam} name="exit" size={18} color={palette.main[700]} />
        </View>
        {!isEnding && (
          <HangOnDialog
            title={t('notification')}
            content={t('waiting_for_all_students_to_complete_the_exam')}
            open={!!endExam && !!exam && !exam.isLate}
          />
        )}
        {isEnding && liveResultDialog && (
          <LiveResultDialog
            title={t('exam_end')}
            open={liveResultDialog}
            examCode={examCode}
            onClose={() => {
              handleCloseLiveResultDialog()
              navigate(Routes.Auth.Home)
            }}
            handleExamEnd={handleExamEnd}
            handleDetailExamResult={handleDetailExamResult}
          />
        )}
        {openResultDialog && <ExamResult onClose={handleExamEnd} examCode={examCode} />}
        {!exam && remainTime !== undefined && remainTime < 0 && <Loading />}
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  titleContainer: {
    flexDirection: 'row',
    gap: '16@ms',
    alignItems: 'center'
  },
  title: {
    fontSize: 14,
    color: '#000'
  },
  subtitle: {
    fontSize: 12,
    color: '#aaa'
  },
  currentQuestion: {
    fontWeight: 'bold',
    fontSize: 14
  },
  styleCard: {
    backgroundColor: palette.grey[50],
    marginVertical: 10,
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms'
  },
  styleExpand: {
    marginTop: 10
  },
  scrollContainer: {
    paddingHorizontal: 24
  },
  accordionBox: {
    marginBottom: '16@ms'
  },
  accordionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms'
  },
  answerBox: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center'
  },
  answerText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  bookmarkBox: {
    backgroundColor: '#eee',
    padding: 6,
    borderRadius: 12,
    width: 40,
    alignItems: 'center',
    marginTop: 4
  },
  bookmarkText: {
    color: '#aaa'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  timeLeft: {
    color: palette.main[700],
    fontWeight: 'bold',
    fontSize: 16,
    width: '100@ms'
  },
  totalTime: {
    color: palette.grey[500],
    fontSize: 14,
    fontWeight: 500
  },
  optionWrap: {},
  optionText: {}
})

export default DoExam
