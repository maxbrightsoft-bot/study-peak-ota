import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Formik, FormikHelpers } from 'formik'
import { palette, TYPO } from '@/theme'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import CustomSelect from '@/components/Select/CustomSelect'
import Loading from '@/components/Loading'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  open: boolean
  onClose: () => void
  t: any
  loading?: boolean
  title: string
  options: { label: string; value: number }[]
  onSubmit: (data: RestartTextbookRequest) => void
}

interface RestartTextbookRequest {
  startPage?: number
  endPage?: number
}

const RestartPageDialog = ({ t, loading, onClose, title, open, options, onSubmit }: Props) => {
  const initialValues = {
    startPage: null as number | null,
    endPage: null as number | null
  }

  const handleSubmit = (values: typeof initialValues, helpers: FormikHelpers<typeof initialValues>) => {
    const payload: RestartTextbookRequest = {
      startPage: values.startPage ?? undefined,
      endPage: values.endPage ?? undefined
    }
    onSubmit(payload)
    helpers.setSubmitting(false)
    onClose()
  }

  return (
    <CommonDialog isVisible={open} onClose={onClose} title={title}>
      {loading && <Loading isOverlay={false}/>}
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit, values, setFieldValue, isSubmitting }) => (
          <>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('page_from')}</Text>
                <CustomSelect
                  options={values.endPage ? options.filter((option) => option.value <= values.endPage!) : options}
                  value={values.startPage}
                  onValueChange={(value) => setFieldValue('startPage', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('page_to')}</Text>
                <CustomSelect
                  options={values.startPage ? options.filter((option) => option.value >= values.startPage!) : options}
                  value={values.endPage}
                  onValueChange={(value) => setFieldValue('endPage', value)}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isSubmitting}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  (isSubmitting) && styles.disabledButton
                ]}
                onPress={() => { 
                  onClose () 
                  handleSubmit()
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>{t('restart')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16@ms'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: '12@ms',
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
  },
  modalTitle: {
    ...TYPO.h4,
    fontWeight: '700',
    color: palette.main[500]
  },
  closeButton: {
    padding: '4@ms'
  },
  closeIcon: {
    fontSize: '28@ms',
    color: palette.grey[500]
  },
  modalContent: {
    paddingVertical: '16@ms'
  },
  inputContainer: {
    marginBottom: '16@ms'
  },
  inputLabel: {
    ...TYPO.body2,
    color: palette.grey[900],
    marginBottom: '8@ms'
  },
  dropdown: {
    borderWidth: '1@ms',
    borderColor: palette.grey[300],
    borderRadius: '8@ms',
    backgroundColor: 'white'
  },
  infoContainer: {
    marginTop: '8@ms',
    padding: '12@ms',
    backgroundColor: palette.grey[50],
    borderRadius: '6@ms'
  },
  infoText: {
    ...TYPO.caption,
    color: palette.grey[600]
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    paddingVertical: '16@ms',
  },
  button: {
    paddingVertical: '14@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '12@ms'
  },
  cancelButton: {
    borderWidth: '1@ms',
    borderColor: palette.main[600],
  },
  cancelButtonText: {
    color: palette.main[600]
  },
  submitButton: {
    backgroundColor: palette.main[600],
  },
  submitButtonText: {
    ...TYPO.button2,
    color: 'white'
  },
  disabledButton: {
    backgroundColor: palette.grey[300]
  }
})

export default RestartPageDialog
