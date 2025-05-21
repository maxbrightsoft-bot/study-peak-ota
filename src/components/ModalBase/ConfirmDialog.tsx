import React, { FC, useEffect, useState } from 'react'
import { Text, View, TextInput, TouchableOpacity } from 'react-native'
import { Button, Divider } from 'react-native-paper'
import ModalBase from './ModalBase'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'

export interface ConfirmDialogProps {
  text: string
  cancelText?: string
  okText?: string
  onConfirm: (e?: any) => void
  open: boolean
  toggle: (e?: any) => void
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
        <Text style={styles.title}>{title || t('confirmation')}</Text>
        <Button onPress={toggle} compact>
          <Ionicons name="close-outline" size={24} color="black" />
        </Button>
      </View>

      <View style={styles.content}>
        <Text style={[styles.text, { textAlign: confirmText ? 'left' : 'center' }]}>{text}</Text>
        {!!confirmText && (
          <>
            <Text style={styles.confirmHint}>{t('enter_text_to_confirm_delete', { text: confirmText })}</Text>
            <TextInput
              value={confirmTextValue}
              onChangeText={setConfirmTextValue}
              placeholder={t('please_enter')}
              style={[styles.input, confirmTextValue && !isValid && styles.inputError]}
            />
          </>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={toggle}>
          <Text style={styles.cancelButtonText}> {cancelText || t('no')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, isDisableDelete && styles.disabledButton]}
          disabled={isDisableDelete}
          onPress={onConfirm}
        >
          <Text style={styles.confirmButtonText}>{okText || t('yes')}</Text>
        </TouchableOpacity>
      </View>
    </ModalBase>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: '12@ms'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '24@ms',
    paddingVertical: '14@ms',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[200]
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  content: {
    padding: '24@ms',
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  text: {
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 16
  },
  confirmHint: {
    marginBottom: 8,
    color: '#666'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  inputError: {
    borderColor: 'red'
  },
  actions: {
    padding: '24@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '16@ms'
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '8@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.grey[100]
  },
  confirmButton: {
    backgroundColor: palette.red[900]
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.grey[700]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: 'white'
  },
  disabledButton: {
    backgroundColor: palette.red[500]
  }
})
