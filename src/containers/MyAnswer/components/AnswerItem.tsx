import React, { FC } from 'react'
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { formatTimeDiff, formatTimeSecond } from '@/utils/helpers'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

const IconStarQuestion = () => <Ionicons name="star" size={14} color="#FFD700" />
const IconNoStarQuestion = () => <Ionicons name="star-outline" size={14} color="#C0C0C0" />
const IconCorrectAnswer = () => <Ionicons name="checkmark-circle" size={14} color={palette.main[500]} />
const IconInCorrectAnswer = () => <Ionicons name="close-circle" size={14} color="#F44336" />
const IconNoGrass = () => <Ionicons name="remove-circle-sharp" size={14} color={palette.grey[300]} />

interface AnswerItemProps {
  data: any
  nextData?: any
  isFirst?: boolean
  isLast?: boolean
}

const AnswerItem: FC<AnswerItemProps> = ({ data, nextData, isFirst, isLast }) => {
  const { t } = useTranslation()
  const getBorderStyle = () => {
    if (data?.article !== nextData?.article && !isFirst && !isLast) {
      return {
        borderBottomWidth: 1,
        borderBottomColor: '#E4E7EC'
      }
    }
    return {}
  }

  const getResponseColor = (signal: number) => {
    switch (signal) {
      case 0:
        return '#6B0861'
      case 1:
        return '#DB4D4D'
      case 2:
        return '#FEAF06'
      case 3:
        return '#3ACB46'
      case 4:
        return '#5D5D5B'
      default:
        return palette.grey[700]
    }
  }

  const getOverallColor = (rate: number) => {
    switch (rate) {
      case 1:
        return '#DB4D4D'
      case 2:
        return '#FEAF06'
      case 3:
        return '#3ACB46'
      default:
        return palette.grey[700]
    }
  }

  return (
    <View style={[styles.container, getBorderStyle()]}>
      <View style={styles.row}>
        {/* Question Order */}
        <View style={[styles.cell, { justifyContent: 'flex-start' }]}>
          {data.isStar ? <IconStarQuestion /> : <IconNoStarQuestion />}
          <Text style={styles.questionOrder}>{t('number_question', { number: data.questionOrder + 1 })}</Text>
        </View>

        {/* Answer Status */}
        <View style={styles.cell}>
          {data.isCorrect && data.selectedAnswers !== '' && <IconCorrectAnswer />}
          {!data.isCorrect && data.selectedAnswers !== '' && <IconInCorrectAnswer />}
          {data.selectedAnswers === '' && <IconNoGrass />}
        </View>

        {/* Duration */}
        <View style={styles.cell}>
          <Text
            style={[
              styles.answerResponse,
              {
                color: data.answerResponseSignal != null ? getResponseColor(data.answerResponseSignal) : '#9E9E9E'
              }
            ]}
          >
            {data.answerResponseSignal != null ? formatTimeSecond(Math.round(data.duration), t) : t('no_time')}
          </Text>
        </View>

        {/* Time Difference */}
        <View style={styles.cell}>
          <Text
            style={[
              styles.answerResponse,
              {
                color:
                  data.answerResponseSignal != null && data.topDuration
                    ? getResponseColor(data.answerResponseSignal)
                    : '#9E9E9E'
              }
            ]}
          >
            {data.answerResponseSignal != null && data.topDuration
              ? formatTimeDiff(data.duration, data.topDuration, t)
              : '-'}
          </Text>
        </View>

        {/* Correct Rate */}
        <View style={styles.cell}>
          <Text
            style={[
              styles.answerResponse,
              {
                color: data.answerResponseSignal != null ? getOverallColor(data.overallCorrectRate) : '#9E9E9E'
              }
            ]}
          >
            {data.answerResponseSignal != null ? `${data.overallCorrectRate.toFixed(2)}%` : t('no_time')}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: '24@ms'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: palette.grey[50]
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  questionOrder: {
    ...TYPO.caption,
    marginLeft: 4,
    color: palette.grey[700]
  },
  answerCorrect: {
    fontSize: 12,
    color: palette.green_support[900],
    marginLeft: 4
  },
  answerIncorrect: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 4
  },
  answerNograss: {
    fontSize: 14,
    color: '#9E9E9E',
    marginLeft: 4
  },
  answerResponse: {
    fontSize: 12,
    color: palette.grey[700],
    textAlign: 'center',
    fontWeight: 500
  },
  answerNoTime: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center'
  }
})

export default AnswerItem
