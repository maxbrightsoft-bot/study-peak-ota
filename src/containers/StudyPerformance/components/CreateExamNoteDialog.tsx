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
import { getSafeUrl } from '@/utils/helpers'

interface ExamNoteDialogProps {
  open: boolean
  imageUrl: string
  examList: any
  handleUploadImage?: () => Promise<void>
  handleTakePhoto?: () => Promise<void>
  handlePickFromGallery?: () => Promise<void>
  handleRemoveImage: () => void
  isLoadingNotes?: boolean
  onClose: () => void
  examOptions: { label: string; value: string }[]
  courseOptions: { label: string; value: number }[]
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
    studentExamSessionId,
    courseId
  }: {
    content: string
    questionId?: number | null
    examSessionId?: number
    studentExamSessionId?: number
    courseId?: number
  }) => void
}

const schema = Yup.object().shape({
  content: Yup.string().required(),
  questionId: Yup.mixed().nullable()
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
  handleTakePhoto,
  handlePickFromGallery,
  handleRemoveImage,
  isLoadingNotes,
  onClose,
  onSaveNote
}) => {
  const { t } = useTranslation()
  const [showImagePicker, setShowImagePicker] = React.useState(false)
  const formikRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (formikRef.current) {
      formikRef.current.setFieldValue('questionId', null)
    }
  }, [examSessionValue])

  React.useEffect(() => {
    if (!open && formikRef.current) {
      formikRef.current.resetForm()
    }
  }, [open])

  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color={palette.grey[900]} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {t('write_a_note_of_incorrect_answers')}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {isLoadingNotes && <Loading isOverlay={false} />}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <Formik
            innerRef={formikRef}
            initialValues={{
              content: '',
              questionId: null
            }}
            validationSchema={schema}
            onSubmit={(values) =>
              onSaveNote({
                ...values,
                courseId: courseValue ? Number(courseValue) : undefined,
                examSessionId: examSessionValue ? Number(examSessionValue.split('.')?.[0]) : undefined,
                studentExamSessionId: examSessionValue ? Number(examSessionValue.split('.')?.[1]) : undefined
              })
            }
          >
            {({ handleChange, handleSubmit, values, setFieldValue }) => {
              console.log({ values });
              
              return(
              <>
                <ScrollView
                  style={styles.contentWrapper}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.hintBox}>
                    <Ionicons name="information-circle-outline" size={15} color={palette.main[500]} />
                    <Text style={styles.hintText}>{t('select_class_or_exam_hint')}</Text>
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <View style={styles.labelRow}>
                      <Text style={styles.labelText}>{t('half_selection')}</Text>
                    </View>
                    <Select
                      onValueChange={(v) => {
                        handleChangeCourse(v as any)
                        if (!v) {
                          setFieldValue('questionId', null)
                        }
                      }}
                      value={courseValue && Number(courseValue)}
                      options={courseOptions}
                      placeholder={t('select_placeholder')}
                    />
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <View style={styles.labelRow}>
                      <Text style={styles.labelText}>{t('test_selection')}</Text>
                    </View>
                    <Select
                      onValueChange={(v) => {
                        handleChangeExam(v as any)
                        if (!v) setFieldValue('questionId', null)
                      }}
                      value={examSessionValue}
                      options={examOptions}
                      placeholder={t('select_placeholder')}
                    />
                  </View>

                  {!!examSessionValue && (
                    <View style={{ marginTop: 20 }}>
                      <View style={styles.labelRow}>
                        <Text style={styles.labelText}>{t('problem_number')}</Text>
                      </View>
                      <Select
                        onValueChange={(value) => setFieldValue('questionId', value)}
                        value={values.questionId}
                        options={questionOptions}
                        placeholder={t('select_placeholder')}
                      />
                    </View>
                  )}

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
                        <TouchableOpacity onPress={() => setShowImagePicker(true)}>
                          <Image
                            key={imageUrl}
                            source={{ uri: getSafeUrl(imageUrl) }}
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
                      <TouchableOpacity
                        style={styles.uploadPlaceholder}
                        onPress={() => setShowImagePicker(true)}
                      >
                        <Ionicons name="camera-outline" size={28} color={palette.grey[600]} />
                        <Text style={styles.uploadText}>{t('attach_photo')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                    ]}
                    onPress={handleSubmit as any}
                  >
                    <Text style={[styles.confirmButtonText]}>{t('register')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            }
          </Formik>
        </KeyboardAvoidingView>

      </View>

      {showImagePicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowImagePicker(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('select_image_source')}</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={palette.grey[600]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowImagePicker(false)
                setTimeout(() => {
                  handleTakePhoto?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#EBF5FF' }]}>
                <Ionicons name="camera" size={22} color={palette.main[500]} />
              </View>
              <Text style={styles.optionText}>{t('take_photo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowImagePicker(false)
                setTimeout(() => {
                  handlePickFromGallery?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="images" size={22} color="#16a34a" />
              </View>
              <Text style={styles.optionText}>{t('choose_from_gallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelButton}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.sheetCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100]
  },

  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222222'
  },

  backButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: '20@ms',
    marginBottom: '10@ms'
  },

  image: {
    width: '120@ms',
    height: '120@ms',
    borderRadius: '8@ms',
    borderWidth: '1@ms',
    borderColor: palette.grey[500]
  },

  footer: {
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderTopWidth: '1@ms',
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
    width: '120@ms',
    height: '120@ms',
    position: 'relative'
  },
  removeImageButton: {
    position: 'absolute',
    top: '-10@ms',
    right: '-10@ms',
    backgroundColor: '#FFF',
    borderRadius: '12@ms'
  },
  uploadPlaceholder: {
    width: '120@ms',
    height: '120@ms',
    borderRadius: '8@ms',
    borderWidth: '1@ms',
    borderStyle: 'dashed',
    borderColor: palette.grey[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  uploadText: {
    fontSize: '12@ms',
    color: palette.grey[500],
    marginTop: '4@ms',
    fontWeight: '500'
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    marginBottom: '8@ms'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 999
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingTop: '20@ms',
    paddingBottom: Platform.OS === 'ios' ? '36@ms' : '24@ms',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16@ms'
  },
  sheetTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#222'
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '14@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: '14@ms'
  },
  optionIconCircle: {
    width: '42@ms',
    height: '42@ms',
    borderRadius: '21@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionText: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#333'
  },
  sheetCancelButton: {
    marginTop: '12@ms',
    paddingVertical: '14@ms',
    borderRadius: '10@ms',
    backgroundColor: '#F3F4F6',
    alignItems: 'center'
  },
  sheetCancelText: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#666'
  }
})