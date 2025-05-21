import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import NotFoundExam from '@/components/NotFoundExam'
import StarSwitch from '@/components/Switch/StarSwitch'
import CustomDropDown from '@/components/DropDown/CustomDropDown'
import useTextbook from './hooks/useTextbook'
import { PreparedQuestionResponse } from './config/types'
import TextbookAnswer from './components/TextbookAnswer'

type Props = {
  textbookId: string
  page: string
}

const DoTextbook = ({ textbookId, page }: Props) => {
  const {
    t,
    textbook,
    toggleExpand,
    currentIndex,
    questionList,
    questionRefs,
    expandedId,
    scrollViewRef,
    isNotFoundTextbook,
    updateQuestionAnswer,
    updateQuestionStar,
    formattedTime,
    totalTasks,
    scrollToNextQuestion,
    completedTasks,
    onFinishedTextbook
  } = useTextbook({ textbookId, page })

  if (isNotFoundTextbook) {
    return <NotFoundExam title="text_book_not_found" />
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{textbook?.name}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.subtitle}>{t('title')}</Text>
            <Text style={styles.subtitle}>Page #</Text>
          </View>
        </View>
        <Text style={styles.currentQuestion}>{`${t('question')} ${currentIndex + 1}`}</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef} scrollEventThrottle={16}>
          {questionList.map((question: PreparedQuestionResponse, indexGroup: number) => (
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
                    {expandedId !== question.id && !!question.selectedAnswers?.length && (
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
                <TextbookAnswer
                  t={t}
                  question={question}
                  updateQuestionAnswer={({ questionId, textualAnswers, answer }) => {
                    updateQuestionAnswer({ questionId, answer, textualAnswers })
                    scrollToNextQuestion(indexGroup)
                  }}
                  updateQuestionStar={updateQuestionStar}
                />
              </CustomDropDown>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {t('time')}: {formattedTime}
          </Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.timeText}>
            {completedTasks}/{totalTasks}
          </Text>
          <Text style={styles.timeText}>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</Text>
        </View>
        <Ionicons onPress={onFinishedTextbook} name="exit" size={18} color={palette.main[700]} />
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    alignItems: 'center',
    marginBottom: '28@ms'
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
  styleCard: {
    marginVertical: 10,
    padding: 10
  },
  styleExpand: {
    marginTop: 10
  },
  currentQuestion: {
    fontWeight: 'bold',
    fontSize: 14
  },
  scrollContainer: {
    paddingBottom: 80
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
  timeText: {
    color: palette.main[700],
    fontWeight: 'bold',
    fontSize: 16,
    width: '100@ms'
  },
  totalTime: {
    color: palette.grey[500],
    fontSize: 14,
    fontWeight: 500
  }
})

export default DoTextbook
