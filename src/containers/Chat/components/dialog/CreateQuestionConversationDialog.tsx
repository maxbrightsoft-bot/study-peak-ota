import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
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
  handleChangeExam: (value?: string) => void
  handleChangeCourse: (value?: string) => void
  handleCreateConversation: any
  examSessionValue?: string
  courseValue?: string
  courseOptions: { label: string; value: number }[]
  categoryOptions?: { label: string; value: number }[]
  questionOptions: { label: string; value: number }[]
  examOptions: { label: string; value: string }[]
}

const getValidationSchema = (isExamSelected: boolean, t: any) =>
  Yup.object().shape({
    content: Yup.string().trim().required(t('please_enter_your_question')),
    questionId: isExamSelected
      ? Yup.mixed().required(t('please_select_a_question'))
      : Yup.mixed().nullable()
  })

const CreateQuestionConversationDialog = ({
  t,
  open,
  toggleDialog,
  handleChangeExam,
  handleChangeCourse,
  courseOptions,
  categoryOptions,
  examOptions,
  questionOptions,
  questions,
  handleCreateConversation,
  examSessionValue,
  courseValue
}: Props) => {
  const formikRef = React.useRef<any>(null)

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.setFieldValue('questionId', null)
      if (examSessionValue) {
        formikRef.current.setFieldValue('category', null)
      }
    }
  }, [examSessionValue])

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.setFieldValue('category', null)
    }
  }, [courseValue])

  useEffect(() => {
    if (!open && formikRef.current) {
      formikRef.current.resetForm()
    }
  }, [open])


  return (
    <SlideDrawerRoot visible={open} onClose={toggleDialog}>
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <Formik
            innerRef={formikRef}
            initialValues={{
              content: '',
              questionId: null,
              category: null
            }}
            validationSchema={getValidationSchema(!!examSessionValue, t)}
            onSubmit={(values) => {
              const hasCategory = values.category != null && values.category !== ''
              const hasExam = !hasCategory && !!examSessionValue
              handleCreateConversation({
                ...values,
                courseId: courseValue,
                category: hasCategory ? Number(values.category) : undefined,
                examSessionId: hasExam ? examSessionValue?.split('.')?.[0] : undefined,
                studentExamSessionId: hasExam ? examSessionValue?.split('.')?.[1] : undefined,
                questionId: hasExam ? values.questionId : undefined
              })
            }}
          >
            {({ values, errors, handleChange, handleSubmit, setFieldValue, isSubmitting }) => {
              return (
                <View style={styles.content}>
                  <ScrollView
                    contentContainerStyle={styles.body}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <View>
                      <View style={styles.labelRow}>
                        <Text style={styles.labelText}>
                          {t('half_selection')} <Text style={styles.optionalText}>({t('optional')})</Text>
                        </Text>
                        {!!courseValue && (
                          <TouchableOpacity
                            onPress={() => {
                              handleChangeCourse(undefined)
                              setFieldValue('category', null)
                              setFieldValue('questionId', null)
                            }}
                          >
                            <Text style={styles.clearText}>{t('clear')}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <CustomSelect
                        onValueChange={(v) => {
                          handleChangeCourse(v ? String(v) : undefined)
                          setFieldValue('category', null)
                          if (!v) {
                            setFieldValue('questionId', null)
                          }
                        }}
                        value={courseValue && Number(courseValue)}
                        options={courseOptions}
                        isClearable
                        placeholder={t('select_course_optional')}
                      />
                    </View>
                    {/* Category selection - ẩn khi đã chọn bài thi (test) */}
                    {!!courseValue && !examSessionValue && (
                      <View>
                        <View style={styles.labelRow}>
                          <Text style={styles.labelText}>
                            {t('_category')} <Text style={styles.optionalText}>({t('optional')})</Text>
                          </Text>
                          {values.category != null && values.category !== '' && (
                            <TouchableOpacity
                              onPress={() => {
                                setFieldValue('category', null)
                              }}
                            >
                              <Text style={styles.clearText}>{t('clear')}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <CustomSelect
                          onValueChange={(v) => {
                            const catVal = v ? Number(v) : null
                            setFieldValue('category', catVal)
                            if (catVal != null) {
                              handleChangeExam(undefined)
                              setFieldValue('questionId', null)
                            }
                          }}
                          value={values.category}
                          options={categoryOptions || []}
                          isClearable
                          placeholder={t('select_category_optional')}
                        />
                      </View>
                    )}

                    {/* Test selection - ẩn khi đã chọn danh mục (cate) */}
                    {(values.category == null || values.category === '') && (
                      <>
                        <View>
                          <View style={styles.labelRow}>
                            <Text style={styles.labelText}>
                              {t('test_selection')} <Text style={styles.optionalText}>({t('optional')})</Text>
                            </Text>
                            {!!examSessionValue && (
                              <TouchableOpacity
                                onPress={() => {
                                  handleChangeExam(undefined)
                                  setFieldValue('questionId', null)
                                }}
                              >
                                <Text style={styles.clearText}>{t('clear')}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <CustomSelect
                            onValueChange={(v) => {
                              handleChangeExam(v ? String(v) : undefined)
                              if (!v) setFieldValue('questionId', null)
                              if (v) setFieldValue('category', null)
                            }}
                            value={examSessionValue}
                            options={examOptions}
                            isClearable
                            placeholder={t('select_exam_optional')}
                          />
                          <Text style={styles.examHintSubtext}>
                            {t('you_can_only_select_the_10_most_recent_exams')}
                          </Text>
                        </View>
                        {!!examSessionValue && (
                          <View>
                            <View style={styles.labelRow}>
                              <Text style={styles.labelText}>
                                {t('choose_a_problem')} <Text style={{ color: palette.red[500] }}>*</Text>
                              </Text>
                            </View>
                            <CustomSelect
                              onValueChange={(value) => {setFieldValue('questionId', value)}}
                              value={values.questionId}
                              options={questionOptions}
                              isClearable={false}
                              placeholder={t('select_question')}
                            />
                            {errors.questionId && (
                              <Text style={styles.errorText}>{errors.questionId as string}</Text>
                            )}
                          </View>
                        )}
                      </>
                    )}
                    <View>
                      <View style={styles.labelRow}>
                        <Text style={styles.labelText}>
                          {t('question_content')} <Text style={{ color: palette.red[500] }}>*</Text>
                        </Text>
                      </View>
                      <TextField
                        multiline
                        placeholder={t('please_enter_your_question')}
                        numberOfLines={10}
                        value={values.content}
                        onChangeText={handleChange('content')}
                      />
                      {errors.content && (
                        <Text style={styles.errorText}>{errors.content as string}</Text>
                      )}
                    </View>
                  </ScrollView>
                  <View style={styles.footer}>
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      style={[
                        styles.submitBtn,
                        (!values.content.trim() || (!!examSessionValue && !values.questionId) || isSubmitting) && styles.disabledBtn
                      ]}
                      disabled={!values.content.trim() || (!!examSessionValue && !values.questionId) || isSubmitting}
                    >
                      <Text style={styles.submitText}>{t('registration')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            }}
          </Formik>
        </KeyboardAvoidingView>

      </View>
    </SlideDrawerRoot>
  )
}

export default CreateQuestionConversationDialog

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: '20@ms'
  },
  container: {
    flex: 1,
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
    paddingHorizontal: '20@ms',
    paddingVertical: '24@ms'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8@ms'
  },
  clearText: {
    fontSize: '12@ms',
    color: palette.main[500],
    fontWeight: '500'
  },
  examHintSubtext: {
    fontSize: '11@ms',
    color: palette.grey[400],
    marginTop: '4@ms'
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    backgroundColor: palette.main[50] || '#EFF6FF',
    borderRadius: '8@ms',
    paddingHorizontal: '10@ms',
    paddingVertical: '8@ms',
  },
  hintText: {
    fontSize: '11@ms',
    color: palette.main[600],
    flex: 1,
    lineHeight: '18@ms',
  },
  labelText: {
    fontSize: '12@ms',
    fontWeight: 400,
    color: '#222222',
    lineHeight: '20@ms',
  },
  optionalText: {
    fontSize: '11@ms',
    color: palette.grey[400],
    fontWeight: '400'
  },
  title: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#202B37'
  },
  close: {
    fontSize: '18@ms',
    color: palette.grey[500]
  },
  body: {
    gap: '20@ms',
    paddingBottom: '20@ms'
  },
  label: {
    fontSize: '12@ms',
    fontWeight: '400',
    marginBottom: '8@ms'
  },
  textarea: {
    borderWidth: '1@ms',
    borderColor: '#CED2DA',
    borderRadius: '8@ms',
    padding: '12@ms',
    textAlignVertical: 'top'
  },
  errorInput: {
    borderColor: 'red'
  },
  errorText: {
    color: 'red',
    fontSize: '12@ms',
    marginTop: '4@ms'
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
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms'
  },
  disabledBtn: {
    backgroundColor: palette.grey[200]
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: '22@ms',
    fontSize: '14@ms'
  }
})
