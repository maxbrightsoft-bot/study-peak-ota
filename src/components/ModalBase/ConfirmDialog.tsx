import React, { FC, useEffect, useState } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import ModalBase from './ModalBase'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import TextField from '../Input/TextField'

export interface ConfirmDialogProps {
  text: string
  cancelText?: string
  okText?: string
  onConfirm?: (e?: any) => void
  open: boolean
  toggle: (e?: any) => void
  onCancel?: (e?: any) => void
  isDelete?: boolean
  title?: string
  confirmText?: string
  hideConfirmButton?: boolean
  hideCancelButton?: boolean
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  text,
  cancelText,
  okText,
  title,
  onCancel,
  confirmText,
  toggle,
  onConfirm,
  hideConfirmButton,
  hideCancelButton
}) => {
  const [confirmTextValue, setConfirmTextValue] = useState('')
  const { t } = useTranslation()

  const isValid = !!confirmText && confirmTextValue.trim() === confirmText.trim()
  const isDisableDelete = !!confirmText && confirmTextValue.trim() !== confirmText.trim()

  useEffect(() => {
    if (!open) setConfirmTextValue('')
  }, [open])

  return (
    <ModalBase isVisible={open} onClose={toggle} styleContainer={styles.container}>
      <View style={styles.header}>
        <View></View>
        <Text style={[styles.title]}>{title}</Text>
        <TouchableOpacity onPress={toggle} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={palette.grey[900]} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.text, { textAlign: confirmText ? 'left' : 'center' }]}>{text}</Text>
        {!!confirmText && (
          <>
            <Text style={styles.confirmHint}>{t('enter_text_to_confirm_delete', { text: confirmText })}</Text>
            <TextField
              value={confirmTextValue}
              onChangeText={setConfirmTextValue}
              placeholder={t('please_enter')}
              textInputStyle={[confirmTextValue && !isValid && styles.inputError]}
            />
          </>
        )}
      </View>
      <View style={[styles.footer]}>
        {!hideCancelButton && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, hideConfirmButton && { flex: 1 }]}
            onPress={onCancel ?? toggle}
          >
            <Text style={styles.cancelButtonText} numberOfLines={1} adjustsFontSizeToFit>
              {cancelText || t('cancel')}
            </Text>
          </TouchableOpacity>
        )}
        {!hideConfirmButton && onConfirm && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              { borderRadius: 12 },
              !hideCancelButton && { flex: 1 },
              !!confirmTextValue && !isValid && styles.disabledButton
            ]}
            disabled={isDisableDelete}
            onPress={onConfirm}
          >
            <Text
              style={styles.confirmButtonText}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {okText || t('confirm')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalBase>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: '20@ms'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '24@ms',
    paddingVertical: '14@ms'
  },
  title: {
    fontSize: '16@ms',
    fontWeight: 600,
    color: '#222222'
  },
  content: {
    padding: '24@ms'
  },
  closeButton: {
    padding: '4@ms'
  },
  text: {
    fontWeight: '600',
    marginBottom: '10@ms',
    fontSize: '16@ms',
    color: '#222222'
  },
  confirmHint: {
    marginBottom: '8@ms',
    color: '#666'
  },
  input: {
    borderWidth: '1@ms',
    borderColor: '#ccc',
    borderRadius: '6@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    color: '#222222'
  },
  inputError: {
    color: 'red'
  },
  actions: {
    padding: '24@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '16@ms'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '16@ms',
    gap: '8@ms'
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '46@ms'
  },
  cancelButton: {
    borderWidth: 0,
    borderRadius: '999@ms',
    minWidth: '80@ms',
    paddingHorizontal: '16@ms'
  },
  confirmButton: {
    backgroundColor: palette.main[600],
    borderRadius: '12@ms',
    flex: 1
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.main[600],
    textAlign: 'center'
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: '#FFF',
    textAlign: 'center'
  },
  disabledButton: {
    backgroundColor: palette.grey[300]
  }
})
