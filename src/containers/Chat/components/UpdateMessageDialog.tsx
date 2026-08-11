import React from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Field, Form, Formik } from 'formik'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { getSafeUrl } from '@/utils/helpers'
import { Shadow } from 'react-native-shadow-2'
import MathRichInput from '@/components/Input/MathRichInput'

type Props = {
  open: boolean
  onClose: () => void
  content?: string
  contentType?: number
  selectedFile: any
  handleUpdateMessage: (message: string) => void
  handleUploadImage: any
}

const UpdateMessageDialog: React.FC<Props> = ({
  open,
  onClose,
  content,
  contentType,
  selectedFile,
  handleUpdateMessage,
  handleUploadImage
}) => {
  const { t } = useTranslation()
  const validate = (value?: string) => {
    let error
    if (!value?.trim()) {
      error = 'Required'
    }
    return error
  }

  return (
    <CommonDialog isVisible={open} onClose={onClose} title={t('update_message')}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}></ScrollView>
      </KeyboardAvoidingView>

      {!contentType ? (
        <Formik
          enableReinitialize={true}
          initialValues={{
            content
          }}
          onSubmit={(values) => {
            const { content } = values
            handleUpdateMessage(content || '')
          }}
        >
          {({ setFieldValue, handleSubmit }) => (
            <>
              <Text variant="labelLarge" style={{ color: palette.grey[700], paddingBottom: 8 }}>
                {t('questions_to_ask')}
              </Text>
              <Field
                style={{ paddingRight: '40px' }}
                name="content"
                validate={validate}
                placeholder={t('the_problem_is_difficult')}
                render={({ field }: any) => (
                  <View style={styles.inputWrapper}>
                    <MathRichInput style={styles.input} initialValue={field.value} onChange={(text: string) => setFieldValue('content', text)} />
                  </View>
                )}
              />
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
      ) : (
        <View>
          <View style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <Shadow
              stretch
              startColor="rgba(0,0,0,0.035)"
              endColor="rgba(0,0,0,0)"
              offset={[0, 1]}
              distance={10}
            >
              <Image
                source={{ uri: getSafeUrl(selectedFile?.content || content) }}
                style={{ width: 300, height: 300, objectFit: 'contain' }}
              />
            </Shadow>
            <TouchableOpacity style={styles.attachmentButton} onPress={handleUploadImage}>
              <Ionicons name="add-circle" size={32} color={palette.grey[500]} />
              <Text>{t('attachment')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => handleUpdateMessage(selectedFile?.content || content)}
            >
              <Text style={styles.confirmButtonText}>{t('registration')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingBottom: '16@ms',
    paddingTop: '24@ms'
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    marginVertical: '12@ms',
    justifyContent: 'center',
    borderRadius: '6@ms',
    paddingVertical: '6@ms'
  },
  inputWrapper: {
    backgroundColor: palette.grey[100],
    borderRadius: '12@ms',
    minHeight: '160@ms',
    height: '180@ms'
  },
  input: {
    borderWidth: '1@ms',
    borderColor: palette.grey[100],
    backgroundColor: 'transparent'
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
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

export default UpdateMessageDialog
