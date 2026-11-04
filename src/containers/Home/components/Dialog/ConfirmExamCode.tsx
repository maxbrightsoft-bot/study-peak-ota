import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'
import { InfoExamSessionByCode } from '@/utils/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import useAppStore from '@/store/useAppStore'

interface Props {
  codeExam: string
  open: boolean
  onClose: () => void
  examSession?: InfoExamSessionByCode
  handleCodeExam: (code: string, callback?: Function) => void
}

const ConfirmExamCode = ({ codeExam, onClose, open, examSession, handleCodeExam }: Props) => {
  const { t } = useTranslation()
  const isAutoNextQuestion = useAppStore(state => state.isAutoNextQuestion)
  const setIsAutoNextQuestion = useAppStore(state => state.setIsAutoNextQuestion)

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
          <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">{examSession?.title}</Text>
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

        <View style={[styles.row, styles.autoNextRow]}>
          <Text style={styles.label}>{t('auto_next_question')}</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAutoNextQuestion(true)}
              style={[
                styles.toggleBtn,
                isAutoNextQuestion && styles.toggleBtnActive
              ]}
            >
              <Text style={[styles.toggleBtnText, isAutoNextQuestion && styles.toggleBtnTextActive]}>
                ON
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAutoNextQuestion(false)}
              style={[
                styles.toggleBtn,
                !isAutoNextQuestion && styles.toggleBtnActiveOff
              ]}
            >
              <Text style={[styles.toggleBtnText, !isAutoNextQuestion && styles.toggleBtnTextActive]}>
                OFF
              </Text>
            </TouchableOpacity>
          </View>
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
    width: '60%',
    fontSize: '13@ms',
    fontWeight: '500',
    color: '#222222',
    textAlign: 'right'
  },

  autoNextRow: {
    marginTop: '6@ms',
    paddingTop: '10@ms',
    borderTopWidth: 1,
    borderTopColor: palette.grey[200]
  },

  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: '8@ms',
    padding: '3@ms',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },

  toggleBtn: {
    paddingHorizontal: '12@ms',
    paddingVertical: '4@ms',
    borderRadius: '6@ms',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '42@ms'
  },

  toggleBtnActive: {
    backgroundColor: palette.main[600]
  },

  toggleBtnActiveOff: {
    backgroundColor: palette.grey[700]
  },

  toggleBtnText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: palette.grey[500]
  },

  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
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
