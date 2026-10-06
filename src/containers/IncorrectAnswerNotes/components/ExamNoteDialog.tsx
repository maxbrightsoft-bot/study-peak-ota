import React, { FC, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
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
import { ExamNoteDialogProps } from '../configs/interfaces'
import { getSafeUrl } from '@/utils/helpers'

const schema = Yup.object().shape({
  content: Yup.string().required(),
  questionId: Yup.number()
})

const ExamNoteDialog: FC<ExamNoteDialogProps> = ({
  open,
  imageUrl,
  handleUploadImage,
  handleRemoveImage,
  handleTakePhoto,
  handlePickFromGallery,
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
  const [showImagePicker, setShowImagePicker] = useState(false)

  const initialQuestionId = selectedNote ? selectedNote.questionId || 0 : selectedQuestion ? selectedQuestion.id : 0

  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800] || '#222'} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>
            {selectedNote ? (t('correct_incorrect_answer_notes') || t('edit_note')) : t('write_a_note_of_incorrect_answers')}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      {isLoadingNotes && <Loading isOverlay={false} />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>

        <Formik
          enableReinitialize
          initialValues={{
            content: selectedNote?.content || '',
            questionId: initialQuestionId
          }}
          validationSchema={schema}
          onSubmit={(values) => onSaveNote(values.content, values.questionId)}
        >
          {({ handleChange, handleSubmit, values, setFieldValue }) => {
            const question = examResultData?.questions?.find((i: any) => i.id === values.questionId) || textbookResult?.studentQuestionResults?.find((i: any) => i.id === values.questionId)

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
                    {(() => {
                      const displayImageUrl = imageUrl || selectedNote?.imageUrl;
                      return displayImageUrl ? (
                        <View style={{ position: 'relative', width: 120 }}>
                          <Image
                            key={displayImageUrl}
                            source={{ uri: getSafeUrl(displayImageUrl) }}
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: palette.grey[400]
                            }}
                            resizeMode="cover"
                          />
                          {handleRemoveImage && (
                            <TouchableOpacity
                              onPress={handleRemoveImage}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: palette.error.main,
                                borderRadius: 12,
                                width: 24,
                                height: 24,
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <Ionicons name="close" size={16} color="#fff" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => setShowImagePicker(true)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: palette.grey[300],
                            backgroundColor: '#F8F9FA',
                            alignSelf: 'flex-start'
                          }}
                        >
                          <Ionicons name="camera-outline" size={20} color={palette.grey[700]} />
                          <Text style={{ fontSize: 13, color: palette.grey[700], fontWeight: '500' }}>
                            {t('attach_photo')}
                          </Text>
                        </TouchableOpacity>
                      )
                    })()}
                  </View>
                </ScrollView>
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, (isLoadingNotes || !values.content.trim().length) && { opacity: 0.6 }]}
                    onPress={handleSubmit as any}
                    disabled={isLoadingNotes || !values.content.trim().length}
                  >
                    <Text style={styles.confirmButtonText}>
                      {selectedNote ? (t('save') || t('edit')) : t('registration')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )
          }}
        </Formik>
      </KeyboardAvoidingView>

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

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  backButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'flex-end'
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingTop: '16@ms',
    paddingBottom: '32@ms',
    gap: '10@ms'
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12@ms',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  sheetTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222222'
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '14@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '8@ms',
    borderRadius: '10@ms'
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
    fontWeight: '500',
    color: '#222222'
  },
  sheetCancelButton: {
    marginTop: '6@ms',
    paddingVertical: '12@ms',
    borderRadius: '10@ms',
    backgroundColor: palette.grey[100],
    alignItems: 'center'
  },
  sheetCancelText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[700]
  }
})

export type { ExamNoteDialogProps }
export default ExamNoteDialog
