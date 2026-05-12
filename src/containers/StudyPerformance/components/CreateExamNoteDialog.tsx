import React, { FC } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
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
import { ConversationQuestion } from '@/utils/types'

interface ExamNoteDialogProps {
  open: boolean
  imageUrl: string
  examList: any
  handleUploadImage: () => Promise<void>
  handleRemoveImage: () => void
  isLoadingNotes?: boolean
  onClose: () => void
  examOptions: { label: any; value: any }[]
  courseOptions: { label: any; value: any }[]
  questions?: ConversationQuestion[]
  courseValue?: string
  handleChangeCourse: (value: string) => void
  examSessionValue?: string
  handleChangeExam: (value: string) => void
  questionOptions: { label: string; value: number }[]
  onSaveNote: ({
    content,
    questionId,
    examSessionId,
    studentExamSessionId
  }: {
    content: string
    questionId: number
    examSessionId: number
    studentExamSessionId: number
  }) => void
}

const schema = Yup.object().shape({
  content: Yup.string().required(),
  questionId: Yup.number(),
  studentExamSessionId: Yup.string()
})

const CreateExamNoteDialog: FC<ExamNoteDialogProps> = ({
  open,
  imageUrl,
  questions,
  courseValue,
  examOptions,
  courseOptions,
  examSessionValue,
  handleChangeCourse,
  handleChangeExam,
  questionOptions,
  handleUploadImage,
  handleRemoveImage,
  isLoadingNotes,
  onClose,
  onSaveNote
}) => {
  const { t } = useTranslation()

  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {t('write_a_note_of_incorrect_answers')}
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {isLoadingNotes && <Loading isOverlay={false} />}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <Formik
            initialValues={{
              content: '',
              questionId: examSessionValue && questions?.length ? questions[0]?.superId : 0
            }}
            validationSchema={schema}
            onSubmit={(values) =>
              onSaveNote({
                ...values,
                examSessionId: Number(examSessionValue?.split('.')?.[0]) ?? 0,
                studentExamSessionId: Number(examSessionValue?.split('.')?.[1]) ?? 0
              })
            }
          >
            {({ handleChange, handleSubmit, values, setFieldValue }) => (
              <>
                <ScrollView
                  style={styles.contentWrapper}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View>
                    <Text style={styles.labelText}>{t('half_selection')}</Text>
                    <Select
                      onValueChange={handleChangeCourse}
                      value={courseValue && Number(courseValue)}
                      options={courseOptions}
                    />
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.labelText}>{t('test_selection')}</Text>
                    <Select
                      onValueChange={handleChangeExam}
                      value={examSessionValue}
                      options={examOptions}
                    />
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.labelText}>{t('problem_number')}</Text>
                    <Select
                      onValueChange={(value) => setFieldValue('questionId', value)}
                      value={values.questionId}
                      options={questionOptions}
                    />
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.labelText}>
                      {t('incorrect_answer_note_contents')}
                    </Text>

                    <TextField
                      multiline
                      numberOfLines={10}
                      placeholder={t('example_note')}
                      value={values.content}
                      onChangeText={handleChange('content')}
                    />
                  </View>

                  <View style={{ marginTop: 20, marginBottom: 20 }}>
                    {imageUrl ? (
                      <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={handleUploadImage}>
                          <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={handleRemoveImage}
                        >
                          <Ionicons name="close-circle" size={24} color={palette.red[500]} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.uploadPlaceholder} onPress={handleUploadImage}>
                        <Ionicons name="image" size={32} color={palette.grey[500]} />
                        <Text style={styles.uploadText}>{t('add_image')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleSubmit as any}
                  >
                    <Text style={styles.confirmButtonText}>{t('register')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </KeyboardAvoidingView>

      </View>
    </SlideDrawerRoot>
  )
}

export default CreateExamNoteDialog

const styles = ScaledSheet.create({
  wrapper: {
    flex: 1
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

  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222222'
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  contentWrapper: {
    flex: 1,
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms'
  },

  labelText: {
    fontSize: '12@ms',
    fontWeight: '400',
    color: '#222222',
    lineHeight: 20,
    marginBottom: 10
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.grey[500]
  },

  footer: {
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderTopWidth: 1,
    borderColor: palette.grey[100],
    backgroundColor: '#FFF'
  },

  button: {
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms',
    alignItems: 'center'
  },

  confirmButton: {
    backgroundColor: palette.main[600]
  },

  confirmButtonText: {
    ...TYPO.button2,
    color: 'white'
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative'
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFF',
    borderRadius: 12
  },
  uploadPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.grey[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  uploadText: {
    fontSize: 12,
    color: palette.grey[500],
    marginTop: 4,
    fontWeight: '500'
  }
})