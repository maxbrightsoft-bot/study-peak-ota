import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Platform,
  Dimensions
} from 'react-native'
import { FieldArray, Field } from 'formik'
import { palette } from '@/theme'
import { QuestionAnswerType } from '@/utils/enums'
import { PreparedQuestionResponse } from '../config/types'
import { ScaledSheet } from 'react-native-size-matters'
import MathRichInput from '@/components/Input/MathRichInput'
import TrashIcon from '@/assets/iconJSX/trash'
import PlusIcon from '@/assets/iconJSX/plus'
import { isTextualAnswerEmpty } from '@/utils/helpers'

type Props = {
  t: (key: string, params?: any) => string
  questionNumber: number | string
  question: PreparedQuestionResponse
  errors: any
  values: any
  disabled?: boolean
  onTextualAnswersChange?: (nextAnswers: string[]) => void
}

const { height: SCREEN_H } = Dimensions.get('window')

let answerKeySeed = 0
const createAnswerKey = () => `tb_ans_${Date.now()}_${++answerKeySeed}`

const AnswerContent = ({ t, question, errors, values, disabled, onTextualAnswersChange }: Props) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const itemLayouts = useRef<{ [key: number]: number }>({})
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  const textualAnswersList =
    values?.textualAnswers && Array.isArray(values.textualAnswers) && values.textualAnswers.length > 0
      ? values.textualAnswers
      : ['']

  // Persistent unique keys per input item so removing item 0 does NOT unmount or corrupt item 1
  const [itemKeys, setItemKeys] = useState<string[]>(() =>
    Array.from({ length: textualAnswersList.length }, createAnswerKey)
  )

  useEffect(() => {
    // When question changes, reset item keys
    setItemKeys(Array.from({ length: textualAnswersList.length }, createAnswerKey))
  }, [question?.id])

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    )
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    )
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const handleInputFocus = useCallback((index: number) => {
    const targetY = itemLayouts.current[index] ?? (index * 110)
    scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY - 10), animated: true })
  }, [])

  const addable = textualAnswersList.some((i: string) => isTextualAnswerEmpty(i))
  const deletable = textualAnswersList.length <= 1
  const isMultipleAnswer =
    question.questionAnswerType === QuestionAnswerType.OrderMatters ||
    question.questionAnswerType === QuestionAnswerType.OrderDoesNotMatters
  const isMultiInput = textualAnswersList.length > 1

  return (
    <FieldArray name="textualAnswers">
      {({ push, remove }) => (
        <ScrollView
          ref={scrollViewRef}
          style={[
            styles.container,
            isKeyboardVisible && styles.containerKeyboardVisible
          ]}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={{ flex: 1 }}>
            <View style={styles.answersContainer}>
              {textualAnswersList.map((_: string, index: number) => {
                const itemKey = itemKeys[index] || `ans_fallback_${index}`
                return (
                  <View
                    key={itemKey}
                    style={styles.answerItem}
                    onLayout={(e) => {
                      itemLayouts.current[index] = e.nativeEvent.layout.y
                    }}
                  >
                    <Text style={styles.correctAnswerText}>
                      {isMultipleAnswer ? `${t('correct_answer')} ${index + 1}` : t('correct_answer')}
                    </Text>

                    <View style={styles.answerInputContainer}>
                      <Field name={`textualAnswers[${index}]`}>
                        {({ field, form }: any) => (
                          <MathRichInput
                            key={itemKey}
                            style={[
                              styles.mathInput,
                              isMultiInput && styles.mathInputCompact
                            ]}
                            value={field?.value || ''}
                            initialValue={field?.value || ''}
                            onFocus={() => handleInputFocus(index)}
                            onChange={(text: string) => {
                              form.setFieldValue(`textualAnswers[${index}]`, text)
                              const nextAnswers = [...textualAnswersList]
                              nextAnswers[index] = text
                              onTextualAnswersChange?.(nextAnswers)
                            }}
                            disabled={disabled}
                          />
                        )}
                      </Field>

                      {!!question.unit && (
                        <Text style={styles.textAnswerValue}>({question.unit})</Text>
                      )}

                      <TouchableOpacity
                        style={[styles.deleteButton, (deletable || disabled) && styles.disabledButton]}
                        disabled={deletable || disabled}
                        onPress={() => {
                          setItemKeys(prev => prev.filter((_, i) => i !== index))
                          remove(index)
                          const nextAnswers = textualAnswersList.filter((_: any, i: number) => i !== index)
                          onTextualAnswersChange?.(nextAnswers)
                        }}
                      >
                        <TrashIcon width={12} height={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>

                    {errors.textualAnswers?.[index] && (
                      <Text style={styles.errorText}>{errors.textualAnswers?.[index]}</Text>
                    )}
                  </View>
                )
              })}
            </View>

            {isMultipleAnswer && (
              <TouchableOpacity
                style={[styles.addButton, (addable || disabled) && styles.disabledButton]}
                disabled={addable || disabled}
                onPress={() => {
                  setItemKeys(prev => [...prev, createAnswerKey()])
                  push('')
                }}
              >
                <PlusIcon width={24} height={24} color={palette.main[500]} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </FieldArray>
  )
}

const styles = ScaledSheet.create({
  container: {
    maxHeight: SCREEN_H * 0.48
  },
  containerKeyboardVisible: {
    maxHeight: SCREEN_H * 0.32
  },
  questionHeader: {
    marginBottom: '16@ms'
  },
  problemNumberText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#212121'
  },
  questionNumberText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.main[500]
  },
  answersContainer: {
    marginBottom: '8@ms'
  },
  answerItem: {
    marginBottom: '10@ms'
  },
  correctAnswerText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '4@ms'
  },
  answerInputContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'stretch',
    gap: '8@ms'
  },
  mathInput: {
    borderWidth: '1@ms',
    borderColor: '#e0e0e0',
    borderRadius: '8@ms',
    flex: 1,
    backgroundColor: '#fff',
    minHeight: '115@ms',
    height: '115@ms'
  },
  mathInputCompact: {
    minHeight: '92@ms',
    height: '92@ms'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: '8@ms',
    borderRadius: '255@ms',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButton: {
    alignItems: 'center',
    paddingBottom: '16@ms'
  },
  disabledButton: {
    opacity: 0.5
  },
  errorText: {
    fontWeight: '500',
    fontSize: '10@ms',
    color: '#F34B4B',
    marginTop: '4@ms'
  },
  textAnswerValue: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#333'
  }
})

export default AnswerContent
