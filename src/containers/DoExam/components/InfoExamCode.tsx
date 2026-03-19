import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'
import { InfoExamSessionByCode } from '@/utils/types'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  open: boolean
  onClose: () => void
  examSession?: InfoExamSessionByCode
}

const InfoExamCode = ({ onClose, open, examSession }: Props) => {
  return (
    <CommonDialog isVisible={open} onClose={onClose} title={'시험 정보를 확인해주세요'}>
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>시험 코드</Text>
          <Text style={styles.value}>{examSession?.code}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>시험 카테고리</Text>
          <Text style={styles.value}>{examSession?.category}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>시험 과목</Text>
          <Text style={styles.value}>{examSession?.subject}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>소속 학년</Text>
          <Text style={styles.value}>
            {examSession?.grade}학년 {examSession?.classes.join(', ')}반
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>담당 선생님</Text>
          <Text style={styles.value}>{examSession?.teacherName}</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.startText}>확인을 누르면 시험이 시작됩니다</Text>
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
    lineHeight: 23
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

export default InfoExamCode
