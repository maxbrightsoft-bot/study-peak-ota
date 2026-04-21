import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { palette, TYPO } from '@/theme'
import { Field } from 'formik'
import TextField from '@/components/Input/TextField'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Select from '@/components/Select/CustomSelect'
import useStepItem from '../hooks/useStepItem'
import { Ionicons } from '@expo/vector-icons'
import { Checkbox } from 'react-native-paper'

type Props = {
  values: any
  touched: any
  errors: any
  setFieldValue: any
  setFieldTouched: any
}

const StepItem = ({ values, errors, touched, setFieldValue, setFieldTouched }: Props) => {
  const { t, step, formatPhone, stepCount, onNext, onPrev, subjectOptions, gradeOptions } = useStepItem({
    values,
    errors,
    setFieldTouched
  })


  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.title}>{t('enter_your_name')}</Text>
            <Field name="fullName">
              {() => (
                <TextField
                  error={touched.fullName && errors.fullName && t('name_is_required')}
                  value={values.fullName}
                  style={styles.input}
                  onChangeText={(value: string) => setFieldValue('fullName', value)}
                />
              )}
            </Field>
          </View>
        )
      case 1:
        return (
          <View>
            <Text style={styles.title}>{t('phone_number')}</Text>
            <Field name="phoneNumber">
              {() => (
                <TextField
                  style={styles.input}
                  value={formatPhone(values.phoneNumber)}
                  keyboardType="phone-pad"
                  error={touched.phoneNumber && errors.phoneNumber && t('phone_number_is_required')}
                  onChangeText={(value: string) => {
                    const cleaned = value.replace(/\D/g, "");
                    setFieldValue("phoneNumber", cleaned);
                  }}
                />
              )}
            </Field>
          </View>
        )
      case 2:
        return (
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.title}>{t('parent_name')}</Text>
            <Field name="parentName">
              {() => (
                <TextField
                  error={touched.parentName && errors.parentName && t('parent_name_is_required')}
                  value={values.parentName}
                  style={styles.input}
                  onChangeText={(value: string) => setFieldValue('parentName', value)}
                />
              )}
            </Field>
          </View>
        )
      case 3:
        return (
          <View>
            <Text style={styles.title}>{t('parent_phone_number')}</Text>
            <Field name="parentPhoneNumber">
              {() => (
                <TextField
                  style={styles.input}
                  value={formatPhone(values.parentPhoneNumber)}
                  keyboardType="phone-pad"
                  error={
                    touched.parentPhoneNumber &&
                    errors.parentPhoneNumber &&
                    t('parent_phone_number_is_required')
                  }
                  onChangeText={(value: string) => {
                    const cleaned = value.replace(/\D/g, "");
                    setFieldValue("parentPhoneNumber", cleaned);
                  }}
                />
              )}
            </Field>
            {/* <View>
              <TouchableOpacity activeOpacity={0.7} style={styles.checkExistButton}>
                <Text>{t('check_exist_phone_number')}</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        )
      case 4:
        return (
          <View>
            <Text style={styles.title}>{t('school_name')}</Text>
            <Field name="schoolName">
              {() => (
                <TextField
                  error={touched.schoolName && errors.schoolName && t('school_name_is_required')}
                  value={values.schoolName}
                  style={styles.input}
                  onChangeText={(value: string) => setFieldValue('schoolName', value)}
                />
              )}
            </Field>
            <Text style={styles.helperText}>{t('school_name_helper_text')}</Text>
          </View>
        )
      case 5:
        return (
          <>
            <Text style={styles.title}>{t('select_major_and_grade')}</Text>
            <GridContainer spacing={12}>
              <GridItem xs={4} style={{ justifyContent: 'space-between' }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>{t('select_liberal_arts/science')}</Text>
                <Field name="major">
                  {() => (
                    <Select
                      onValueChange={(value) => setFieldValue('major', value)}
                      value={values.major || ''}
                      options={subjectOptions}
                    />
                  )}
                </Field>
              </GridItem>
              <GridItem xs={4} style={{ justifyContent: 'space-between' }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>{t('current_grade')}</Text>
                <Field name="grade">
                  {() => (
                    <Select
                      onValueChange={(value) => setFieldValue('grade', value)}
                      value={values.grade || ''}
                      options={gradeOptions}
                    />
                  )}
                </Field>
              </GridItem>
            </GridContainer>
          </>
        )
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {step !== 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: "#FFF"
            }}
          >
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onPrev}>
              <Ionicons name="chevron-back-outline" size={24} color={palette.grey[600]} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.container}>
          <View style={styles.content}>{renderStep()}</View>
          <View
            style={{
              position: 'absolute',
              bottom: 20,
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateX(25%)'
            }}
          >
            <TouchableOpacity style={[styles.button, styles.buttonAction]} onPress={() => onNext(step)}>
              <Text style={{ color: '#FFF' }}>{step < stepCount - 1 ? '확인' : '회원가입'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default StepItem

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingBottom: 24,
    paddingTop: 156,
    paddingHorizontal: 24,
    position: 'relative'
  },
  content: {
    justifyContent: 'center'
  },
  title: { ...TYPO.heading1, marginBottom: 80, color: palette.main[600] },
  label: { ...TYPO.caption, color: "#222222" },
  input: {},
  error: { color: 'red', marginBottom: 12 },
  button: {
    backgroundColor: palette.main[600],
    padding: 16,
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textButton: {
    ...TYPO.button2,
    color: '#FFF'
  },
  helperText: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginTop: 4
  },
  checkbox: {
    padding: 0
  },
  containerCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkExistButton: {
    backgroundColor: palette.main[600],
    padding: 16,
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  buttonAction: {
    backgroundColor: palette.main[600],
    width: '100%'
  }
})
