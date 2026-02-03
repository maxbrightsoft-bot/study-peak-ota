import CommonDialog from '@/components/ModalBase/CommonDialog'
import TextField from '@/components/Input/TextField'
import { palette, TYPO } from '@/theme'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity } from 'react-native'
import { Divider } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import Loading from '@/components/Loading'

interface Props {
  codeExam: string
  setCodeExam: (val: string) => void
  open: boolean
  loading: boolean
  onClose: () => void
  handleCodeExam: (code: string) => void
  isCheckTeacherStart: boolean
}

const ModalExamCode = ({ codeExam, loading, setCodeExam, onClose, open, handleCodeExam, isCheckTeacherStart }: Props) => {
  const { t } = useTranslation()

  return (
    <CommonDialog isVisible={open} onClose={onClose} title={t('enter_test_code')}>
      {loading && <Loading isOverlay={false} />}
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          {codeExam && isCheckTeacherStart ? (
            <Text style={styles.waitingText}>{t("i'm_waiting_for_the_teacher_to_start_the_test")}</Text>
          ) : (
            <>
              <Text style={styles.label}>{t('code_exam')}</Text>
              <TextField
                style={styles.input}
                value={codeExam}
                placeholder={t('enter_test_code')}
                onChangeText={setCodeExam}
              />
            </>
          )}
        </View>
        <Divider />
        <View style={[styles.footer, codeExam && isCheckTeacherStart ? styles.centerFooter : styles.betweenFooter]}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
          {!isCheckTeacherStart && (
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={() => handleCodeExam(codeExam)}>
              <Text style={styles.confirmButtonText}>{t('next')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    gap: '24@ms'
  },
  title: {
    ...TYPO.caption,
    marginBottom: 12,
    textAlign: 'center'
  },
  inputWrapper: {},
  waitingText: {
    ...TYPO.button3,
    color: palette.grey[900],
    textAlign: 'center'
  },
  label: {
    ...TYPO.caption,
    color: palette.grey[900],
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: 6
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
    borderRadius: '8@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    borderWidth: 0
  },
  confirmButton: {
    backgroundColor: palette.main[500],
    borderRadius: 6
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: '#FFF'
  }
})

export default ModalExamCode
