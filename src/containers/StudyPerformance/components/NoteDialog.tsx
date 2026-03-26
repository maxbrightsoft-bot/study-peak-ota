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

interface ExamNoteDialogProps {
  open: boolean
  imageUrl: string
  selectedNote?: any
  handleUploadImage: () => Promise<void>
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
  isLoadingNotes,
  selectedNote,
  questionOptions = [],
  onClose,
  onSaveNote,
  onDeleteNote
}) => {
  const { t } = useTranslation()

  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>오답노트 상세</Text>
        </View>
        <View></View>
      </View>
      {isLoadingNotes && <Loading isOverlay={false} />}
      <View style={{ backgroundColor: palette.bg[100], flex: 1 }}>
        <Formik
          initialValues={{
            content: selectedNote?.content || '',
            questionId: selectedNote?.questionId
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
                          <View style={styles.separator} />
                          <Text style={styles.headerText}>p.{selectedNote?.score}</Text>
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
                        placeholder="(예시) 다른 문제에서 시간을 절약해서 부족한 현대문학에 시간을 좀 더 써야겠다."
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
                </KeyboardAvoidingView>
                <View style={styles.footer}>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDeleteNote as any}>
                    <TrashIcon />
                    <Text style={styles.confirmButtonText}>등록</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, !dirty && styles.disabledButton]}
                    onPress={handleSubmit as any}
                  >
                    <Text style={[styles.confirmButtonText, !dirty && styles.disabledButtonText]}>등록</Text>
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
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  headerRow: {},
  headerText: {
    fontSize: 12,
    lineHeight: 20,
    color: palette.grey[500],
    fontWeight: 500
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  number: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 25,
    color: palette.grey[900],
    marginRight: 12
  },

  metaText: {
    fontSize: 12,
    lineHeight: 20,
    color: palette.grey[400]
  },
  separator: {
    width: 1,
    height: 10,
    backgroundColor: palette.grey[400],
    marginHorizontal: 10
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6
  },

  labelText: {
    fontSize: '12@ms',
    fontWeight: 400,
    color: '#222222',
    lineHeight: 20,
    marginBottom: 10
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
    borderTopWidth: 1,
    gap: 12,
    borderColor: palette.grey[200]
  },
  button: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
    borderWidth: 1,
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
  }
})

export default NoteDialog
