import React, { ReactNode } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { palette, TYPO } from '@/theme'
import ModalBase from './ModalBase'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { PositionFlex } from '@/utils/enums'
import { useTranslation } from 'react-i18next'

interface CommonDialogProps {
  isVisible: boolean
  onClose: () => void
  title?: string
  cancelText?: string
  submitText?: string
  onSubmit?: () => void
  children: ReactNode
  positionTitle?: PositionFlex
  isVisibleHeader?: boolean
  disableInnerTouchable?: boolean
}

const CommonDialog: React.FC<CommonDialogProps> = ({
  isVisible,
  onClose,
  cancelText,
  title = '',
  children,
  submitText,
  onSubmit,
  positionTitle = PositionFlex.Center,
  isVisibleHeader = true,
  disableInnerTouchable
}) => {
  const { t } = useTranslation()
  return (
    <ModalBase isVisible={isVisible} onClose={onClose} styleContainer={styles.container} disableInnerTouchable={disableInnerTouchable}>
      {isVisibleHeader && (
        <View style={styles.header}>
          <View></View>
          <Text style={[styles.title, { alignSelf: positionTitle }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={palette.grey[900]} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>{children}</View>
      {onSubmit && <View style={[styles.footer]}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.cancelButtonText}>{cancelText || t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.confirmButton, { borderRadius: 12 }]} onPress={onSubmit}>
          <Text style={styles.confirmButtonText}>{submitText || t('submit')}</Text>
        </TouchableOpacity>
      </View>}
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
    fontSize: 16,
    fontWeight: 600,
    color: '#222222'
  },
  closeButton: {
    padding: '4@ms'
  },
  content: {
    padding: '24@ms',
    flexShrink: 1
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '8@ms',
    padding: '12@ms',
    ...TYPO.body1,
    color: palette.grey[900]
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '16@ms',
    gap: '8@ms'
  },
  centerFooter: {
    justifyContent: 'center'
  },
  betweenFooter: {
    justifyContent: 'space-between'
  },
  button: {
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    borderWidth: 0,
    borderRadius: 999,
  },
  confirmButton: {
    backgroundColor: palette.main[600],
    borderRadius: 6
  },
  cancelButtonText: {
    ...TYPO.button2,
    lineHeight: 22,
    color: palette.main[600]
  },
  confirmButtonText: {
    ...TYPO.button2,
    lineHeight: 22,
    color: '#FFF'
  }
})

export default CommonDialog
