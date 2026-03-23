import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native'
import { Formik, FormikHelpers } from 'formik'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import useFilterForm from '@/containers/Textbook/hooks/useFilterForm'
import YearPicker from '@/components/Input/DatePicker'
import RefreshIcon from '@/assets/iconJSX/refresh'
import { FilterValues, TextbookQuery } from '../configs/type'
import CalendarIcon from '@/assets/iconJSX/calendar'
import moment from 'moment'

interface FilterFormProps {
  onSubmit?: (values: FilterValues) => void
  textbookFilter: TextbookQuery
}

interface CheckboxProps {
  checked: boolean
  onPress: (isChecked: boolean) => void
  label?: string
}

const defaultValues: FilterValues = {
  subjectIds: [],
  startYear: undefined,
  endYear: undefined,
  months: []
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onPress, label }) => (
  <TouchableOpacity
    style={styles.checkRow}
    onPress={() => onPress(checked)}
    activeOpacity={0.7}
  >
    <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
      {checked && <Ionicons name="checkmark" size={16} color="#FFF" />}
    </View>

    {label ? <Text style={styles.checkLabel}>{label}</Text> : null}
  </TouchableOpacity>
)

const FilterForm: React.FC<FilterFormProps> = ({
  onSubmit,
  textbookFilter
}) => {
  const { subjectOptions, monthOptions } = useFilterForm()

  const handleSubmit = (
    values: FilterValues,
    _helpers: FormikHelpers<FilterValues>
  ) => {
    onSubmit?.(values)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Formik<FilterValues>
        initialValues={{
          endYear: !!textbookFilter.toDate ? moment.utc(textbookFilter.toDate).year() : undefined,
          startYear: !!textbookFilter.fromDate ? moment.utc(textbookFilter.fromDate).local().year() : undefined,
          subjectIds: textbookFilter.subjectIds || [],
          months: textbookFilter.fromMonths?.map(i => moment.utc(i).local().month() + 1) || []
        }}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, handleSubmit: formikSubmit, resetForm }) => {
          const toggleSubjectAll = (isChecked: boolean) => {
            if (!isChecked) {
              setFieldValue(
                'subjectIds',
                subjectOptions.map((i) => i.value)
              )
            } else {
              setFieldValue('subjectIds', [])
            }
          }

          const toggleSubject = (isChecked: boolean, value: number) => {
            if (isChecked) {
              setFieldValue(
                'subjectIds',
                values.subjectIds.filter((i) => i !== value)
              )
            } else {
              setFieldValue('subjectIds', [...values.subjectIds, value])
            }
          }

          const toggleMonthAll = (isChecked: boolean) => {
            if (!isChecked) {
              setFieldValue(
                'months',
                monthOptions.map((i) => i.value)
              )
            } else {
              setFieldValue('months', [])
            }
          }

          const toggleMonth = (isChecked: boolean, value: number) => {
            if (isChecked) {
              setFieldValue(
                'months',
                values.months.filter((i) => i !== value)
              )
            } else {
              setFieldValue('months', [...values.months, value])
            }
          }

          const handleReset = () => {
            resetForm({ values: defaultValues })
          }

          return (
            <View style={styles.wrapper}>
              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionTitle}>과목</Text>

                <Checkbox
                  checked={
                    !!subjectOptions.length &&
                    values.subjectIds.length === subjectOptions.length
                  }
                  onPress={toggleSubjectAll}
                  label="전체"
                />

                <View style={styles.chipRow}>
                  {subjectOptions.map(({ label, value }) => (
                    <Checkbox
                      key={value}
                      checked={values.subjectIds.includes(value)}
                      onPress={(isChecked) =>
                        toggleSubject(isChecked, value)
                      }
                      label={label}
                    />
                  ))}
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>연도</Text>

                <View style={{ gap: 12 }}>
                  <View style={styles.yearRow}>
                    <View style={styles.yearInputWrap}>
                      <YearPicker
                        mode="date"
                        isYear
                        icon={<CalendarIcon />}
                        placeholderText="YYYY"
                        onChange={(_, selectedDate) =>
                          setFieldValue(
                            'startYear',
                            selectedDate?.getFullYear()
                          )
                        }
                        value={
                          values.startYear
                            ? new Date(Number(values.startYear), 0, 1)
                            : null
                        }
                        maximumDate={
                          values.endYear
                            ? new Date(Number(values.endYear), 0, 1)
                            : undefined
                        }
                      />
                    </View>

                    <Text style={styles.yearSuffix}>부터</Text>
                  </View>

                  <View style={styles.yearRow}>
                    <View style={styles.yearInputWrap}>
                      <YearPicker
                        mode="date"
                        isYear
                        icon={<CalendarIcon />}
                        placeholderText="YYYY"
                        minimumDate={
                          values.startYear
                            ? new Date(Number(values.startYear), 0, 1)
                            : undefined
                        }
                        onChange={(_, selectedDate) =>
                          setFieldValue(
                            'endYear',
                            selectedDate?.getFullYear()
                          )
                        }
                        value={
                          values.endYear
                            ? new Date(Number(values.endYear), 0, 1)
                            : null
                        }
                      />
                    </View>

                    <Text style={styles.yearSuffix}>까지</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>시험 시기</Text>

                <Checkbox
                  checked={values.months.length === monthOptions.length}
                  onPress={toggleMonthAll}
                  label="전체"
                />

                <View style={styles.monthGrid}>
                  {monthOptions.map(({ label, value }) => (
                    <Checkbox
                      key={value}
                      checked={values.months.includes(value)}
                      onPress={(isChecked) =>
                        toggleMonth(isChecked, value)
                      }
                      label={label}
                    />
                  ))}
                </View>
              </ScrollView>

              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <RefreshIcon />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={() => formikSubmit()}
                  activeOpacity={0.85}
                >
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
    flex: 1,
    backgroundColor: palette.grey[50]
  },

  wrapper: {
    flex: 1
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120
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
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: palette.grey[50]
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
    fontWeight: '700'
  }
})