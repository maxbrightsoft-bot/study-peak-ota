import { Field, FormikProps } from 'formik'
import { FC, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { ScheduleFormData } from '../configs/type'
import { DEFAULT_SCHEDULE_FORM_DATA } from '../configs/constants'
import TextField from '@/components/Input/TextField'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

interface Props {
  open: boolean
  formikProp: FormikProps<ScheduleFormData>
  scheduleRequest?: ScheduleFormData
  onClose: () => void
}

const ScheduleForm: FC<Props> = ({ open, formikProp, scheduleRequest, onClose }) => {
  const { errors, values, setFieldValue, setValues, handleSubmit, touched, setTouched } = formikProp
  const { t } = useTranslation()

  const [pickerMode, setPickerMode] = useState<'date' | 'start' | 'end' | null>(null)

  const maxTime = values.endTime ? _.cloneDeep(values.endTime).add(-1, 'minutes') : undefined
  const minTime = values.startTime ? _.cloneDeep(values.startTime).add(1, 'minutes') : undefined

  const date = moment(values.date).local()

  useEffect(() => {
    if (open && scheduleRequest) setValues(scheduleRequest)
    else setValues(DEFAULT_SCHEDULE_FORM_DATA)
  }, [open, scheduleRequest])

  const handleConfirm = (selected: Date) => {
    const selectedMoment = moment(selected)

    if (pickerMode === 'date') {
      setFieldValue('date', selectedMoment)
      setPickerMode(null)
      return
    }

    if (pickerMode === 'start') {
      if (values.endTime && selectedMoment.isSameOrAfter(values.endTime)) {
        setPickerMode(null)
        return
      }
      setFieldValue('startTime', selectedMoment)
    }

    if (pickerMode === 'end') {
      if (values.startTime && selectedMoment.isSameOrBefore(values.startTime)) {
        setPickerMode(null)
        return
      }
      setFieldValue('endTime', selectedMoment)
    }

    setPickerMode(null)
  }

  return (
    <View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity style={styles.input} onPress={() => setPickerMode('date')}>
              <Text style={styles.inputText}>{date.format(t('date_format'))}</Text>
            </TouchableOpacity>
            {!!errors?.date && <Text style={styles.errorText}>{errors?.date}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('start_time')}</Text>
            <TouchableOpacity style={styles.input} onPress={() => setPickerMode('start')}>
              <Text style={styles.inputText}>{values.startTime ? values.startTime.format('HH:mm') : ''}</Text>
            </TouchableOpacity>
            {!!errors?.startTime && touched.startTime && <Text style={styles.errorText}>{errors?.startTime}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('end_time')}</Text>
            <TouchableOpacity style={styles.input} onPress={() => setPickerMode('end')}>
              <Text style={styles.inputText}>{values.endTime ? values.endTime.format('HH:mm') : ''}</Text>
            </TouchableOpacity>
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
          onPress={() => {
            setTouched(
              {
                title: true,
                date: true,
                startTime: true,
                endTime: true
              },
              true
            )
            handleSubmit()
          }}
        >
          <Text style={styles.confirmButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={!!pickerMode}
        mode={pickerMode === 'date' ? 'date' : 'time'}
        date={
          pickerMode === 'date'
            ? date.toDate()
            : pickerMode === 'start'
            ? values.startTime?.toDate() || new Date()
            : values.endTime?.toDate() || new Date()
        }
        minimumDate={pickerMode === 'end' ? minTime?.toDate() : undefined}
        maximumDate={pickerMode === 'start' ? maxTime?.toDate() : undefined}
        onConfirm={handleConfirm}
        onCancel={() => setPickerMode(null)}
      />
    </View>
  )
}

export default ScheduleForm

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
    borderRadius: '10@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '16@ms',
    backgroundColor: palette.grey[100]
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
    gap: '8@ms'
  },

  button: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '12@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },

  cancelButton: {},

  confirmButton: {
    backgroundColor: palette.main[600]
  },

  cancelButtonText: {
    ...TYPO.button2,
    color: palette.main[600]
  },

  confirmButtonText: {
    ...TYPO.button2,
    color: 'white'
  }
})