import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import _ from 'lodash'
import { QuestionAnswerType } from '../../../utils/enums'
import { palette, TYPO } from '@/theme'
import { PreparedQuestionResponse, TextbookQuestion } from '../config/types'
import * as Yup from 'yup'
import AnswerContent from './AnswerContent'
import { Formik } from 'formik'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  t: any
  onClose: () => void
  question: PreparedQuestionResponse
  updateQuestionAnswer: ({ questionId, textualAnswers, answer }: TextbookQuestion) => void
}

const schema = (t: any) => {
  return Yup.object().shape({
    textualAnswers: Yup.array()
      .of(Yup.string().trim().required(t('correct_answer_is_required')))
      .min(1, t('correct_answer_is_required'))
      .required(t('correct_answer_is_required'))
  })
}

const TextbookAnswer = ({ t, question, onClose, updateQuestionAnswer }: Props) => {
  const answers = question.textualAnswers?.length ? question.textualAnswers : ['']

  const renderAnswer = (question: PreparedQuestionResponse, type: QuestionAnswerType) => {
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
              onClose()
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
                  onPress={() => handleSubmit(values)}
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
          <View style={styles.answerRow}>
            {Array.from({ length: question?.answerCount || 0 }).map((_, num) => {
              const isSelected = question?.selectedAnswers?.includes(num + 1)
              return (
                <TouchableOpacity
                  key={num}
                  style={[styles.answerButton, isSelected && styles.selectedAnswerButton]}
                  onPress={() => updateQuestionAnswer({ questionId: question?.id || 0, answer: num + 1 })}
                >
                  <Text style={{ color: isSelected ? '#FFF' : '#222222' }}>{num + 1}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )

      default:
        return null
    }
  }

  return <View style={styles.container}>{renderAnswer(question, question.questionAnswerType)}</View>
}

const styles = ScaledSheet.create({
  container: {},
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
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 15,
    justifyContent: 'space-between'
  },
  answerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedAnswerButton: {
    backgroundColor: palette.main[600],
    color: '#fff'
  },
  navRow: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 34,
    justifyContent: 'space-between'
  },
  actionTitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#222222',
    fontWeight: 500
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

export default React.memo(TextbookAnswer)
