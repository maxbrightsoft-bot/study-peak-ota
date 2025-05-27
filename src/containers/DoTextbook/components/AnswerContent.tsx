import React from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { FieldArray, Field } from 'formik'
import { palette, TYPO } from '@/theme'
import { QuestionAnswerType } from '@/utils/enums'
import { PreparedQuestionResponse } from '../config/types'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: (key: string, params?: any) => string
  questionNumber: number
  question: PreparedQuestionResponse
  errors: any
  values: any
}

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
          <ScrollView style={styles.container}>
            <View style={styles.answersContainer}>
              {values.textualAnswers?.map((_: string, index: number) => (
                <View key={index} style={styles.answerItem}>
                  <Text style={styles.correctAnswerText}>{t('correct_answer')}</Text>

                  <View style={styles.answerInputContainer}>
                    <Field name={`textualAnswers[${index}]`}>
                      {({ field }: any) => (
                        <TextInput
                          style={styles.textInput}
                          value={field.value}
                          onChangeText={field.onChange(`textualAnswers[${index}]`)}
                          onBlur={field.onBlur}
                        />
                      )}
                    </Field>

                    <TouchableOpacity
                      style={[styles.deleteButton, deletable && styles.disabledButton]}
                      disabled={deletable}
                      onPress={() => remove(index)}
                    >
                      <Ionicons name="trash-sharp" size={12} color={"#FFF"} />
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
                <Ionicons name="add-circle" size={24} color={palette.main[500]} />
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </FieldArray>
  )
}

const styles = ScaledSheet.create({
  container: {
  },
  questionHeader: {
    marginBottom: 16
  },
  problemNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121'
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.main[500]
  },
  answersContainer: {
    marginBottom: 16
  },
  answerItem: {
    marginBottom: 16
  },
  correctAnswerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8
  },
  answerInputContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    gap: 8
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    flex: 1,
    backgroundColor: '#fff'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 255
  },
  addButton: {
    alignItems: 'center',
    paddingBottom: 24
  },
  disabledButton: {
    opacity: 0.5
  },
  errorText: {
    fontWeight: '500',
    fontSize: 10,
    color: '#F34B4B',
    marginTop: 4
  },
})

export default AnswerContent
