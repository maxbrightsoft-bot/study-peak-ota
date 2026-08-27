import React from 'react'
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

type Props = {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
}

const ResetPasswordWarningDialog = ({ visible, onClose, onConfirm }: Props) => {
  const { t } = useTranslation()

  return (
    <CommonDialog
      isVisible={visible}
      onClose={onClose}
      title={t('confirmation')}
      submitText={t('confirm')}
      cancelText={t('change_later')}
      onSubmit={onConfirm}
    >
      <View style={styles.container}>
        <Text style={styles.message}>
          {t(
            'password_reset_warning_msg',
            'Your password has been reset. Therefore, to ensure security, please change your password.'
          )}
        </Text>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '8@ms'
  },
  message: {
    fontSize: '14@ms',
    color: palette.grey[700],
    lineHeight: '20@ms'
  }
})

export default ResetPasswordWarningDialog
