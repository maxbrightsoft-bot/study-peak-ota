import React, { FC } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
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
import TrashIcon from '@/assets/iconJSX/trashv2'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import { getSafeUrl } from '@/utils/helpers'

interface ExamNoteDialogProps {
  open: boolean
  imageUrl: string
  selectedNote?: any
  handleUploadImage?: () => Promise<void>
  handleTakePhoto?: () => Promise<void>
  handlePickFromGallery?: () => Promise<void>
  handleRemoveImage?: () => void
  isLoadingNotes: boolean
  questionOptions?: { label: string; value: number }[]
  onClose: () => void
  onSaveNote: (content: string, questionId: number) => void
  onDeleteNote: () => void
  openConfirm: boolean
  handleDeleteNote: () => Promise<void>
  toggleConfirmDialog: () => void
}

const schema = Yup.object().shape({
  content: Yup.string().required(),
  questionId: Yup.number()
})

const NoteDialog: FC<ExamNoteDialogProps> = ({
  open,
  imageUrl,
  openConfirm,
  toggleConfirmDialog,
  handleDeleteNote,
  handleUploadImage,
  handleTakePhoto,
  handlePickFromGallery,
  handleRemoveImage,
  isLoadingNotes,
  selectedNote,
  questionOptions = [],
  onClose,
  onSaveNote,
  onDeleteNote
}) => {
  const { t } = useTranslation()
  const [showImagePicker, setShowImagePicker] = React.useState(false)

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
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#222222' }}>{t('incorrect_answer_note_details')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      {isLoadingNotes && <Loading isOverlay={false} />}
      <View style={{ backgroundColor: palette.bg[100], flex: 1 }}>
        <Formik
          initialValues={{
            content: selectedNote?.content || '',
            questionId: selectedNote?.questionId || 0
          }}
          validationSchema={schema}
          onSubmit={(values) => onSaveNote(values.content, values.questionId)}
        >
          {({ handleChange, handleSubmit, values, dirty, setFieldValue }) => {
            return (
              <>
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  keyboardVerticalOffset={80}
                >
                  <ScrollView
                    style={styles.contentWrapper}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={{ marginTop: 12 }}>
                      <View style={styles.headerRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              backgroundColor: '#222222',
                              color: '#FFF',
                              paddingVertical: 2,
                              paddingHorizontal: 8,
                              borderRadius: 43
                            }}
                          >
                            {selectedNote?.subjectName}
                          </Text>
                          <Text style={[styles.headerText, { color: '#222222' }]}>{selectedNote.title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center' }}>
                          <Text style={styles.headerText}>{selectedNote?.categoryName}</Text>
                          {!!selectedNote?.page && selectedNote?.page > 0 && (
                            <>
                              <View style={styles.separator} />
                              <Text style={styles.headerText}>p.{selectedNote?.page}</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                    <View>
                      <Text style={styles.labelText}>{t('problem_number')}</Text>
                      <Select value={values.questionId} options={questionOptions} disabled={true} />
                    </View>

                    <View style={{ marginTop: 20 }}>
                      <Text style={styles.labelText}>{t('incorrect_answer_note_contents')}</Text>
                      <TextField
                        multiline
                        numberOfLines={10}
                        placeholder={t('example_notes')}
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
                </KeyboardAvoidingView>
                <View style={styles.footer}>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDeleteNote as any}>
                    <TrashIcon />
                    <Text style={styles.confirmButtonText}>{t('delete')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, { backgroundColor: palette.main[600] }]}
                    onPress={handleSubmit as any}
                  >
                    <Text style={[styles.confirmButtonText, { color: "#FFF" }]}>{t('register')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )
          }}
        </Formik>
      </View>
      <ConfirmDialog
        title="오답노트 삭제"
        toggle={toggleConfirmDialog}
        onConfirm={handleDeleteNote}
        open={openConfirm}
        text="오답노트를 삭제하시겠습니까?"
      />

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
  headerRow: {},
  headerText: {
    fontSize: '12@ms',
    lineHeight: '20@ms',
    color: palette.grey[500],
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
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms',
    borderTopWidth: '1@ms',
    gap: '12@ms',
    borderColor: palette.grey[200]
  },
  button: {
    flexDirection: 'row',
    gap: '4@ms',
    justifyContent: 'center',
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
    borderWidth: '1@ms',
    color: '#222222'
  },
  deleteButton: {
    borderColor: '#222222'
  },
  confirmButton: {
    borderColor: palette.main[600]
  },
  disabledButton: {
    backgroundColor: palette.grey[200],
    color: palette.grey[400],
    borderWidth: 0
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.grey[700]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: '#222222'
  },
  disabledButtonText: {
    color: palette.grey[400]
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

export default NoteDialog