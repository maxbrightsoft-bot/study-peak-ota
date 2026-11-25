import React from 'react'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { TFunction } from 'i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import ModalBase from '@/components/ModalBase/ModalBase'
import { palette } from '@/theme'
import { CODE_LENGTH, isValidCode } from '../utils/linkRules'
import { UnlinkStep } from '../utils/unlinkSteps'

type UnlinkGoogleModalProps = {
  t: TFunction<'translation', undefined>
  step: UnlinkStep
  email: string
  code: string
  error?: string
  resendSecondsLeft: number
  onChangeCode: (value: string) => void
  onResend: () => void
  onConfirm: () => void
  onClose: () => void
}

const UnlinkGoogleModal = ({
  t,
  step,
  email,
  code,
  error,
  resendSecondsLeft,
  onChangeCode,
  onResend,
  onConfirm,
  onClose
}: UnlinkGoogleModalProps) => {
  const submitting = step === 'submitting'
  const canConfirm = isValidCode(code) && !submitting
  const canResend = resendSecondsLeft <= 0 && !submitting

  return (
    <ModalBase
      isVisible={step === 'code' || submitting}
      onClose={onClose}
      disableBackdropPress
      styleContainer={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('unlink_verify_title', { provider: 'Google' })}</Text>
        <TouchableOpacity onPress={onClose} disabled={submitting} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={palette.grey[900]} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.text}>{t('unlink_code_sent', { email })}</Text>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={onChangeCode}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          placeholder={t('unlink_code_label')}
          placeholderTextColor={palette.grey[400]}
          autoFocus
          textContentType="oneTimeCode"
          editable={!submitting}
        />
        <TouchableOpacity onPress={onResend} disabled={!canResend}>
          <Text style={[styles.link, !canResend && styles.disabled]}>
            {resendSecondsLeft > 0 ? `${t('resend_code')} (${resendSecondsLeft}s)` : t('resend_code')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.action, styles.actionDanger, !canConfirm && styles.disabled]}
          disabled={!canConfirm}
          onPress={onConfirm}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={palette.common.white} />
          ) : (
            <Text style={styles.actionTextFilled}>{t('confirm')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} disabled={submitting} onPress={onClose}>
          <Text style={styles.actionText}>{t('cancel')}</Text>
        </TouchableOpacity>
      </View>
    </ModalBase>
  )
}

export default UnlinkGoogleModal

const styles = ScaledSheet.create({
  container: { backgroundColor: palette.common.white, borderRadius: '20@ms' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingTop: '16@ms',
    paddingBottom: '8@ms',
    gap: '8@ms'
  },
  title: { flex: 1, fontSize: '16@ms', fontWeight: '700', color: palette.grey[900] },
  closeButton: { padding: '4@ms' },
  content: { paddingHorizontal: '20@ms', paddingVertical: '8@ms', gap: '12@ms' },
  text: { fontSize: '14@ms', color: palette.grey[900] },
  link: { fontSize: '14@ms', fontWeight: '600', color: palette.main[600] },
  error: {
    fontSize: '13@ms',
    color: palette.error.dark,
    backgroundColor: palette.red[100],
    borderRadius: '8@ms',
    padding: '10@ms'
  },
  codeInput: {
    height: '52@ms',
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '10@ms',
    paddingHorizontal: '12@ms',
    fontSize: '22@ms',
    letterSpacing: 6,
    textAlign: 'center',
    color: palette.grey[900]
  },
  footer: { padding: '16@ms', gap: '8@ms' },
  action: { height: '46@ms', borderRadius: '10@ms', alignItems: 'center', justifyContent: 'center' },
  actionDanger: { backgroundColor: palette.error.main },
  actionText: { fontSize: '15@ms', fontWeight: '600', color: palette.main[600] },
  actionTextFilled: { fontSize: '15@ms', fontWeight: '600', color: palette.common.white },
  disabled: { opacity: 0.5 }
})
