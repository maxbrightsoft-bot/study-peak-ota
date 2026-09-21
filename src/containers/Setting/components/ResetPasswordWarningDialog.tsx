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
  isMustChange?: boolean
}

const ResetPasswordWarningDialog = ({ visible, onClose, onConfirm, isMustChange = true }: Props) => {
  const { t } = useTranslation()

  return (
    <CommonDialog
      isVisible={visible}
      onClose={onClose}
      title={
        isMustChange
          ? t('confirmation')
          : t('security_tip')
      }
      submitText={t('confirm')}
      cancelText={t('change_later')}
      onSubmit={onConfirm}
    >
      <View style={styles.container}>
        <Text style={styles.message}>
          {isMustChange
            ? t('password_reset_warning_msg')
            : t('password_weak_warning_msg')}
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
