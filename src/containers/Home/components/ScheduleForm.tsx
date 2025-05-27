import { Field, Form, FormikProps } from 'formik'
import { FC, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { ScheduleFormData } from '../configs/type'
import { DEFAULT_SCHEDULE_FORM_DATA } from '../configs/constants'
import TextField from '@/components/Input/TextField'

interface Props {
  open: boolean
  formikProp: FormikProps<ScheduleFormData>
  scheduleRequest?: ScheduleFormData
  onClose: () => void
}

const ScheduleForm: FC<Props> = ({ open, formikProp, scheduleRequest, onClose }) => {
  const { errors, values, setFieldValue, setValues, handleSubmit, touched, setTouched } = formikProp
  const { t } = useTranslation()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)

  const maxTime = values.endTime ? _.cloneDeep(values.endTime).add(-1, 'minutes') : undefined
  const minTime = values.startTime ? _.cloneDeep(values.startTime).add(1, 'minutes') : undefined
  const date = moment(values.date).local()

  useEffect(() => {
    if (open && scheduleRequest) setValues(scheduleRequest)
    else setValues(DEFAULT_SCHEDULE_FORM_DATA)
  }, [open, JSON.stringify(scheduleRequest)])

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setFieldValue('date', moment(selectedDate))
    }
  }

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false)
    if (selectedTime) {
      setFieldValue('startTime', moment(selectedTime))
    }
  }

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false)
    if (selectedTime) {
      setFieldValue('endTime', moment(selectedTime))
    }
  }

  return (
    <View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView style={styles.container}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('title')}</Text>
            <Field name="title">
              {({ field }: any) => (
                <TextField value={field.value} onChangeText={(value: string) => setFieldValue('title', value)} />
              )}
            </Field>
            {!!errors?.title && touched.title && <Text style={styles.errorText}>{errors?.title}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('date')}</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputText}>{date.format(t('date_format'))}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date.toDate()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={scheduleRequest ? undefined : moment().toDate()}
                maximumDate={scheduleRequest ? moment().toDate() : moment().add(6, 'd').toDate()}
              />
            )}
            {!!errors?.date && <Text style={styles.errorText}>{errors?.date}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('start_time')}</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.inputText}>{values.startTime ? values.startTime.format('HH:mm') : ''}</Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={values.startTime?.toDate() || new Date()}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
                minimumDate={minTime?.toDate()}
                maximumDate={maxTime?.toDate()}
              />
            )}
            {!!errors?.startTime && touched.startTime && <Text style={styles.errorText}>{errors?.startTime}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('end_time')}</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.inputText}>{values.endTime ? values.endTime.format('HH:mm') : ''}</Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={values.endTime?.toDate() || new Date()}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
                minimumDate={minTime?.toDate()}
                maximumDate={maxTime?.toDate()}
              />
            )}
            {!!errors?.endTime && touched.endTime && <Text style={styles.errorText}>{errors?.endTime}</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={(e) => {
            setTouched(touched, true)
            handleSubmit()
          }}
        >
          <Text style={styles.confirmButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {},
  formGroup: {
    marginBottom: '16@ms'
  },
  label: {
    ...TYPO.body2,
    color: palette.grey[700],
    marginBottom: '8@ms'
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '8@ms',
    padding: '12@ms',
    backgroundColor: 'white'
  },
  inputText: {
    ...TYPO.body1,
    color: palette.grey[900]
  },
  errorText: {
    ...TYPO.caption,
    color: palette.error.main,
    marginTop: '4@ms'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '8@ms',
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

export default ScheduleForm
