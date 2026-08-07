import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Formik } from 'formik'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'
import CustomSelect from '@/components/Select/CustomSelect'
import Loading from '@/components/Loading'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  open: boolean
  onClose: () => void
  t: any
  loading: boolean
  options: { label: string; value: number }[]
  onSubmit: (values: any) => void
}

const StartPageDialog = ({ t, loading, onClose, open, options, onSubmit }: Props) => {
  return (
    <CommonDialog isVisible={open} onClose={onClose} title={t('start_from_page')}>
      {loading && <Loading isOverlay={false} />}
      <Formik initialValues={{ startPage: options[0]?.value }} onSubmit={onSubmit}>
        {({ handleSubmit, setFieldValue, values }) => (
          <View>
            <View>
              <Text style={styles.label}>{t('page_to_start_with')}</Text>
              <CustomSelect
                value={values.startPage}
                onValueChange={(itemValue) => setFieldValue('startPage', itemValue)}
                options={options}
              />
            </View>
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSubmit()} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>{t('start_of_the_solution')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: '8@ms',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#202B37'
  },
  label: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8@ms'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '12@ms',
    marginBottom: '-24@ms'
  },
  cancelButton: {
    padding: '8@ms'
  },
  cancelButtonText: {
    color: palette.main[600],
    fontWeight: 'bold',
    fontSize: '14@ms',
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
  },
  submitButton: {
    backgroundColor: palette.main[600],
    borderRadius: '14@ms',
    minWidth: '120@ms',
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14@ms',
    lineHeight: '22@ms'
  }
})

export default StartPageDialog
