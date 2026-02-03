import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { palette, TYPO } from '@/theme'
import { Field } from 'formik'
import TextField from '@/components/Input/TextField'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Select from '@/components/Select/CustomSelect'
import useStepItem from '../hooks/useStepItem'
import { Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  values: any
  touched: any
  errors: any
  setFieldValue: any
  setFieldTouched: any
}

const StepItem = ({ values, errors, touched, setFieldValue, setFieldTouched }: Props) => {
  const { t, step, stepCount, onNext, onPrev, subjectOptions, gradeOptions } = useStepItem({
    values,
    errors,
    setFieldTouched
  })

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.title}>먼저, 이름을 입력해주세요.</Text>
            <Field name="fullName">
              {() => (
                <TextField
                  label="이름"
                  error={touched.fullName && errors.fullName && '이름은 필수입니다'}
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
            <Text style={styles.title}>전화번호를 입력해주세요.</Text>
            <Field name="phoneNumber">
              {() => (
                <TextField
                  label="전화번호"
                  style={styles.input}
                  value={values.phoneNumber}
                  keyboardType="phone-pad"
                  error={touched.phoneNumber && errors.phoneNumber && '전화번호는 필수입니다'}
                  onChangeText={(value: string) => setFieldValue('phoneNumber', value)}
                />
              )}
            </Field>
          </View>
        )
      case 2:
        return (
          <View>
            <Text style={styles.title}>재학 중인 학교를 선택해주세요.</Text>
            <Field name="schoolName">
              {() => (
                <TextField
                  error={touched.schoolName && errors.schoolName && '학교 이름은 필수입니다'}
                  label="전화번호"
                  value={values.schoolName}
                  style={styles.input}
                  onChangeText={(value: string) => setFieldValue('schoolName', value)}
                />
              )}
            </Field>
            <Text style={styles.helperText}>안내 텍스트입니다.</Text>
          </View>
        )
      case 3:
        return (
          <>
            <Text style={styles.title}>학과와 학년을 선택해주세요.</Text>
            <GridContainer spacing={12}>
              <GridItem xs={4} style={{ justifyContent: 'space-between' }}>
                <Text style={styles.label}>{t('select_liberal_arts/science')}</Text>
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
                <Text style={styles.label}>{t('current_grade')}</Text>
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
    <>
      {step !== 0 && (
        <Button
          onPress={onPrev}
          style={{ width: 30, borderWidth: 1, borderColor: palette.main[500], borderRadius: 6, margin: 24 }}
        >
          <Ionicons name="return-up-back" size={24} color={palette.main[500]} />
        </Button>
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
          <Button style={styles.buttonAction} onPress={onNext}>
            <Text style={{ color: '#FFF' }}>{step < stepCount - 1 ? '확인' : '회원가입'}</Text>
          </Button>
        </View>
      </View>
    </>
  )
}

export default StepItem

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 24, paddingTop: 156, paddingHorizontal: 24, position: 'relative' },
  content: {
    justifyContent: 'center'
  },
  title: { ...TYPO.heading1, marginBottom: 80, color: palette.main[500] },
  label: { ...TYPO.caption },
  input: {
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: palette.grey[300]
  },
  error: { color: 'red', marginBottom: 12 },
  button: {
    backgroundColor: palette.main[500],
    padding: 16,
    borderRadius: 6,
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
  containerSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  buttonAction: {
    backgroundColor: palette.main[500], borderRadius: 6, width: '100%'
  }
})
