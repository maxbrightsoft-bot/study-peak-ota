import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
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
import SchoolSearchSelect from '@/components/Select/SchoolSearchSelect'
import { ScaledSheet } from 'react-native-size-matters'
import { LoginAccountMode } from '../configs/types'

type Props = {
  visible: boolean
  mode: LoginAccountMode
  onOpen: () => void
  onClose: () => void
}

const LoginAccountDialog = ({ visible, mode: initialMode, onOpen, onClose }: Props) => {
  const { t } = useTranslation()

  const { formik: loginFormik, showPassword, toggleShowPassword, resetShowPassword } = useLoginEmail()

  const [mode, setMode] = useState<LoginAccountMode>(initialMode)
  const {
    formik: registerFormik,
    setField: setRegisterField,
    getError,
    subjectOptions,
    gradeOptions,
    registerStep,
    resetRegister,
    handleBack,
    handleNext,
    apiError,
    setApiError,
  } = useRegisterEmail({
    mode,
    setMode,
    visible,
    onSuccess: (email) => {
      loginFormik.resetForm({ values: { email, password: '' } })
    },
  })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  const handleClose = () => {
    resetRegister()
    loginFormik.resetForm()
    setMode(initialMode)
    resetShowPassword()
    setShowRegisterPassword(false)
    setApiError(null)
    onClose()
  }

  useEffect(() => {
    resetShowPassword()
    setShowRegisterPassword(false)
    setApiError(null)

    if (!visible) {
      resetRegister()
      loginFormik.resetForm()
      setMode(initialMode)
    }
  }, [visible, mode])

  // Layout effect: sync the mode before paint so opening in the other mode never flashes the previous one.
  useLayoutEffect(() => {
    if (visible) setMode(initialMode)
  }, [visible, initialMode])

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
        <Text style={styles.label}>{t('email_or_username')}</Text>
        <TextField
          placeholder={t('enter_email_or_username')}
          autoCapitalize="none"
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
            handleClose()
            setShowForgotPassword(true)
          }}
        >
          <Text style={styles.forgotPasswordText}>
            {t('forgot_password')}
          </Text>
        </TouchableOpacity>

        <CustomTouchable
          style={[styles.primaryButton, { marginTop: 8 }]}
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
        key="step1-email"
        placeholder={t('email')}
        value={registerFormik.values.email}
        error={getError('email')}
        onChangeText={(text: string) => setRegisterField('email', text)}
      />

      <TextField
        key="step1-username"
        placeholder={t('username')}
        autoCapitalize="none"
        value={registerFormik.values.userName}
        error={getError('userName')}
        onChangeText={(text: string) => setRegisterField('userName', text)}
      />
      <Text style={styles.hintText}>{t('username_hint')}</Text>

      <TextField
        key={`step1-password-${showRegisterPassword}`}
        placeholder={t('password')}
        secureTextEntry={!showRegisterPassword}
        value={registerFormik.values.password}
        error={getError('password')}
        onChangeText={(text: string) => setRegisterField('password', text)}
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
        key={`step1-confirmPassword-${showRegisterPassword}`}
        placeholder={t('confirm_password')}
        secureTextEntry={!showRegisterPassword}
        error={getError('confirmPassword')}
        value={registerFormik.values.confirmPassword}
        onChangeText={(text: string) => setRegisterField('confirmPassword', text)}
      />
    </>
  )

  const renderStep2 = () => (
    <>
      <TextField
        key="step2-fullName"
        placeholder={t('full_name')}
        error={getError('fullName')}
        value={registerFormik.values.fullName}
        onChangeText={(text: string) => setRegisterField('fullName', text)}
      />
      <TextField
        key="step2-phoneNumber"
        placeholder={t('phone_number')}
        keyboardType="phone-pad"
        error={getError('phoneNumber')}
        value={registerFormik.values.phoneNumber}
        onChangeText={(text: string) => setRegisterField('phoneNumber', text)}
      />
      <SchoolSearchSelect
        key="step2-schoolName"
        value={registerFormik.values.schoolName}
        onValueChange={(value: string) => setRegisterField('schoolName', value)}
        placeholder={t('school_name')}
        error={getError('schoolName')}
      />
    </>
  )

  const renderStep3 = () => (
    <>
      <TextField
        key="step3-parentName"
        placeholder={t('parent_name')}
        error={getError('parentName')}
        value={registerFormik.values.parentName}
        onChangeText={(text: string) => setRegisterField('parentName', text)}
      />
      <TextField
        key="step3-parentPhoneNumber"
        placeholder={t('parent_phone_number')}
        error={getError('parentPhoneNumber')}
        keyboardType="phone-pad"
        value={registerFormik.values.parentPhoneNumber}
        onChangeText={(text: string) => setRegisterField('parentPhoneNumber', text)}
      />
    </>
  )

  const renderStep4 = () => (
    <>
      <Select
        key="step4-major"
        placeholder={t('select_liberal_arts/science')}
        onValueChange={(value) => setRegisterField('major', value)}
        value={registerFormik.values.major || ''}
        options={subjectOptions}
      />
      <Select
        key="step4-grade"
        placeholder={t('current_grade')}
        onValueChange={(value) => setRegisterField('grade', value)}
        value={registerFormik.values.grade || ''}
        options={gradeOptions}
      />
    </>
  )

  const renderRegisterStep = () => {
    switch (registerStep) {
      case 1:
        return (
          <View key="register-step-1" style={styles.stepContainer}>
            {renderStep1()}
          </View>
        )
      case 2:
        return (
          <View key="register-step-2" style={styles.stepContainer}>
            {renderStep2()}
          </View>
        )
      case 3:
        return (
          <View key="register-step-3" style={styles.stepContainer}>
            {renderStep3()}
          </View>
        )
      case 4:
        return (
          <View key="register-step-4" style={styles.stepContainer}>
            {renderStep4()}
          </View>
        )
      default:
        return null
    }
  }

  const renderRegister = () => (
    <View style={styles.form}>
      <Text style={styles.stepText}>
        {t('step', { current: registerStep, total: TOTAL_REGISTER_STEPS })}
      </Text>

      {renderRegisterStep()}

      {!!apiError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={palette.error.main} />
          <Text style={styles.generalError}>{apiError}</Text>
        </View>
      )}

      <View style={styles.row}>
        {registerStep > 1 && (
          <CustomTouchable
            style={styles.secondaryButton}
            onPress={() => {
              setShowRegisterPassword(false)
              handleBack()
            }}
          >
            <Text style={styles.secondaryButtonText}>{t('back')}</Text>
          </CustomTouchable>
        )}

        <CustomTouchable style={[styles.primaryButton, registerStep > 1 && { flex: 1 }]} onPress={handleNext}>
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
        onClose={handleClose}
        title={mode === LoginAccountMode.Login ? t('sign_in') : t('sign_up')}
      >
        {mode === LoginAccountMode.Login ? renderLogin() : renderRegister()}
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
  form: { gap: '16@ms' },
  stepContainer: { gap: '16@ms' },

  label: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: palette.grey[700],
    marginBottom: '8@ms',
  },

  primaryButton: {
    backgroundColor: palette.main[600],
    height: '50@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '10@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: palette.grey[300],
    paddingHorizontal: '20@ms',
    height: '50@ms',
    borderRadius: '10@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: palette.grey[800],
    fontSize: '16@ms',
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8@ms',
    marginTop: '6@ms',
  },

  hintText: {
    ...TYPO.caption,
    color: palette.grey[500],
  },

  stepText: {
    textAlign: 'center',
    fontSize: '13@ms',
    color: palette.grey[500],
    marginBottom: '2@ms',
  },

  forgotPassword: {
    alignSelf: 'flex-end',
  },

  forgotPasswordText: {
    ...TYPO.body3,
    color: palette.main[500],
    fontWeight: '600',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    backgroundColor: '#FEE2E2',
    borderWidth: '1@ms',
    borderColor: '#FCA5A5',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    borderRadius: '8@ms',
    marginTop: '4@ms',
  },

  generalError: {
    color: palette.error.main,
    fontSize: '12@ms',
    fontWeight: '500',
    flex: 1,
  },
})
