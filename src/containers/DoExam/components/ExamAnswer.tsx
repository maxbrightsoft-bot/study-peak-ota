import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import _ from 'lodash'
import { QuestionAnswerType } from '../../../utils/enums'
import { palette, TYPO } from '@/theme'
import StarSwitch from '@/components/Switch/StarSwitch'
import { ExamQuestion, Question } from '../config/types'
import { Formik } from 'formik'
import * as Yup from 'yup'
import AnswerContent from './AnswerContent'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  t: any
  isDisable: boolean
  question: Question
  updateQuestionAnswer: ({ questionId, textualAnswers, answer }: ExamQuestion) => void
  updateQuestionStar: any
}

const schema = (t: any) => {
  return Yup.object().shape({
    textualAnswers: Yup.array()
      .of(Yup.string().trim().required(t('correct_answer_is_required')))
      .min(1, t('correct_answer_is_required'))
      .required(t('correct_answer_is_required'))
  })
}

const ExamAnswer = ({ t, question, isDisable, updateQuestionAnswer, updateQuestionStar }: Props) => {
  const answers = question.textualAnswers?.length ? question.textualAnswers : ['']
  
  const renderAnswer = (question: Question, type: QuestionAnswerType) => {
    switch (type) {
      case QuestionAnswerType.ShortAnswer:
      case QuestionAnswerType.OrderMatters:
      case QuestionAnswerType.OrderDoesNotMatters:
      case QuestionAnswerType.SynonymProcessing:
        return (
          <Formik
            initialValues={{
              textualAnswers: answers
            }}
            validationSchema={schema(t)}
            onSubmit={(values: any) => {
              updateQuestionAnswer({
                questionId: question.id,
                textualAnswers: values.textualAnswers
              })
            }}
            enableReinitialize
          >
            {({ values, errors, handleSubmit }) => (
              <>
                <AnswerContent
                  t={t}
                  question={question}
                  questionNumber={question.questionOrder + 1}
                  errors={errors}
                  values={values}
                />
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    !values.textualAnswers.length ||
                      (values.textualAnswers.some((i: string) => !i.trim().length) && { opacity: 0.5 })
                  ]}
                  disabled={
                    !values.textualAnswers.length || values.textualAnswers.some((i: string) => !i.trim().length)
                  }
                  onPress={isDisable ? undefined : () => handleSubmit(values)}
                >
                  <Text style={styles.confirmButtonText}>{t('registration')}</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        )

      case QuestionAnswerType.MultipleChoice:
      case QuestionAnswerType.SingleChoice:
        return (
          <View style={{ gap: 4, width: '100%' }}>
            {Array.from({ length: question.answerCount }, (_, indexAnswer) => (
              <TouchableOpacity
                key={indexAnswer}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  marginBottom: 4,
                  alignItems: 'center',
                  paddingVertical: 8,
                  backgroundColor: question.selectedAnswers?.includes(indexAnswer + 1) ? palette.main[500] : 'white',
                  borderColor: question.selectedAnswers?.includes(indexAnswer + 1)
                    ? palette.main[500]
                    : palette.grey[300]
                }}
                onPress={isDisable ? undefined : () =>
                  updateQuestionAnswer({
                    questionId: question.id,
                    answer: indexAnswer + 1
                  })
                }
              >
                <View
                  style={[
                    styles.optionWrap,
                    { borderColor: question.selectedAnswers?.includes(indexAnswer + 1) ? '#FFF' : palette.grey[500] }
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: question.selectedAnswers?.includes(indexAnswer + 1) ? '#FFF' : palette.grey[500]
                      }
                    ]}
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
    <View style={{ gap: 8 }}>
      {renderAnswer(question, question.questionAnswerType)}
      <StarSwitch isStar={question.isStar} isDisable={isDisable} onSwitch={() => updateQuestionStar(question.id, !question.isStar)} />
    </View>
  )
}

const styles = ScaledSheet.create({
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
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '8@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.grey[100],
    paddingVertical: '12@ms'
  },
  confirmButton: {
    backgroundColor: palette.main[500],
    marginBottom: '12@ms'
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.grey[700]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: 'white'
  }
})

export default React.memo(ExamAnswer)
