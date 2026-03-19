import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native'
import { Formik, FormikHelpers } from 'formik'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import useFilterForm from '@/containers/Textbook/hooks/useFilterForm'
import RefreshIcon from '@/assets/iconJSX/refresh'
import { FilterValues } from '../configs/types'

interface FilterFormProps {
  onSubmit?: (values: FilterValues) => void
}

interface CheckboxProps {
  checked: boolean
  onPress: (isChecked: boolean) => void
  label?: string
}

const defaultValues: FilterValues = {
  examSessionId: undefined,
  courseId: undefined,
  questionId: undefined
}

const FilterForm: React.FC<FilterFormProps> = ({ onSubmit }) => {
  const handleSubmit = (values: FilterValues, _helpers: FormikHelpers<FilterValues>): void => {
    onSubmit?.(values)
  }
  const { subjectOptions, monthOptions } = useFilterForm()

  return (
    <SafeAreaView style={styles.safe}>
      <Formik<FilterValues> initialValues={{}} onSubmit={handleSubmit}>
        {({ values, setFieldValue, handleSubmit: formikSubmit, resetForm }) => {
          const handleReset = (): void => {
            resetForm({ values: defaultValues })
          }

          return (
            <View style={styles.content}>
              <View>
                <Text style={styles.sectionTitle}>과목</Text>
              </View>

              <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
                  <RefreshIcon />
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitBtn} onPress={() => formikSubmit()} activeOpacity={0.85}>
                  <Text style={styles.submitText}>필터 적용</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      </Formik>
    </SafeAreaView>
  )
}

export default FilterForm

const styles = StyleSheet.create({
  safe: {
    backgroundColor: palette.grey[50]
  },
  scroll: {},
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: palette.grey[200],
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBoxChecked: {
    backgroundColor: palette.main[600],
    borderColor: palette.main[600]
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16
  },
  checkLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#222'
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4
  },

  yearRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  yearInputWrap: {
    flex: 1
  },
  calIcon: {
    fontSize: 16
  },
  yearSuffix: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
    width: 32
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4
  },

  bottomBar: {
    flexDirection: 'row',
    marginTop: 36,
    gap: 12,
    position: 'absolute',
    bottom: 0
  },
  resetBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resetIcon: {
    fontSize: 22,
    color: '#555'
  },
  submitBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.main[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: palette.main[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8
      },
      android: { elevation: 6 }
    })
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4
  }
})
