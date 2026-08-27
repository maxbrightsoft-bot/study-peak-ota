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
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { ScaledSheet } from 'react-native-size-matters'
import useAuthStore from '@/store/useAuthStore'

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
      .min(6, t('password_min_length'))
      .matches(/[0-9]/, t('password_must_contain_number'))
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, t('password_must_contain_special_char'))
      .required(t('new_password_required')),
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

  const currentPasswordError =
    formik.touched.currentPassword && formik.errors.currentPassword
      ? formik.errors.currentPassword
      : ''

  const newPasswordError =
    formik.touched.newPassword && formik.errors.newPassword
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
          {/* Strength Indicator */}
          <View style={styles.strengthContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor:
                      formik.values.newPassword.length >= step * 3 ? palette.main[600] : palette.grey[200]
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('confirm_new_password_label')}</Text>
          <TextField
            value={formik.values.confirmNewPassword}
            onChangeText={(text: string) => formik.setFieldValue('confirmNewPassword', text)}
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
