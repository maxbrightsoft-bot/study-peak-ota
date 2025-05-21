import React, { FC } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

interface ClassNoteDialogProps {
  visible: boolean
  studentName?: string
  selectedNote?: { content: string; fullName: string }
  tip?: string
  value?: string
  onClose: () => void
  onSaveNote: (content: string) => void
}

const validationSchema = Yup.object().shape({
  content: Yup.string().required('Required')
})

const ClassNoteDialog: FC<ClassNoteDialogProps> = ({
  visible,
  studentName,
  selectedNote,
  tip,
  value,
  onClose,
  onSaveNote
}) => {
  const { t } = useTranslation()
  const formik = useFormik({
    initialValues: {
      content: selectedNote?.content || value || ''
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      onSaveNote(values.content)
    }
  })

  return (
    <CommonDialog
      isVisible={visible}
      onClose={onClose}
      title={`${t(selectedNote ? 'edit_student_note' : 'student_note_taking')} ${tip}`}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
          {(selectedNote || studentName) && (
            <View style={{ marginBottom: 12 }}>
              <Text variant="labelLarge"> {t('incorrect_answer_note_contents')}</Text>
              <Text style={{ fontWeight: 'bold', color: '#3DC674' }}>{selectedNote?.fullName || studentName}</Text>
            </View>
          )}

          <View style={{ marginBottom: 12 }}>
            <Text variant="labelLarge">{t("incorrect_answer_note_contents")}</Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder={t('the_problem_is_difficult')}
              value={formik.values.content}
              onChangeText={formik.handleChange('content')}
              onBlur={formik.handleBlur('content')}
              error={formik.touched.content && !!formik.errors.content}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
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
    padding: '16@ms',
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

export default ClassNoteDialog
