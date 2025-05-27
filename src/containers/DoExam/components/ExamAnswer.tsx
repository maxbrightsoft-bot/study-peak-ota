import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import _ from 'lodash'
import { QuestionAnswerType } from '../../../utils/enums'
import { palette } from '@/theme'
import useExamAnswer from '../hooks/useExamAnswer'
import StarSwitch from '@/components/Switch/StarSwitch'
import { Question } from '@/utils/types'
import ShortAnswerInput from './ShortAnswerInput'

interface Props {
  question: Question
  updateQuestionAnswer: ({
    questionId,
    value,
    questionAnswerType
  }: {
    questionId: number
    value: any
    questionAnswerType?: QuestionAnswerType
  }) => void
  updateQuestionStar: any
}

const ExamAnswer = ({ question, updateQuestionAnswer, updateQuestionStar }: Props) => {

  const renderAnswer = (question: Question, type: QuestionAnswerType) => {
    switch (type) {
      case QuestionAnswerType.ShortAnswer:
        return (
          <View>
            <ShortAnswerInput
              updateQuestionAnswer={updateQuestionAnswer}
              initValue={question.textualAnswer || question.selectedAnswers}
              question={question}
            />
          </View>
        )

      case QuestionAnswerType.MultipleChoice:
      case QuestionAnswerType.SingleChoice:
        return (
          <View style={{ gap: 8, width: '100%' }}>
            {Array.from({ length: question.answerCount }, (_, indexAnswer) => (
              <TouchableOpacity
                key={indexAnswer}
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderRadius: 8,
                  marginBottom: 10,
                  alignItems: 'center',
                  paddingVertical: 8,
                  backgroundColor: question.selectedAnswers.includes(indexAnswer + 1) ? palette.main[500] : 'white',
                  borderColor: question.selectedAnswers.includes(indexAnswer + 1)
                    ? palette.main[500]
                    : palette.grey[300]
                }}
                onPress={() =>
                  updateQuestionAnswer({
                    questionId: question.id,
                    value: indexAnswer + 1
                  })
                }
              >
                <View
                  style={{
                    ...styles.optionWrap,
                    borderColor: question.selectedAnswers.includes(indexAnswer + 1) ? '#FFF' : palette.grey[500]
                  }}
                >
                  <Text
                    style={{
                      ...styles.optionText,
                      color: question.selectedAnswers.includes(indexAnswer + 1) ? '#FFF' : palette.grey[500]
                    }}
                  >
                    {indexAnswer + 1}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View>
      {renderAnswer(question, question.questionAnswerType)}
      <StarSwitch isStar={question.isStar} onSwitch={() => updateQuestionStar(question.id, !question.isStar)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#f5f5f5'
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  optionWrap: {
    borderRadius: 255,
    borderWidth: 1,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionText: {
    fontSize: 13
  },
  feedbackContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  finishButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  resultsContainer: {
    alignItems: 'center'
  },
  resultsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 15
  },
  resetButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})

export default React.memo(ExamAnswer)
