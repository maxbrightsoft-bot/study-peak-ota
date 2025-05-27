import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { HelperText, Text } from 'react-native-paper'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import CustomSelect from '@/components/Select/CustomSelect'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  openCreateQuestionDialog: boolean
  onCloseCreateQuestion: () => void
  handleCreateQuestion: (data: any) => void
  studentTextbookId?: number
  selectedQuestion?: { id: number }
  examSessionId?: number
  questionOptions: { label: string; value: number }[]
}

const schema = Yup.object().shape({
  content: Yup.string().required('Please enter your question.')
})

const CreateNewQuestionDialog: React.FC<Props> = ({
  openCreateQuestionDialog,
  onCloseCreateQuestion,
  handleCreateQuestion,
  examSessionId,
  studentTextbookId,
  selectedQuestion,
  questionOptions
}) => {
  const { t } = useTranslation()
  const formik = useFormik({
    initialValues: {
      content: '',
      questionId: selectedQuestion?.id || 0
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: (values) => {
      handleCreateQuestion({ ...values, examSessionId, studentTextbookId })
    }
  })

  console.log({ questionOptions });

  return (
    <CommonDialog isVisible={openCreateQuestionDialog} onClose={onCloseCreateQuestion} title={t('ask_a_question')}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView>
          <View style={{ marginBottom: 16 }}>
            <Text variant="labelLarge" style={{ color: palette.grey[700]}}> {t('questions_to_ask')}</Text>
            <CustomSelect
              value={questionOptions.find((q) => q.value === formik.values.questionId)?.label || ''}
              onValueChange={({ value }: { value: string }) => formik.setFieldValue('questionId', value)}
              items={questionOptions}
            />
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text variant="labelLarge" style={{ color: palette.grey[700]}}>{t('question_content')}</Text>
            <TextInput
              multiline
              style={{
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 4,
                padding: 8,
                marginTop: 4,
                minHeight: 64,
                textAlignVertical: 'top'
              }}
              numberOfLines={3}
              placeholder={t('the_problem_is_difficult')}
              value={formik.values.content}
              onChangeText={formik.handleChange('content')}
              onBlur={formik.handleBlur('content')}
              // error={formik.touched.content && !!formik.errors.content}
            />
            <HelperText type={formik.errors.content ? 'error' : 'info'}>
              {formik.errors.content
                ? t('your_questions_will_be_sent_to_the_counselor')
                : t('please_enter_your_question')}
            </HelperText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCloseCreateQuestion}>
          <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={formik.handleSubmit as any}
          disabled={!formik.values.content.trim().length}
        >
          <Text style={styles.confirmButtonText}>{t('registration')}</Text>
        </TouchableOpacity>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  labelText: {
    fontSize: '13@ms',
    fontWeight: 600,
    color: palette.grey[700],
    width: '100@ms'
  },
  titleText: {
    fontSize: '14@ms',
    fontWeight: 700,
    color: palette.main[700]
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    borderTopWidth: 1,
    borderTopColor: palette.grey[200]
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '8@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.grey[100]
  },
  confirmButton: {
    backgroundColor: palette.main[500]
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

export default CreateNewQuestionDialog
