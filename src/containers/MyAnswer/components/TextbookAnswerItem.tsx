import React, { FC, Fragment, memo, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { TextbookAnswerItemProps } from '../configs/types'
import { formatTimeDiff, formatTimeSecond } from '@/utils/helpers'
import { palette, red } from '@/theme/colors'
import { Ionicons } from '@expo/vector-icons'

const getResponseColor = (signal: number) => {
  switch (signal) {
    case 0: return '#6B0861'
    case 1: return '#DB4D4B'
    case 2: return '#FEAF06'
    case 3: return '#3ACB46'
    case 4: return '#5D5D5B'
    default: return palette.grey[700]
  }
}

const getOverallColor = (rate: number) => {
  if (rate >= 90) return '#1EE288'
  if (rate >= 70) return '#3ACB46'
  if (rate >= 50) return '#FEAF06'
  if (rate >= 30) return '#F34B4B'
  return '#FF0000'
}

const getProblemCategoryColor = (problem: number) => {
  switch (problem) {
    case 1: return '#1EE288'
    case 3: return '#FEAF06'
    case 2: return '#F34B4B'
    case 0: return '#DDDDDD'
    case 4:
    case 5: return '#FF0000'
    default: return '#DDDDDD'
  }
}

const StarIcon = memo(({ isStar }: { isStar: boolean }) => (
  isStar
    ? <Ionicons name="star" size={16} color="#F59E0B" />
    : <Ionicons name="star-outline" size={16} color="#9CA3AF" />
))

const AnswerStatusIcon = memo(({ isCorrect, isSelected, t }: { isCorrect: boolean; isSelected: boolean; t: any }) => {
  if (isCorrect && isSelected) {
    return (
      <Fragment>
        <Ionicons name="checkmark-circle-sharp" size={16} color="#10B981" />
        <Text style={[styles.statusText, styles.correctText]}>{t('correct')}</Text>
      </Fragment>
    )
  }
  if (!isCorrect && isSelected) {
    return (
      <Fragment>
        <Ionicons name="close-circle-sharp" size={16} color="#EF4444" />
        <Text style={[styles.statusText, styles.incorrectText]}>{t('incorrect')}</Text>
      </Fragment>
    )
  }
  return (
    <Fragment>
      <Ionicons name="remove-circle-outline" size={16} color="#6B7280" />
      <Text style={[styles.statusText, styles.noSolutionText]}>{t('no_solution')}</Text>
    </Fragment>
  )
})

const TextbookAnswerItem: FC<TextbookAnswerItemProps> = ({
  data,
  nextData,
  isFirst,
  isLast,
  effectSize,
  onCreateNote,
  onCreateQuestion,
}) => {
  const { t } = useTranslation()

  const isSelected = !!data.selectedAnswers?.length || !!data.textualAnswers?.length

  const questionNumber = useMemo(() =>
    data.parentQuestionId
      ? `${(data.parentQuestionOrder || 0) + 1}.${(data.questionOrder || 0) + 1}`
      : `${(data.questionOrder || 0) + 1}`,
    [data.parentQuestionId, data.parentQuestionOrder, data.questionOrder]
  )

  const unitText = useMemo(() =>
    data.unit ? ` [${data.unit}]` : '',
    [data.unit]
  )

  const borderBottomColor = useMemo(() =>
    data?.questionGroupIndex !== nextData?.questionGroupIndex && !isFirst && !isLast
      ? '#E4E7EC'
      : 'transparent',
    [data?.questionGroupIndex, nextData?.questionGroupIndex, isFirst, isLast]
  )

  const getProblemCategoryLabel = useCallback((problem: number) => {
    switch (problem) {
      case 1: return t('easy_problem')
      case 3: return t('trick_problem')
      case 2: return t('differential_problem')
      case 0: return t('general_problem')
      case 4: return t('difficult_problem')
      case 5: return t('super_difficult_problem')
      default: return ''
    }
  }, [t])

  const durationNode = useMemo(() => {
    if (data.duration != 0) {
      const textColor = data.answerResponseSignal !== null
        ? getResponseColor(data.answerResponseSignal)
        : '#9E9E9E'
      return (
        <Text style={[styles.durationText, { color: textColor }]}>
          {formatTimeSecond(Math.round(data.duration), t)}
        </Text>
      )
    }
    return <Text style={styles.noTimeText}>{t('no_time')}</Text>
  }, [data.duration, data.answerResponseSignal, t])

  const comparisonNode = useMemo(() => {
    if (data.duration != 0 && data.topDuration) {
      const textColor = data.answerResponseSignal !== null
        ? getResponseColor(data.answerResponseSignal)
        : '#9E9E9E'
      return (
        <Text style={[styles.durationText, { color: textColor }]}>
          {formatTimeDiff(data.duration, data.topDuration, t)}
        </Text>
      )
    }
    return <Text style={styles.noTimeText}>-</Text>
  }, [data.duration, data.topDuration, data.answerResponseSignal, t])

  const overallRateNode = useMemo(() => {
    const overallColor = getOverallColor(data?.overallCorrectRate)
    const skipRate = data.skipRate?.toFixed(2) ?? '0.00'
    return (
      <View style={styles.overallContainer}>
        <Text style={[styles.overallRate, { color: overallColor }]}>
          {`${data.overallCorrectRate?.toFixed(2)}%`}
        </Text>
        <Text style={styles.skipRate}>{`(${skipRate}%)`}</Text>
      </View>
    )
  }, [data.overallCorrectRate, data.skipRate])

  const categoriesNode = useMemo(() => {
    if (!effectSize?.problemCategories) return null
    return (
      <View style={styles.categoriesContainer}>
        {effectSize.problemCategories.map((problem: number, idx: number) => (
          <View key={idx} style={[styles.categoryChip, { borderColor: getProblemCategoryColor(problem) }]}>
            <Text style={styles.categoryText}>{getProblemCategoryLabel(problem)}</Text>
          </View>
        ))}
      </View>
    )
  }, [effectSize?.problemCategories, getProblemCategoryLabel])

  return (
    <View style={[styles.container, { borderBottomColor, borderBottomWidth: 1 }]}>
      <View style={styles.row}>
        <View style={styles.column1}>
          <View style={styles.questionInfo}>
            <StarIcon isStar={!!data.isStar} />
            <Text style={styles.questionOrder}>
              {t('number_question', { number: questionNumber })}{unitText}
            </Text>
          </View>
        </View>

        <View style={styles.column2}>
          <View style={styles.statusContainer}>
            <AnswerStatusIcon isCorrect={!!data.isCorrect} isSelected={isSelected} t={t} />
          </View>
        </View>

        <View style={styles.column3}>
          <View style={styles.timeContainer}>{durationNode}</View>
        </View>

        <View style={styles.column4}>
          <View style={styles.timeContainer}>{comparisonNode}</View>
        </View>

        <View style={styles.column5}>
          <View style={styles.rateContainer}>{overallRateNode}</View>
          <View style={styles.categoriesWrapper}>{categoriesNode}</View>
        </View>
      </View>

      {isSelected && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={() => onCreateQuestion?.(data)}>
            <Ionicons name="chatbubbles-outline" size={16} color="#4B5563" />
            <Text style={styles.footerText}>{t('qna')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    minHeight: 60,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  column1: {
    flex: 1.2
  },
  column2: {
    flex: 1
  },
  column3: {
    flex: 1
  },
  column4: {
    flex: 1
  },
  column5: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  column6: {
    flex: 1.5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
    flexWrap: 'wrap'
  },
  questionOrder: {
    fontSize: 13,
    fontWeight: '500',
    color: '#414E62'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexWrap: 'wrap'
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center'
  },
  correctText: {
    color: '#1EE288'
  },
  incorrectText: {
    color: '#F34B4B'
  },
  noSolutionText: {
    color: '#6B7280'
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center'
  },
  noTimeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center'
  },
  rateContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  overallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexWrap: 'wrap'
  },
  overallRate: {
    fontSize: 13,
    fontWeight: '500'
  },
  skipRate: {
    fontSize: 10,
    color: red[900]
  },
  categoriesWrapper: {
    width: '100%'
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center'
  },
  categoryChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: '#FFFFFF'
  },
  categoryText: {
    fontSize: 11,
    color: '#374151'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F3F4F6'
  },
  footerText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500'
  }
})

export default TextbookAnswerItem
