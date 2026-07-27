import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Pressable,
  Keyboard
} from 'react-native'
import { FieldArray, Field } from 'formik'
import { palette } from '@/theme'
import { QuestionAnswerType } from '@/utils/enums'
import { ScaledSheet } from 'react-native-size-matters'
import { Question } from '../config/types'
import MathRichInput from '@/components/Input/MathRichInput'
import TrashIcon from '@/assets/iconJSX/trash'
import PlusIcon from '@/assets/iconJSX/plus'

type Props = {
  t: (key: string, params?: any) => string
  questionNumber: number | string
  question: Question
  errors: any
  values: any
}

const { height: SCREEN_H } = Dimensions.get('window')

const AnswerContent = ({ t, question, questionNumber, errors, values }: Props) => {
  const addable = values.textualAnswers.some((i: string) => !i.trim().length)
  const deletable = values.textualAnswers?.length <= 1
  const isMultipleAnswer =
    question.questionAnswerType === QuestionAnswerType.OrderMatters ||
    question.questionAnswerType === QuestionAnswerType.OrderDoesNotMatters

  return (
    <FieldArray name="textualAnswers">
      {({ push, remove }) => (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
              <View style={styles.answersContainer}>
                {values.textualAnswers?.map((_: string, index: number) => (
                  <View key={index} style={styles.answerItem}>
                    <Text style={styles.correctAnswerText}>{t('correct_answer')}</Text>

                    <View style={styles.answerInputContainer}>
                      <Field name={`textualAnswers[${index}]`}>
                        {({ field, form }: any) => (
                          <MathRichInput
                            key={`math-input-${question.id}-${index}`}
                            style={styles.mathInput}
                            initialValue={field.value}
                            onChange={(text: string) => form.setFieldValue(`textualAnswers[${index}]`, text)}
                          />
                        )}
                      </Field>

                      {!!question.unit && (
                        <Text style={styles.textAnswerValue}>({question.unit})</Text>
                      )}

                      <TouchableOpacity
                        style={[styles.deleteButton, deletable && styles.disabledButton]}
                        disabled={deletable}
                        onPress={() => remove(index)}
                      >
                        <TrashIcon width={12} height={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    {errors.textualAnswers?.[index] && (
                      <Text style={styles.errorText}>{errors.textualAnswers?.[index]}</Text>
                    )}
                  </View>
                ))}
              </View>

              {isMultipleAnswer && (
                <TouchableOpacity
                  style={[styles.addButton, addable && styles.disabledButton]}
                  disabled={addable}
                  onPress={() => push('')}
                >
                  <PlusIcon width={24} height={24} color={palette.main[500]} />
                </TouchableOpacity>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </FieldArray>
  )
}

const styles = ScaledSheet.create({
  container: {
    maxHeight: SCREEN_H * 0.5
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
    marginBottom: '16@ms'
  },
  answerItem: {
    marginBottom: '16@ms'
  },
  correctAnswerText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '8@ms'
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
    minHeight: '135@ms',
    height: '135@ms'
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
    paddingBottom: '24@ms'
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
