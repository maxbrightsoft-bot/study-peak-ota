import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import _ from 'lodash'
import { QuestionAnswerType, ConfidenceLevel } from '../../../utils/enums'
import { hasAnyTextualAnswer, isTextualAnswerEmpty } from '@/utils/helpers'
import { palette, TYPO } from '@/theme'
import { PreparedQuestionResponse, TextbookQuestion } from '../config/types'
import * as Yup from 'yup'
import AnswerContent from './AnswerContent'
import { Formik } from 'formik'
import { ScaledSheet } from 'react-native-size-matters'
import { toast } from '@/utils/helpers'

interface Props {
  t: any
  onClose: () => void
  isLastQuestion: boolean
  question: PreparedQuestionResponse
  updateQuestionAnswer: ({ questionId, textualAnswers, answer }: TextbookQuestion) => void
  updateQuestionConfidence?: (questionId: number, confidence?: ConfidenceLevel) => void
  disabled?: boolean
}

const schema = (t: any) => {
  return Yup.object().shape({
    textualAnswers: Yup.array()
      .of(Yup.string().trim().required(t('correct_answer_is_required')))
      .min(1, t('correct_answer_is_required'))
      .required(t('correct_answer_is_required'))
  })
}

const TextbookAnswer = ({ t, question, isLastQuestion, onClose, updateQuestionAnswer, updateQuestionConfidence, disabled }: Props) => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(question?.selectedAnswers ?? [])
  const [confidence, setConfidence] = useState<ConfidenceLevel | undefined>(question?.confidence)
  const confidenceRef = useRef<ConfidenceLevel | undefined>(question?.confidence)
  const answers = question.textualAnswers?.length ? question.textualAnswers : ['']
  useEffect(() => {
    setSelectedAnswers(question?.selectedAnswers ?? [])
    setConfidence(question?.confidence)
    confidenceRef.current = question?.confidence
  }, [question?.id, question?.confidence])

  const handleSelectAnswer = (num: number, type: QuestionAnswerType) => {
    if (disabled) return
    let nextSelected: number[]
    const isMultiple = type === QuestionAnswerType.MultipleChoice
    const maxAllowed = (question?.answerCount || 0) > 0 ? (question?.answerCount || 0) - 1 : 0

    if (isMultiple) {
      if (selectedAnswers.includes(num)) {
        nextSelected = selectedAnswers.filter((a) => a !== num)
      } else {
        if (maxAllowed > 0 && selectedAnswers.length >= maxAllowed) {
          nextSelected = [...selectedAnswers.slice(1), num]
        } else {
          nextSelected = [...selectedAnswers, num]
        }
      }
    } else {
      nextSelected = selectedAnswers.includes(num) ? [] : [num]
    }

    setSelectedAnswers(nextSelected)
    updateQuestionAnswer({ questionId: question?.id || 0, answer: num })
  }

  const handleConfidenceSelect = (level: ConfidenceLevel) => {
    if (disabled) return
    confidenceRef.current = level
    setConfidence(level)
    updateQuestionConfidence?.(question.id, level)
  }

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
              if (disabled) return
                            updateQuestionAnswer({
                questionId: question.id,
                textualAnswers: values.textualAnswers,
                confidence: confidenceRef.current
              })
              isLastQuestion && onClose()
            }}
            enableReinitialize
          >
            {({ values, errors, handleSubmit }) => {
              const isButtonDisabled =
                disabled ||
                !values.textualAnswers?.length ||
                values.textualAnswers.some((i: string) => isTextualAnswerEmpty(i))

              return (
                <>
                  <AnswerContent
                    t={t}
                    question={question}
                    questionNumber={
                      question.parentQuestionId
                        ? `${(question.parentQuestionOrder || 0) + 1}-(${question.questionOrder + 1})`
                        : question.questionOrder + 1
                    }
                    errors={errors}
                    values={values}
                    disabled={disabled}
                                      />
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                      isButtonDisabled && styles.disabledButton
                    ]}
                    disabled={isButtonDisabled}
                    onPress={() => !isButtonDisabled && handleSubmit()}
                  >
                    <Text style={[styles.confirmButtonText, isButtonDisabled && { color: palette.grey[500] }]}>{t('registration')}</Text>
                  </TouchableOpacity>
                </>
              )
            }}
          </Formik>
        )

      case QuestionAnswerType.MultipleChoice:
      case QuestionAnswerType.MultipleCorrectAnswers:
      case QuestionAnswerType.SingleChoice: {
        const isManyAnswers = (question?.answerCount || 0) > 5
        return (
          <View>
            {isManyAnswers && (
              <View style={styles.scrollHintContainer}>
                <Ionicons name="swap-horizontal" size={14} color={palette.grey[500]} />
                <Text style={styles.scrollHintText}>{t('scroll_horizontal')}</Text>
              </View>
            )}
            {isManyAnswers ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.answerScrollContainer}
              >
                {Array.from({ length: question?.answerCount || 0 }).map((_, num) => {
                  const isSelected = selectedAnswers?.includes(num + 1)
                  return (
                    <TouchableOpacity
                      key={num}
                      disabled={disabled}
                      style={[
                        styles.answerButtonScroll,
                        isSelected && styles.selectedAnswerButton,
                        disabled && { opacity: 0.6 }
                      ]}
                      onPress={() => {
                        if (disabled) return
                        handleSelectAnswer(num + 1, question.questionAnswerType)
                        isLastQuestion && onClose()
                      }}
                    >
                      <Text style={{ color: isSelected ? '#FFF' : '#222222', fontSize: 15, fontWeight: '600' }}>
                        {num + 1}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            ) : (
              <View style={styles.answerRow}>
                {Array.from({ length: question?.answerCount || 0 }).map((_, num) => {
                  const isSelected = selectedAnswers?.includes(num + 1)
                  return (
                    <TouchableOpacity
                      key={num}
                      disabled={disabled}
                      style={[
                        styles.answerButton,
                        isSelected && styles.selectedAnswerButton,
                        disabled && { opacity: 0.6 }
                      ]}
                      onPress={() => {
                        if (disabled) return
                        handleSelectAnswer(num + 1, question.questionAnswerType)
                        isLastQuestion && onClose()
                      }}
                    >
                      <Text style={{ color: isSelected ? '#FFF' : '#222222' }}>{num + 1}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        )
      }

      default:
        return null
    }
  }

    const renderConfidenceSelector = () => {
    return (
      <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: palette.grey[200] }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: palette.grey[800], marginBottom: 10, textAlign: 'center' }}>
          {t('how_confident')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
          <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 6,
              borderRadius: 10,
              borderWidth: confidence === ConfidenceLevel.Sure ? 1.5 : 1,
              borderColor: confidence === ConfidenceLevel.Sure ? palette.confidence.sure.border : '#E5E7EB',
              backgroundColor: confidence === ConfidenceLevel.Sure ? palette.confidence.sure.border : '#F9FAFB',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => handleConfidenceSelect(ConfidenceLevel.Sure)}
          >
            <Text style={{ color: confidence === ConfidenceLevel.Sure ? palette.common.white : '#4B5563', fontWeight: '700', fontSize: 13 }}>
              ○ {t('confidence_sure')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 6,
              borderRadius: 10,
              borderWidth: confidence === ConfidenceLevel.Unsure ? 1.5 : 1,
              borderColor: confidence === ConfidenceLevel.Unsure ? palette.confidence.unsure.border : '#E5E7EB',
              backgroundColor: confidence === ConfidenceLevel.Unsure ? palette.confidence.unsure.border : '#F9FAFB',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => handleConfidenceSelect(ConfidenceLevel.Unsure)}
          >
            <Text style={{ color: confidence === ConfidenceLevel.Unsure ? palette.common.white : '#4B5563', fontWeight: '700', fontSize: 13 }}>
              △ {t('confidence_unsure')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 6,
              borderRadius: 10,
              borderWidth: confidence === ConfidenceLevel.Random ? 1.5 : 1,
              borderColor: confidence === ConfidenceLevel.Random ? palette.confidence.random.border : '#E5E7EB',
              backgroundColor: confidence === ConfidenceLevel.Random ? palette.confidence.random.border : '#F9FAFB',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => handleConfidenceSelect(ConfidenceLevel.Random)}
          >
            <Text style={{ color: confidence === ConfidenceLevel.Random ? palette.common.white : '#4B5563', fontWeight: '700', fontSize: 13 }}>
              × {t('confidence_random')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderAnswer(question, question.questionAnswerType)}
      {renderConfidenceSelector()}
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {},
  question: {
    fontSize: '20@ms',
    fontWeight: 'bold',
    marginBottom: '20@ms',
    textAlign: 'center'
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    padding: '15@ms',
    borderRadius: '8@ms',
    marginBottom: '10@ms'
  },
  optionWrap: {
    borderRadius: '255@ms',
    borderWidth: '1@ms',
    width: '18@ms',
    height: '18@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionText: {
    fontSize: '13@ms'
  },
  feedbackContainer: {
    marginTop: '20@ms',
    alignItems: 'center'
  },
  feedbackText: {
    fontSize: '18@ms',
    fontWeight: 'bold',
    marginBottom: '15@ms',
    textAlign: 'center'
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: '15@ms',
    borderRadius: '8@ms'
  },
  answerRow: {
    flexDirection: 'row',
    gap: '16@ms',
    justifyContent: 'space-between'
  },
  answerScrollContainer: {
    flexDirection: 'row',
    gap: '12@ms',
    paddingHorizontal: '4@ms',
    alignItems: 'center'
  },
  answerButton: {
    flex: 1,
    height: '50@ms',
    borderRadius: '25@ms',
    borderWidth: '1@ms',
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  answerButtonScroll: {
    width: '50@ms',
    height: '50@ms',
    borderRadius: '25@ms',
    borderWidth: '1@ms',
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4@ms',
    marginBottom: '10@ms'
  },
  scrollHintText: {
    fontSize: '12@ms',
    color: palette.grey[500],
    fontWeight: '500'
  },
  selectedAnswerButton: {
    backgroundColor: palette.main[600],
    color: '#fff'
  },
  navRow: {
    paddingVertical: '12@ms',
    paddingHorizontal: '20@ms',
    flexDirection: 'row',
    gap: '8@ms',
    paddingBottom: '34@ms',
    justifyContent: 'space-between'
  },
  actionTitle: {
    fontSize: '14@ms',
    lineHeight: '22@ms',
    color: '#222222',
    fontWeight: 500
  },
  nextButtonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  finishButton: {
    backgroundColor: '#28a745',
    padding: '15@ms',
    borderRadius: '8@ms'
  },
  finishButtonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  resultsContainer: {
    alignItems: 'center'
  },
  resultsText: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    marginBottom: '20@ms'
  },
  scoreText: {
    fontSize: '18@ms',
    marginBottom: '15@ms'
  },
  resetButton: {
    backgroundColor: '#6c757d',
    padding: '15@ms',
    borderRadius: '8@ms'
  },
  resetButtonText: {
    color: '#fff',
    fontSize: '16@ms',
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
  disabledButton: {
    backgroundColor: palette.grey[300],
    opacity: 0.6
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
