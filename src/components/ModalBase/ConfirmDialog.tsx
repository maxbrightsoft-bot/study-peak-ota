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
  onConfirm: (e?: any) => void
  open: boolean
  toggle: (e?: any) => void
  onCancel?: (e?: any) => void
  isDelete?: boolean
  title?: string
  confirmText?: string
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
  onConfirm
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
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel ?? toggle}>
          <Text style={styles.cancelButtonText}>{cancelText || t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, { borderRadius: 12 }, !!confirmTextValue && !isValid && styles.disabledButton]}
          disabled={isDisableDelete}
          onPress={onConfirm}
        >
          <Text style={styles.confirmButtonText}>{okText || t('confirm')}</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: '16@ms',
    gap: '8@ms'
  },
  button: {
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    borderWidth: 0,
    borderRadius: '999@ms'
  },
  confirmButton: {
    backgroundColor: palette.main[600],
    borderRadius: '6@ms'
  },
  cancelButtonText: {
    ...TYPO.button2,
    lineHeight: '22@ms',
    color: palette.main[600]
  },
  confirmButtonText: {
    ...TYPO.button2,
    lineHeight: '22@ms',
    color: '#FFF'
  },
  disabledButton: {
    backgroundColor: palette.grey[300]
  }
})
