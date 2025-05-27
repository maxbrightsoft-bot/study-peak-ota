import React, { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  findNodeHandle,
  UIManager,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import useExam from './hooks/useExam'
import NotFoundExam from '@/components/NotFoundExam'
import Loading from '@/components/Loading'
import HangOnDialog from './components/HangOnDialog'
import ExamAnswer from './components/ExamAnswer'
import StarSwitch from '@/components/Switch/StarSwitch'
import CustomDropDown from '@/components/DropDown/CustomDropDown'
import LiveResultDialog from './components/LiveResultDialog'
import { Question } from '@/utils/types'
import { QuestionAnswerType } from '@/utils/enums'
import ExamResult from '../ExamResult/views'
import { useFocusEffect } from '@react-navigation/native'

type Props = {
  examCode: string
}

const DoExam = ({ examCode }: Props) => {
  const {
    t,
    exam,
    endExam,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        <View style={{ height: '75%' }}>
          <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef} scrollEventThrottle={16}>
            {questionList.map((question: Question, indexGroup: number) => (
              <View key={question.id} ref={(ref) => (questionRefs.current[indexGroup] = ref)} collapsable={false}>
                <CustomDropDown
                  styleCard={styles.styleCard}
                  styleExpand={styles.styleExpand}
                  title={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: 500 }}>{t('question')}</Text>
                      <Text style={{ fontSize: 16, fontWeight: 700 }}>{question.questionOrder + 1}</Text>
                    </View>
                  }
                  subHeader={
                    <View
                      style={{
                        width: '100%'
                      }}
                    >
                      {expandedId !== question.id && (question.textualAnswer || !!question.selectedAnswers?.length) && (
                        <View
                          style={{
                            width: '100%'
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              width: '100%',
                              borderWidth: 1,
                              borderRadius: 8,
                              marginBottom: 10,
                              paddingVertical: 8,
                              alignItems: 'center',
                              backgroundColor: question.isStar ? palette.warning.light : palette.main[500],
                              borderColor: question.isStar ? palette.warning.light : palette.main[500]
                            }}
                          >
                            <View
                              style={{
                                borderRadius: 255,
                                borderWidth: question.textualAnswer ? 0 : 1,
                                paddingHorizontal: 5,
                                paddingVertical: question.isStar ? 5 : 0,
                                alignItems: question.textualAnswer ? 'flex-start' : 'center',
                                justifyContent: 'center',
                                borderColor: '#FFF',
                                backgroundColor: question.isStar ? '#FFF' : palette.main[500]
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: '#FFF'
                                }}
                              >
                                {question.isStar ? (
                                  <Ionicons name="star" size={14} color={palette.warning.light} />
                                ) : (
                                  question.textualAnswer || question?.selectedAnswers?.sort().join(', ') || '-'
                                )}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <StarSwitch
                            isStar={question.isStar}
                            onSwitch={() => updateQuestionStar(question.id, !question.isStar)}
                          />
                        </View>
                      )}
                    </View>
                  }
                  expanded={expandedId === question.id}
                  onPress={() => toggleExpand(question.id)}
                >
                  <ExamAnswer
                    question={question}
                    updateQuestionAnswer={({ questionId, value }) => {
                      updateQuestionAnswer({ questionId, value })
                      question.questionAnswerType !== QuestionAnswerType.MultipleChoice &&
                        scrollToNextQuestion(indexGroup)
                      indexGroup === questionList.length - 1 && toggleExpand(null)
                    }}
                    updateQuestionStar={updateQuestionStar}
                  />
                </CustomDropDown>
              </View>
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
        <HangOnDialog
          title={t('notification')}
          content={t('waiting_for_all_students_to_complete_the_exam')}
          open={!!endExam && !!exam && !exam.isLate}
        />
        {liveResultDialog && (
          <LiveResultDialog
            title={t('exam_end')}
            open={liveResultDialog}
            examCode={examCode}
            onClose={handleCloseLiveResultDialog}
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
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingBottom: '40@ms'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    alignItems: 'center'
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
  scrollContainer: {},
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
    padding: 16,
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
