import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { palette, TYPO } from '@/theme'
import { Field } from 'formik'
import TextField from '@/components/Input/TextField'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Select from '@/components/Select/CustomSelect'
import useStepItem from '../hooks/useStepItem'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Verify from '@/assets/iconJSX/verify'
import SchoolSearchSelect from '@/components/Select/SchoolSearchSelect'
import { ScaledSheet } from 'react-native-size-matters'
import useAuthStore from '@/store/useAuthStore'

type Props = {
  values: any
  touched: any
  errors: any
  setFieldValue: any
  setFieldTouched: any
}

const StepItem = ({ values, errors, touched, setFieldValue, setFieldTouched }: Props) => {
  const { t, step, formatPhone, stepCount, onNext, onPrev, subjectOptions, gradeOptions, isCheckPhoneNumber, setIsCheckPhoneNumber, handleCheckPhoneNumber } = useStepItem({
    values,
    errors,
    setFieldTouched
  })
  const logout = useAuthStore(state => state.logout)

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
                    setIsCheckPhoneNumber(false)
                    setFieldValue("phoneNumber", cleaned);
                  }}
                />
              )}
            </Field>
            {isCheckPhoneNumber ? (
              <View style={styles.checkExistButton}>
                <Verify color='#4CAF50' />
                <Text style={{ color: palette.sub[400], fontWeight: '700', marginLeft: 8 }}>{t('phone_number_is_available')}</Text>
              </View>
            ) : (
              <TouchableOpacity activeOpacity={0.7} style={styles.checkExistButton} onPress={handleCheckPhoneNumber}>
                <Text style={{ color: palette.sub[400], fontWeight: '700' }}>{t('check_phone_number')}</Text>
              </TouchableOpacity>
            )}

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
          </View>
        )
      case 4:
        return (
          <View>
            <Text style={styles.title}>{t('school_name')}</Text>
            <Field name="schoolName">
              {() => (
                <SchoolSearchSelect
                  value={values.schoolName}
                  onValueChange={(value: string) => setFieldValue('schoolName', value)}
                  placeholder={t('school_name')}
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
          {step !== 0 ? (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onPrev}>
              <Ionicons name="chevron-back-outline" size={24} color={palette.grey[600]} />
            </TouchableOpacity>
          ) : (<View></View>)}
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              gap: 6,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 24,
              backgroundColor: palette.main[50],
            }}
          >
            <MaterialIcons name="logout" size={18} color={palette.main[600]} />
            <Text style={{ color: palette.main[600], fontWeight: '700', fontSize: 15 }}>
              {t('login')}
            </Text>
          </TouchableOpacity>
        </View>
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
              <Text style={{ color: '#FFF' }}>{step < stepCount - 1 ? t('confirm') : t('register')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default StepItem

const styles = ScaledSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingBottom: '24@ms',
    paddingTop: '156@ms',
    paddingHorizontal: '24@ms',
    position: 'relative'
  },
  content: {
    justifyContent: 'center'
  },
  title: { ...TYPO.heading1, marginBottom: '80@ms', color: palette.main[600] },
  label: { ...TYPO.caption, color: "#222222" },
  input: {},
  error: { color: 'red', marginBottom: '12@ms' },
  button: {
    backgroundColor: palette.main[600],
    padding: '16@ms',
    borderRadius: '12@ms',
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
    marginTop: '4@ms'
  },
  checkbox: {
    padding: 0
  },
  containerCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  checkExistButton: {
    marginTop: '12@ms',
    display: 'flex',
    flexDirection: "row",
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.sub[400],
    padding: '12@ms',
    borderRadius: '8@ms',
    alignSelf: 'flex-start'
  },
  containerSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  buttonAction: {
    backgroundColor: palette.main[600],
    width: '100%'
  }
})
