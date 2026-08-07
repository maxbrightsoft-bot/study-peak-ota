import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native'
import { Formik, FormikHelpers } from 'formik'
import { palette } from '@/theme'
import useFilterForm from '@/containers/Textbook/hooks/useFilterForm'
import RefreshIcon from '@/assets/iconJSX/refresh'
import { FilterValues } from '../configs/types'
import { ScaledSheet } from 'react-native-size-matters'

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
        {({ handleSubmit: formikSubmit, resetForm }) => {
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

const styles = ScaledSheet.create({
  safe: {
    backgroundColor: palette.grey[50]
  },
  scroll: {},
  content: {
    paddingHorizontal: '20@ms',
    paddingTop: '24@ms',
    paddingBottom: '140@ms',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },

  sectionTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#111',
    marginBottom: '20@ms'
  },
  divider: {
    height: '1@ms',
    backgroundColor: '#F0F0F0',
    marginVertical: '24@ms'
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10@ms'
  },
  checkBox: {
    width: '22@ms',
    height: '22@ms',
    borderRadius: '5@ms',
    borderWidth: '1@ms',
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
    fontSize: '13@ms',
    fontWeight: '700',
    lineHeight: '16@ms'
  },
  checkLabel: {
    marginLeft: '8@ms',
    fontSize: '14@ms',
    color: '#222'
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12@ms',
    marginTop: '4@ms'
  },

  yearRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  yearInputWrap: {
    flex: 1
  },
  calIcon: {
    fontSize: '16@ms'
  },
  yearSuffix: {
    marginLeft: '10@ms',
    fontSize: '14@ms',
    color: '#555',
    width: '32@ms'
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12@ms',
    marginTop: '4@ms'
  },

  bottomBar: {
    flexDirection: 'row',
    marginTop: '36@ms',
    gap: '12@ms',
    position: 'absolute',
    bottom: 0
  },
  resetBtn: {
    width: '52@ms',
    height: '52@ms',
    borderRadius: '14@ms',
    borderWidth: '1@ms',
    borderColor: '#222222',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resetIcon: {
    fontSize: '22@ms',
    color: '#555'
  },
  submitBtn: {
    flex: 1,
    height: '52@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.main[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: palette.main[600],
        shadowOffset: { width: 0, height: '4@ms' },
        shadowOpacity: 0.35,
        shadowRadius: '8@ms'
      },
      android: { elevation: '6@ms' }
    })
  },
  submitText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: '700',
    letterSpacing: 0.4
  }
})
