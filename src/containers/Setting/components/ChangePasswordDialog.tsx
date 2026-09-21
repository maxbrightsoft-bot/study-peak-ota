import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { changePasswordApi } from '@/containers/Login/apiClients/accountService'
import { getErrorMessage, toast } from '@/utils/helpers'
import { palette } from '@/theme'
import TextField from '@/components/Input/TextField'
import PasswordRequirements from '@/components/Input/PasswordRequirements'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { ScaledSheet } from 'react-native-size-matters'
import useAuthStore from '@/store/useAuthStore'
import { PASSWORD_POLICY } from '@/utils/constants'

type Props = {
  visible: boolean
  onClose: () => void
  cancelText?: string
}

const ChangePasswordDialog = ({ visible, onClose, cancelText }: Props) => {
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const loading = useAuthStore(state => state.isLoading)
  const hasPassword = user?.hasPassword !== false
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validationSchema = Yup.object().shape({
    ...(hasPassword ? {
      currentPassword: Yup.string()
        .required(t('current_password_required'))
    } : {}),
    newPassword: Yup.string()
      .matches(PASSWORD_POLICY, t('password_policy_violation'))
      .required(t('new_password_required'))
      .test(
        'not-same-as-current',
        t('new_password_cannot_be_same_as_old_password'),
        function (value) {
          const { currentPassword } = this.parent
          if (hasPassword && currentPassword && value && currentPassword === value) {
            return false
          }
          return true
        }
      ),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('passwords_do_not_match'))
      .required(t('confirm_password_required'))
  })

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        await changePasswordApi({
          ...(hasPassword ? { currentPassword: values.currentPassword.trim() } : {}),
          newPassword: values.newPassword.trim()
        })
        if (hasPassword) {
          toast.success(t('change_password_success'))
        } else {
          toast.success(t('create_password_success'))
        }
        if (user) {
          useAuthStore.getState().setUser({
            ...user,
            hasPassword: true,
            mustChangePassword: false
          })
        }
        useAuthStore.getState().setWeakPassword(false)
        handleClose()
      } catch (error: any) {
        toast.error(getErrorMessage(t, error))
      } finally {
        setLoading(false)
      }
    }
  })

  const handleClose = () => {
    formik.resetForm()
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    onClose()
  }

  React.useEffect(() => {
    if (!visible) {
      formik.resetForm()
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
    }
  }, [visible])

  const currentPasswordError =
    formik.touched.currentPassword && formik.errors.currentPassword
      ? formik.errors.currentPassword
      : ''

  const newPasswordError =
    (formik.touched.newPassword || formik.submitCount > 0) &&
    (formik.errors.newPassword === t('new_password_required') ||
     formik.errors.newPassword === t('new_password_cannot_be_same_as_old_password'))
      ? formik.errors.newPassword
      : ''

  const confirmNewPasswordError =
    formik.touched.confirmNewPassword && formik.errors.confirmNewPassword
      ? formik.errors.confirmNewPassword
      : ''

  return (
    <CommonDialog
      isVisible={visible}
      onClose={handleClose}
      disableBackdropPress
      title={hasPassword ? t('change_password') : t('create_password')}
      submitText={loading ? t('submitting') : t('submit')}
      cancelText={cancelText}
      onSubmit={formik.handleSubmit}
    >
      <View style={styles.container}>
        {/* Current Password */}
        {hasPassword && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('current_password_label')}</Text>
            <TextField
              value={formik.values.currentPassword}
              onChangeText={(text: string) => formik.setFieldValue('currentPassword', text)}
              onBlur={() => formik.setFieldTouched('currentPassword', true)}
              placeholder={t('enter_current_password')}
              secureTextEntry={!showCurrent}
              readOnly={loading}
              error={currentPasswordError}
              rightComponent={
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons
                    name={showCurrent ? 'eye-off' : 'eye'}
                    size={20}
                    color={palette.grey[500]}
                  />
                </TouchableOpacity>
              }
            />
          </View>
        )}

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('new_password_label')}</Text>
          <TextField
            value={formik.values.newPassword}
            onChangeText={(text: string) => formik.setFieldValue('newPassword', text)}
            onBlur={() => formik.setFieldTouched('newPassword', true)}
            placeholder={t('enter_new_password')}
            secureTextEntry={!showNew}
            readOnly={loading}
            error={newPasswordError}
            rightComponent={
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Ionicons
                  name={showNew ? 'eye-off' : 'eye'}
                  size={20}
                  color={palette.grey[500]}
                />
              </TouchableOpacity>
            }
          />
          {/* Password Requirements */}
          <PasswordRequirements
            password={formik.values.newPassword}
            hasSubmitted={formik.submitCount > 0}
          />
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('confirm_new_password_label')}</Text>
          <TextField
            value={formik.values.confirmNewPassword}
            onChangeText={(text: string) => formik.setFieldValue('confirmNewPassword', text)}
            onBlur={() => formik.setFieldTouched('confirmNewPassword', true)}
            placeholder={t('re_enter_new_password')}
            secureTextEntry={!showConfirm}
            readOnly={loading}
            error={confirmNewPasswordError}
            rightComponent={
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons
                  name={showConfirm ? 'eye-off' : 'eye'}
                  size={20}
                  color={palette.grey[500]}
                />
              </TouchableOpacity>
            }
          />
        </View>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {
    gap: '16@ms'
  },
  inputGroup: {
    gap: '6@ms'
  },
  label: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#222'
  },
  strengthContainer: {
    flexDirection: 'row',
    gap: '4@ms',
    marginTop: '4@ms'
  },
  strengthBar: {
    flex: 1,
    height: '4@ms',
    borderRadius: '2@ms'
  }
})

export default ChangePasswordDialog
