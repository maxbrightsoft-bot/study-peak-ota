import React, { useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { palette, TYPO } from '@/theme'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { ConversationQuestion, ExamSessionResponse } from '@/utils/types'
import { Course } from '../../configs/types'
import CustomSelect from '@/components/Select/CustomSelect'
import TextField from '@/components/Input/TextField'

type Props = {
  t: any
  open: boolean
  toggleDialog: () => void
  exams?: Array<ExamSessionResponse>
  courses?: Course[]
  questions?: Array<ConversationQuestion>
  handleChangeExam: (value: string) => void
  handleChangeCourse: (value: string) => void
  handleCreateConversation: any
  examSessionValue?: string
  courseValue?: string
  courseOptions: { label: string; value: number }[]
  questionOptions: { label: string; value: number }[]
  examOptions: { label: string; value: string }[]
}

const schema = Yup.object().shape({
  content: Yup.string().required()
})

export default function CreateQuestionConversationDialog({
  t,
  open,
  toggleDialog,
  handleChangeExam,
  handleChangeCourse,
  courseOptions,
  examOptions,
  questionOptions,
  questions,
  handleCreateConversation,
  examSessionValue,
  courseValue
}: Props) {
  return (
    <SlideDrawerRoot visible={open}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={toggleDialog}>
            <Ionicons name="close" size={20} color={palette.grey[900]} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>{t('ask_a_question')}</Text>
          </View>
          <View></View>
        </View>
        <Formik
          enableReinitialize
          initialValues={{
            content: '',
            questionId: examSessionValue && questions ? questions[0]?.superId : null
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            handleCreateConversation({
              ...values,
              courseId: courseValue,
              examSessionId: examSessionValue?.split('.')?.[0],
              studentExamSessionId: examSessionValue?.split('.')?.[1]
            })
          }}
        >
          {({ values, errors, handleChange, handleSubmit, setFieldValue }) => {
            useEffect(() => {
              if (examSessionValue && questions?.length) {
                setFieldValue('questionId', questions[0].id)
              }
            }, [examSessionValue, questions])

            return (
              <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                  <View>
                    <Text style={styles.labelText}>{t('half_selection')}</Text>
                    <CustomSelect
                      onValueChange={handleChangeCourse}
                      value={courseValue && Number(courseValue)}
                      options={courseOptions}
                    />
                  </View>
                  <View>
                    <Text style={styles.labelText}>{t('test_selection')}</Text>
                    <CustomSelect onValueChange={handleChangeExam} value={examSessionValue} options={examOptions} />
                  </View>
                  <View>
                    <Text style={styles.labelText}>문제 선택</Text>
                    <CustomSelect
                      onValueChange={(value) => setFieldValue('questionId', value)}
                      value={values.questionId}
                      options={questionOptions}
                    />
                  </View>
                  <View>
                    <Text style={styles.labelText}>{t('question_content')}</Text>
                    <TextField
                      multiline
                      placeholder={t('please_enter_your_question')}
                      numberOfLines={10}
                      value={values.content}
                      onChangeText={handleChange('content')}
                    />
                  </View>
                  <View style={styles.footer}>
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      style={[styles.submitBtn, !values.content.trim() && styles.disabledBtn]}
                      disabled={!values.content.trim()}
                    >
                      <Text style={styles.submitText}>{t('registration')}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            )
          }}
        </Formik>
      </View>
    </SlideDrawerRoot>
  )
}

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20
  },
  container: {
    backgroundColor: palette.bg[100]
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms',
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  labelText: {
    fontSize: '12@ms',
    fontWeight: 400,
    color: '#222222',
    lineHeight: 20,
    marginBottom: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202B37'
  },
  close: {
    fontSize: 18,
    color: palette.grey[500]
  },
  body: {
    gap: 20,
    paddingBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#CED2DA',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top'
  },
  errorInput: {
    borderColor: 'red'
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  submitBtn: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: palette.main[600],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  disabledBtn: {
    backgroundColor: palette.grey[200]
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    fontSize: 14
  }
})
