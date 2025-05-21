import React from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { Formik, FieldArray, Field } from 'formik'
import { palette } from '@/theme'
import { QuestionAnswerType } from '@/utils/enums'
import { PreparedQuestionResponse } from '../config/types'
import { Ionicons } from '@expo/vector-icons'

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
            <View style={styles.questionHeader}>
              <Text style={styles.problemNumberText}>{t('problem_number')}</Text>
              <Text style={styles.questionNumberText}>{t('number_question', { number: questionNumber })}</Text>
            </View>

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
                      <Ionicons name="trash" size={12} color="#fff" />
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
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </FieldArray>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxHeight: '60%'
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
    alignItems: 'center',
    gap: 8
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fff'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 4,
    width: 40,
    alignItems: 'center',
    marginTop: 8
  },
  disabledButton: {
    opacity: 0.5
  },
  errorText: {
    fontWeight: '500',
    fontSize: 10,
    color: '#F34B4B',
    marginTop: 4
  }
})

export default AnswerContent
