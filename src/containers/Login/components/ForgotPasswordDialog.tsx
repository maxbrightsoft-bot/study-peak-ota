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
    otpFormik,
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

  const otpError =
    otpFormik.touched.otp && otpFormik.errors.otp
      ? otpFormik.errors.otp
      : ''

  const newPasswordError =
    resetFormik.touched.newPassword && resetFormik.errors.newPassword
      ? resetFormik.errors.newPassword
      : ''

  const confirmPasswordError =
    resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword
      ? resetFormik.errors.confirmPassword
      : ''

  const OptionCard = ({
    type,
    title,
    description,
  }: {
    type: 'main'
    title: string
    description: string
  }) => {
    const active = emailFormik.values.sendToType === type
    return (
      <TouchableOpacity
        onPress={() => emailFormik.setFieldValue('sendToType', type)}
        style={[
          styles.optionCard,
          active ? styles.optionCardActive : styles.optionCardInactive,
        ]}
      >
        <View
          style={[
            styles.radioButton,
            active ? styles.radioButtonActive : styles.radioButtonInactive,
          ]}
        >
          {active && <View style={styles.radioButtonInner} />}
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
      </TouchableOpacity>
    )
  }

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

      <View style={styles.optionsContainer}>
        <Text style={styles.label}>{t('send_otp_to_destination')}</Text>
        <View style={styles.optionsList}>
          <OptionCard
            type="main"
            title={t('main_email')}
            description={t('main_email_desc')}
          />
        </View>
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

  const renderOtpStep = () => (
    <View style={styles.form}>
      <Text style={styles.description}>
        {t('verification_code_sent')}
      </Text>

      <View>
        <Text style={styles.label}>{t('verification_code')}</Text>
        <TextField
          onChangeText={(text: string) => otpFormik.setFieldValue('otp', text)}
          value={otpFormik.values.otp}
          error={otpError}
          keyboardType="number-pad"
        />
      </View>

      <CustomTouchable
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={() => otpFormik.handleSubmit()}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? t('please_wait_a_moment') : t('confirmation')}
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

  const renderResetStep = () => (
    <View style={styles.form}>
      <Text style={styles.description}>
        {t('reset_password_description')}
      </Text>

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
          {loading ? t('submitting') : t('change_password')}
        </Text>
      </CustomTouchable>
    </View>
  )

  return (
    <CommonDialog
      isVisible={visible}
      onClose={handleClose}
      title={
        step === 'email'
          ? t('forgot_password')
          : step === 'verify_otp'
          ? t('verification_code')
          : t('change_password')
      }
    >
      {step === 'email' && renderEmailStep()}
      {step === 'verify_otp' && renderOtpStep()}
      {step === 'reset' && renderResetStep()}
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
  optionsContainer: {
    marginTop: '4@ms',
  },
  optionsList: {
    gap: '8@ms',
  },
  optionCard: {
    padding: '12@ms',
    borderRadius: '8@ms',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms',
  },
  optionCardActive: {
    borderColor: palette.main[600],
    backgroundColor: `${palette.main[600]}10`,
  },
  optionCardInactive: {
    borderColor: palette.grey[300],
    backgroundColor: '#fff',
  },
  radioButton: {
    width: '20@ms',
    height: '20@ms',
    borderRadius: '10@ms',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: palette.main[600],
  },
  radioButtonInactive: {
    borderColor: palette.grey[400],
  },
  radioButtonInner: {
    width: '10@ms',
    height: '10@ms',
    borderRadius: '5@ms',
    backgroundColor: palette.main[600],
  },
  optionTextContainer: {
    flex: 1,
    gap: '2@ms',
  },
  optionTitle: {
    ...TYPO.body2,
    fontWeight: 'bold',
    color: palette.grey[800],
  },
  optionDescription: {
    ...TYPO.caption,
    color: palette.grey[500],
  },
})
