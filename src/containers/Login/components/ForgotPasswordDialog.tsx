import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import TextField from '@/components/Input/TextField'
import { useTranslation } from 'react-i18next'
import CustomTouchable from '@/components/Button/CustomTouchable'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import useForgotPassword from '../hooks/useForgotPassword'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  visible: boolean
  onOpenLoginAccountDialog: () => void
  onClose: () => void
}

const ForgotPasswordDialog = ({ visible, onOpenLoginAccountDialog, onClose }: Props) => {
  const { t } = useTranslation()
  const {
    step,
    loading,
    emailFormik,
    resetFormik,
    showNewPassword,
    showConfirmPassword,
    toggleShowNewPassword,
    toggleShowConfirmPassword,
    handleReset,
    handleResendCode,
  } = useForgotPassword({ onOpenLoginAccountDialog, onClose})

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const emailError =
    emailFormik.touched.email && emailFormik.errors.email
      ? emailFormik.errors.email
      : ''

  const codeError =
    resetFormik.touched.otp && resetFormik.errors.otp
      ? resetFormik.errors.otp
      : ''

  const newPasswordError =
    resetFormik.touched.newPassword && resetFormik.errors.newPassword
      ? resetFormik.errors.newPassword
      : ''

  const confirmPasswordError =
    resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword
      ? resetFormik.errors.confirmPassword
      : ''

  const renderEmailStep = () => (
    <View style={styles.form}>
      <Text style={styles.description}>
        {t('forgot_password_description')}
      </Text>

      <View>
        <Text style={styles.label}>{t('email')}</Text>
        <TextField
          onChangeText={(text: string) => emailFormik.setFieldValue('email', text)}
          value={emailFormik.values.email}
          error={emailError}
          keyboardType="email-address"
        />
      </View>

      <CustomTouchable
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={() => emailFormik.handleSubmit()}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? t('please_wait_a_moment') : t('send_verification_code')}
        </Text>
      </CustomTouchable>
    </View>
  )

  const renderResetStep = () => (
    <View style={styles.form}>
      <Text style={styles.description}>
        {t('reset_password_description')}
      </Text>

      <View>
        <Text style={styles.label}>{t('verification_code')}</Text>
        <TextField
          onChangeText={(text: string) => resetFormik.setFieldValue('otp', text)}
          value={resetFormik.values.otp}
          error={codeError}
          keyboardType="number-pad"
        />
      </View>

      <View>
        <Text style={styles.label}>{t('new_password')}</Text>
        <TextField
          onChangeText={(text: string) => resetFormik.setFieldValue('newPassword', text)}
          value={resetFormik.values.newPassword}
          error={newPasswordError}
          secureTextEntry={!showNewPassword}
          rightComponent={
            <TouchableOpacity onPress={toggleShowNewPassword}>
              <Ionicons
                name={showNewPassword ? 'eye-off' : 'eye'}
                size={20}
                color={palette.grey[500]}
              />
            </TouchableOpacity>
          }
        />
      </View>

      <View>
        <Text style={styles.label}>{t('confirm_new_password')}</Text>
        <TextField
          onChangeText={(text: string) => resetFormik.setFieldValue('confirmPassword', text)}
          value={resetFormik.values.confirmPassword}
          error={confirmPasswordError}
          secureTextEntry={!showConfirmPassword}
          rightComponent={
            <TouchableOpacity onPress={toggleShowConfirmPassword}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={palette.grey[500]}
              />
            </TouchableOpacity>
          }
        />
      </View>

      <CustomTouchable
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={() => resetFormik.handleSubmit()}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? t('please_wait_a_moment') : t('reset_password')}
        </Text>
      </CustomTouchable>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendCode}
        disabled={loading}
      >
        <Text style={styles.resendButtonText}>
          {t('resend_verification_code')}
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <CommonDialog
      isVisible={visible}
      onClose={handleClose}
      title={step === 'email' ? t('forgot_password') : t('reset_password')}
    >
      {step === 'email' ? renderEmailStep() : renderResetStep()}
    </CommonDialog>
  )
}

export default ForgotPasswordDialog

const styles = ScaledSheet.create({
  form: {
    gap: '12@ms',
  },
  description: {
    ...TYPO.body3,
    color: palette.grey[600],
    marginBottom: '4@ms',
  },
  label: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: palette.grey[700],
    marginBottom: '8@ms',
  },
  submitButton: {
    marginTop: '16@ms',
    backgroundColor: palette.main[600],
    height: '54@ms',
    borderRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.main[600],
    shadowOffset: { width: 0, height: '4@ms' },
    shadowOpacity: 0.2,
    shadowRadius: '8@ms',
    elevation: '4@ms',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...TYPO.button,
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: '8@ms',
  },
  resendButtonText: {
    ...TYPO.body3,
    color: palette.main[500],
    fontWeight: '600',
  },
})
