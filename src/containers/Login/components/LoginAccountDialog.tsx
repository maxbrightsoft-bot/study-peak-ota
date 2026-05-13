import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import TextField from '@/components/Input/TextField'
import useLoginEmail from '../hooks/useLoginEmail'
import useRegisterEmail, { TOTAL_REGISTER_STEPS } from '../hooks/useRegisterEmail'
import { useTranslation } from 'react-i18next'
import CustomTouchable from '@/components/Button/CustomTouchable'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import ForgotPasswordDialog from './ForgotPasswordDialog'
import Select from '@/components/Select/CustomSelect'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  visible: boolean
  onOpen: () => void
  onClose: () => void
}


const LoginAccountDialog = ({ visible, onOpen, onClose }: Props) => {
  const { t } = useTranslation()

  const { formik: loginFormik, showPassword, toggleShowPassword } = useLoginEmail()
  
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { formik: registerFormik, getError, subjectOptions, gradeOptions, registerStep, handleBack, handleNext } = useRegisterEmail({ mode, setMode })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  const renderLogin = () => {
    const emailError =
      loginFormik.touched.email && loginFormik.errors.email
        ? loginFormik.errors.email
        : ''

    const passwordError =
      loginFormik.touched.password && loginFormik.errors.password
        ? loginFormik.errors.password
        : ''

    return (
      <View style={styles.form}>
        <Text style={styles.label}>{t('email')}</Text>
        <TextField
          value={loginFormik.values.email}
          onChangeText={(text: string) => loginFormik.setFieldValue('email', text)}
          error={emailError}
        />

        <Text style={styles.label}>{t('password')}</Text>
        <TextField
          value={loginFormik.values.password}
          onChangeText={(text: string) => loginFormik.setFieldValue('password', text)}
          error={passwordError}
          secureTextEntry={!showPassword}
          rightComponent={
            <TouchableOpacity onPress={toggleShowPassword}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={palette.grey[500]}
              />
            </TouchableOpacity>
          }
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => {
            onClose()
            setShowForgotPassword(true)
          }}
        >
          <Text style={styles.forgotPasswordText}>
            {t('forgot_password')}
          </Text>
        </TouchableOpacity>

        <CustomTouchable
          style={styles.primaryButton}
          onPress={() => loginFormik.handleSubmit()}
        >
          <Text style={styles.primaryButtonText}>{t('sign_in')}</Text>
        </CustomTouchable>
      </View>
    )
  }

  const renderStep1 = () => (
    <>
      <TextField
        placeholder={t('email')}
        value={registerFormik.values.email}
        error={getError('email')}
        onChangeText={(t: string) => registerFormik.setFieldValue('email', t)}
      />

      <TextField
        placeholder={t('password')}
        secureTextEntry={!showRegisterPassword}
        value={registerFormik.values.password}
        error={getError('password')}
        onChangeText={(t: string) => registerFormik.setFieldValue('password', t)}
        rightComponent={
          <TouchableOpacity onPress={() => setShowRegisterPassword(p => !p)}>
            <Ionicons
              name={showRegisterPassword ? 'eye-off' : 'eye'}
              size={20}
              color={palette.grey[500]}
            />
          </TouchableOpacity>
        }
      />

      <TextField
        placeholder={t('confirm_password')}
        secureTextEntry={!showRegisterPassword}
        error={getError('confirmPassword')}
        value={registerFormik.values.confirmPassword}
        onChangeText={(t: string) =>
          registerFormik.setFieldValue('confirmPassword', t)
        }
      />
    </>
  )

  const renderStep2 = () => (
    <>
      <TextField
        placeholder={t('full_name')}
        error={getError('fullName')}
        value={registerFormik.values.fullName}
        onChangeText={(t: string) => registerFormik.setFieldValue('fullName', t)}
      />
      <TextField
        placeholder={t('phone_number')}
        keyboardType="phone-pad"
        error={getError('phoneNumber')}
        value={registerFormik.values.phoneNumber}
        onChangeText={(t: string) => registerFormik.setFieldValue('phoneNumber', t)}
      />
      <TextField
        placeholder={t('school_name')}
        error={getError('schoolName')}
        value={registerFormik.values.schoolName}
        onChangeText={(t: string) => registerFormik.setFieldValue('schoolName', t)}
      />
    </>
  )

  const renderStep3 = () => (
    <>
      <TextField
        placeholder={t('parent_name')}
        error={getError('parentName')}
        value={registerFormik.values.parentName}
        onChangeText={(t: string) => registerFormik.setFieldValue('parentName', t)}
      />
      <TextField
        placeholder={t('parent_phone_number')}
        error={getError('parentPhoneNumber')}
        keyboardType="phone-pad"
        value={registerFormik.values.parentPhoneNumber}
        onChangeText={(t: string) =>
          registerFormik.setFieldValue('parentPhoneNumber', t)
        }
      />
    </>
  )

  const renderStep4 = () => (
    <>
      <Select
        onValueChange={(value) => registerFormik.setFieldValue('major', value)}
        value={registerFormik.values.major || ''}
        options={subjectOptions}
      />
      <Select
        onValueChange={(value) => registerFormik.setFieldValue('grade', value)}
        value={registerFormik.values.grade || ''}
        options={gradeOptions}
      />
    </>
  )

  const renderRegisterStep = () => {
    switch (registerStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return null
    }
  }

  const renderRegister = () => (
    <View style={styles.form}>
      <Text style={styles.stepText}>
        {t('step', { current: registerStep, total: TOTAL_REGISTER_STEPS })}
      </Text>

      {renderRegisterStep()}

      <View style={styles.row}>
        {registerStep > 1 && (
          <CustomTouchable style={styles.secondaryButton} onPress={handleBack}>
            <Text>{t('back')}</Text>
          </CustomTouchable>
        )}

        <CustomTouchable style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {registerStep === TOTAL_REGISTER_STEPS
              ? t('sign_up')
              : t('next')}
          </Text>
        </CustomTouchable>
      </View>
    </View>
  )

  return (
    <>
      <CommonDialog
        isVisible={visible}
        onClose={onClose}
        title={mode === 'login' ? t('sign_in') : t('sign_up')}
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setMode('login')}>
            <Text style={[styles.tab, mode === 'login' && styles.activeTab]}>
              {t('sign_in')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode('register')}>
            <Text style={[styles.tab, mode === 'register' && styles.activeTab]}>
              {t('sign_up')}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'login' ? renderLogin() : renderRegister()}
      </CommonDialog>

      {showForgotPassword && (
        <ForgotPasswordDialog
          onOpenLoginAccountDialog={onOpen}
          visible={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </>
  )
}

export default LoginAccountDialog

const styles = ScaledSheet.create({
  form: { gap: '12@ms' },

  label: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: palette.grey[700],
    marginBottom: '8@ms',
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: '16@ms',
  },

  tab: {
    marginHorizontal: '12@ms',
    fontSize: '16@ms',
    color: palette.grey[500],
  },

  activeTab: {
    color: palette.main[600],
    fontWeight: 'bold',
  },

  primaryButton: {
    marginTop: '12@ms',
    backgroundColor: palette.main[600],
    height: '50@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '10@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: palette.grey[300],
    paddingHorizontal: '16@ms',
    height: '50@ms',
    borderRadius: '10@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'space-between',
    gap: '8@ms',
  },

  stepText: {
    textAlign: 'center',
    color: palette.grey[500],
  },

  forgotPassword: {
    alignSelf: 'flex-end',
  },

  forgotPasswordText: {
    ...TYPO.body3,
    color: palette.main[500],
    fontWeight: '600',
  },
})