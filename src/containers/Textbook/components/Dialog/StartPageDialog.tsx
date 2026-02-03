import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Formik } from 'formik'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'
import CustomSelect from '@/components/Select/CustomSelect'
import Loading from '@/components/Loading'

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

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden'
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202B37'
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB'
  },
  cancelButton: {
    padding: 8
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 14
  },
  submitButton: {
    backgroundColor: palette.main[500],
    padding: 12,
    borderRadius: 4,
    minWidth: 120,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
})

export default StartPageDialog
