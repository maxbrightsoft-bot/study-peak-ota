import React, { FC } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette, TYPO } from '@/theme'
import Select from '@/components/Select/CustomSelect'
import { ScaledSheet } from 'react-native-size-matters'

interface ExamNoteDialogProps {
  open: boolean
  selectedNote?: any
  selectedQuestion?: any
  questionOptions?: { label: string; value: number }[]
  onClose: () => void
  onSaveNote: (content: string, questionId: number) => void
}

const schema = Yup.object().shape({
  content: Yup.string().required(),
  questionId: Yup.number()
})

const ExamNoteDialog: FC<ExamNoteDialogProps> = ({
  open,
  selectedNote,
  selectedQuestion,
  questionOptions = [],
  onClose,
  onSaveNote
}) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const initialQuestionId = selectedNote ? selectedNote.questionId || 0 : selectedQuestion ? selectedQuestion.id : 0

  return (
    <CommonDialog
      isVisible={open}
      onClose={onClose}
      title={t(selectedNote ? 'correct_incorrect_answer_notes' : 'write_a_note_of_incorrect_answers')}
    >
      <Formik
        initialValues={{
          content: selectedNote?.content || '',
          questionId: initialQuestionId
        }}
        validationSchema={schema}
        onSubmit={(values) => onSaveNote(values.content, values.questionId)}
      >
        {({ handleChange, handleSubmit, values, setFieldValue }) => (
          <>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
              <ScrollView>
                <View style={{ marginBottom: 16 }}>
                  <Text variant="labelLarge" style={{ color: palette.grey[700]}}>{t('problem_number')}</Text>
                  {selectedNote || selectedQuestion ? (
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      {t('number_question', {
                        number: selectedNote
                          ? (selectedNote.questionOrder || 0) + 1
                          : (selectedQuestion?.questionOrder || 0) + 1
                      })}
                    </Text>
                  ) : (
                    <Select
                      onValueChange={(value) => setFieldValue('questionId', value)}
                      value={values.questionId}
                      items={questionOptions}
                    />
                  )}
                </View>

                <View>
                  <Text variant="labelLarge" style={{ color: palette.grey[700]}}>{t('incorrect_answer_note_contents')}</Text>
                  <TextInput
                    multiline
                    numberOfLines={3}
                    style={{
                      borderColor: '#ccc',
                      borderWidth: 1,
                      borderRadius: 4,
                      padding: 8,
                      marginTop: 4,
                      minHeight: 64,
                      textAlignVertical: 'top'
                    }}
                    placeholder={t('the_problem_is_difficult')}
                    value={values.content}
                    onChangeText={handleChange('content')}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.footer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleSubmit as any}>
                <Text style={styles.confirmButtonText}>{t('registration')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
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

export default ExamNoteDialog
