import CommonDialog from '@/components/ModalBase/CommonDialog'
import TextField from '@/components/Input/TextField'
import { palette, TYPO } from '@/theme'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TextInput, TouchableWithoutFeedback } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import Loading from '@/components/Loading'

interface Props {
  codeExam: string
  setCodeExam: (val: string) => void
  open: boolean
  loading?: boolean
  onClose: () => void
  handleGetInfoExam: (code: string) => void
}

const ModalExamCode = ({ codeExam, loading, setCodeExam, onClose, open, handleGetInfoExam }: Props) => {
  const { t } = useTranslation()
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <CommonDialog
      isVisible={open}
      onClose={onClose}
      title={t('enter_test_code')}
      submitText={t('next')}
      onSubmit={() => handleGetInfoExam(codeExam)}
    >
      {loading && <Loading isOverlay={false} />}
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>{t('code_exam')}</Text>
            <TextField
              inputRef={inputRef}
              autoFocus
              autoCorrect={false}
              value={codeExam}
              onChangeText={setCodeExam}
              isExamCode
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'white',
    gap: '24@ms'
  },
  title: {
    fontSize: '12@ms',
    lineHeight: '22@ms',
    marginBottom: '8@ms',
    textAlign: 'center'
  },
  inputWrapper: {},
  waitingText: {
    ...TYPO.button3,
    color: palette.grey[900],
    textAlign: 'center'
  },
  label: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.grey[900],
    marginBottom: '8@ms'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  centerFooter: {
    justifyContent: 'center'
  },
  betweenFooter: {
    justifyContent: 'space-between'
  },
  button: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '12@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    borderWidth: 0
  },
  confirmButton: {
    backgroundColor: palette.main[600],
    borderRadius: '6@ms'
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.main[600]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: '#FFF'
  }
})

export default ModalExamCode
