import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'
import { InfoExamSessionByCode } from '@/utils/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  codeExam: string
  open: boolean
  onClose: () => void
  examSession?: InfoExamSessionByCode
  handleCodeExam: (code: string, callback?: Function) => void
}

const ConfirmExamCode = ({ codeExam, onClose, open, examSession, handleCodeExam }: Props) => {
  const { t } = useTranslation()

  return (
    <CommonDialog
      isVisible={open}
      onClose={onClose}
      title={t('confirm_exam_info')}
      submitText={t('confirm')}
      onSubmit={() => handleCodeExam(codeExam, onClose)}
    >
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('exam_name')}</Text>
          <Text style={styles.value}>{examSession?.title}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('exam_code')}</Text>
          <Text style={styles.value}>{examSession?.code}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('exam_subject')}</Text>
          <Text style={styles.value}>{examSession?.subject}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('grade_class')}</Text>
          <Text style={styles.value}>
            {t('number_grade', { number: examSession?.grade })} {examSession?.classes.join(', ')}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('teacher_name')}</Text>
          <Text style={styles.value}>{examSession?.teacherName}</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.startText}>{t('confirm_exam_start')}</Text>
        </TouchableOpacity>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {},

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8@ms'
  },

  label: {
    fontSize: '14@ms',
    color: palette.grey[500],
    fontWeight: '500',
    lineHeight: '23@ms'
  },

  value: {
    fontSize: '16@ms',
    fontWeight: '500',
    color: '#222222',
    textAlign: 'right'
  },

  startText: {
    marginTop: '16@ms',
    fontSize: '14@ms',
    color: palette.main[600],
    textAlign: 'center',
    fontWeight: '600'
  }
})

export default ConfirmExamCode
