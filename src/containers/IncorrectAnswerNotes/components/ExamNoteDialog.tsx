import React, { FC } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import Select from '@/components/Select/CustomSelect'
import { ScaledSheet } from 'react-native-size-matters'
import Loading from '@/components/Loading'
import { Ionicons } from '@expo/vector-icons'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import TextField from '@/components/Input/TextField'
import { ExamResult, QuestionData, TextbookResult } from '@/utils/types'

interface ExamNoteDialogProps {
  open: boolean
  imageUrl: string
  selectedNote?: any
  handleUploadImage: () => Promise<void>
  isLoadingNotes: boolean
  selectedQuestion?: QuestionData
  questionOptions?: { label: string; value: number }[]
  onClose: () => void
  examResultData?: ExamResult
  textbookResult?: TextbookResult
  onSaveNote: (content: string, questionId: number) => void
}

const schema = Yup.object().shape({
  content: Yup.string().required(),
  questionId: Yup.number()
})

const ExamNoteDialog: FC<ExamNoteDialogProps> = ({
  open,
  imageUrl,
  handleUploadImage,
  isLoadingNotes,
  selectedNote,
  examResultData,
  selectedQuestion,
  questionOptions = [],
  onClose,
  textbookResult,
  onSaveNote
}) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const initialQuestionId = selectedNote ? selectedNote.questionId || 0 : selectedQuestion ? selectedQuestion.id : 0

  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>
            {t('write_a_note_of_incorrect_answers')}
          </Text>
        </View>
        <View></View>
      </View>
      {isLoadingNotes && <Loading isOverlay={false} />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>

        <Formik
          initialValues={{
            content: selectedNote?.content || '',
            questionId: initialQuestionId
          }}
          validationSchema={schema}
          onSubmit={(values) => onSaveNote(values.content, values.questionId)}
        >
          {({ handleChange, handleSubmit, values, setFieldValue }) => {
            const question = examResultData?.questions?.find(i => i.id === values.questionId) || textbookResult?.studentQuestionResults?.find(i => i.id === values.questionId)

            return (
              <>
                <ScrollView style={styles.contentWrapper}>
                  <View>
                    <Text style={styles.labelText}>{t('problem_number')}*</Text>
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
                        options={questionOptions}
                      />
                    )}
                  </View>
                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.labelText}>{t('incorrect_answer_note_contents')}*</Text>
                    <TextField
                      multiline
                      numberOfLines={10}
                      placeholder={t('example_incorrect_answer_note')}
                      value={values.content}
                      onChangeText={handleChange('content')}
                    />
                  </View>
                  <View style={{ marginTop: 20 }}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: palette.grey[500]
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <TouchableOpacity onPress={handleUploadImage}>
                        <Ionicons name="image" size={32} color={palette.grey[500]} />
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
                <View style={styles.footer}>
                  <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleSubmit as any}>
                    <Text style={styles.confirmButtonText}>{t('register')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )
          }}
        </Formik>
      </KeyboardAvoidingView>

    </SlideDrawerRoot>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
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
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  headerText: {
    fontSize: '12@ms',
    lineHeight: '20@ms',
    color: '#222222',
    fontWeight: 500
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  number: {
    fontSize: '16@ms',
    fontWeight: '700',
    lineHeight: '25@ms',
    color: palette.grey[900],
    marginRight: '12@ms'
  },

  metaText: {
    fontSize: '12@ms',
    lineHeight: '20@ms',
    color: palette.grey[400]
  },
  separator: {
    width: '1@ms',
    height: '10@ms',
    backgroundColor: palette.grey[400],
    marginHorizontal: '10@ms'
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '6@ms'
  },

  labelText: {
    fontSize: '12@ms',
    fontWeight: 400,
    color: '#222222',
    lineHeight: '20@ms',
    marginBottom: '10@ms'
  },
  titleText: {
    fontSize: '14@ms',
    fontWeight: 700,
    color: palette.main[700]
  },
  contentWrapper: {
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms'
  },
  footer: {
    marginBottom: '24@ms',
    paddingHorizontal: '20@ms'
  },
  button: {
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.grey[100]
  },
  confirmButton: {
    backgroundColor: palette.main[600]
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
