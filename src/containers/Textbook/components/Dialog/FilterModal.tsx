import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'
import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import StartArrowSelect from '@/components/Select/StartArrowSelect'
import TextField from '@/components/Input/TextField'
import { Formik } from 'formik'

interface Props {
  t: any
  title: string
  open: boolean
  onClose?: () => void
}

const FilterModal = ({ t, title, open, onClose = () => {} }: Props) => {
  return (
    <CommonDialog onClose={onClose} isVisible={open} title={title} isVisibleHeader={false}>
      <Formik
        initialValues={{
          textSearch: ''
        }}
        onSubmit={(values) => {}}
      >
        {({ handleChange, handleSubmit, values, errors }) => (
          <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
              <ScrollView style={styles.scrollContainer}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>내가 생성한 시험</Text>
                  {/* <StartArrowSelect /> */}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>시험 카테고리</Text>
                  {/* <StartArrowSelect /> */}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>기존 시험 이력</Text>
                  {/* <StartArrowSelect /> */}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>카워드</Text>
                  <TextField
                    value={values.textSearch}
                    onChangeText={handleChange('textSearch')}
                    style={[styles.input]}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={{ ...styles.buttonText, color: palette.main[500] }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit as any} style={[styles.button, styles.searchButton]}>
                <Text style={styles.buttonText}>{t('search')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </CommonDialog>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16
  },
  scrollContainer: {},
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 400,
    marginBottom: 8,
    color: palette.grey[700]
  },
  divider: {
    backgroundColor: '#e0e0e0',
    marginVertical: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
    marginTop: 4
  },
  categoryItem: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[100],
    borderRadius: 6
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {},
  searchButton: {
    backgroundColor: palette.main[500],
    marginLeft: 8
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  }
})

export default FilterModal
