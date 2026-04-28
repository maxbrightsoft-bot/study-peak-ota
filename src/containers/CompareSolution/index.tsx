import React, { FC, useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EffectSize, ExamResult, TextbookResult } from '@/utils/types'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  effectSize: EffectSize[]
  data?: ExamResult | TextbookResult
  isPrint?: boolean
  isTextbook?: boolean
}

const CompareSolution: FC<Props> = ({ effectSize: originalEffectSize, data, isTextbook }) => {
  const { t } = useTranslation()

  const effectSize = useMemo(() => {
    if (!isTextbook) return originalEffectSize
    return originalEffectSize.filter((item) => (item.selectedAnswers?.length || 0) > 0 || (item.textualAnswers?.length || 0) > 0)
  }, [originalEffectSize, isTextbook])

  const statistics = useMemo(() => {
    const correctCount = effectSize.filter((item) => item.isCorrect).length
    const totalCount = effectSize.length
    const rate = totalCount > 0 ? (correctCount / totalCount) * 100 : 0
    return {
      correctCount,
      totalCount,
      rate: rate.toFixed(1)
    }
  }, [effectSize])

  const renderOptionBlock = (item: EffectSize, optionIndex: number) => {
    const optionNum = optionIndex + 1
    const isCorrectAnswer = item.correctAnswers?.includes(optionNum)
    const isSelected = item.selectedAnswers?.includes(optionNum.toString()) || item.selectedAnswers?.includes(optionNum)
    const rate = item.averageAnswers?.[optionIndex] || 0

    let blockStyle: any = styles.defaultBlock
    let textStyle: any = styles.defaultText
    let showCheck = false

    if (isCorrectAnswer) {
      blockStyle = styles.correctBlock
      textStyle = styles.whiteText
      if (isSelected) {
        showCheck = true
      }
    } else if (isSelected) {
      blockStyle = styles.incorrectBlock
      textStyle = styles.errorText
    }

    const circleNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
    const circleNum = circleNumbers[optionIndex] || (optionIndex + 1).toString()

    return (
      <View key={optionIndex} style={[styles.optionBlock, blockStyle]}>
        <Text style={[styles.optionNum, textStyle]}>{circleNum}</Text>
        <Text style={[styles.optionRate, textStyle]}>{Math.round(rate)}%</Text>
        {showCheck && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={10} color="#FFF" />
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{
      paddingBottom: 200
    }} style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statsLabel}>{t('compare_solution')}</Text>
            <View style={styles.statsValueRow}>
              <Text style={styles.statsValueMain}>{statistics.correctCount}</Text>
              <Text style={styles.statsValueSub}> / {statistics.totalCount} {t('problem_unit')}</Text>
            </View>
          </View>
          <View style={styles.rateBadge}>
            <Text style={styles.rateText}>{statistics.rate}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: palette.main[600] }]} />
          <Text style={styles.legendText}>{t('correct_answer')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { borderColor: '#FF5252', borderWidth: 1 }]} />
          <Text style={styles.legendText}>{t('my_answer_incorrect')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: palette.main[600], alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="checkmark" size={12} color="#FFF" />
          </View>
          <Text style={styles.legendText}>{t('my_answer_correct')}</Text>
        </View>
      </View>

      {effectSize.map((item, index) => (
        <View key={item.id || index} style={styles.questionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.questionTitle}>{t('problem')} {item.questionOrder + 1}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.isCorrect ? '#F3E5F5' : '#FFEBEE' }]}>
                <Text style={[styles.statusText, { color: item.isCorrect ? palette.main[600] : '#D32F2F' }]}>
                  {item.isCorrect ? t('correct') : t('incorrect')}
                </Text>
              </View>
            </View>
            <Text style={styles.correctAnswerLabel}>
              {t('correct_answer')} {item.correctAnswers?.map(ans => {
                const circleNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
                return circleNumbers[ans - 1] || ans
              }).join(', ')}
            </Text>
          </View>

          <View style={styles.optionsRow}>
            {Array.from({ length: item.answersCount || 5 }).map((_, optIndex) => renderOptionBlock(item, optIndex))}
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
  },
  subjectHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    color: '#DDD',
    marginHorizontal: 4,
  },
  statsCard: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsValueMain: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.main[600],
  },
  statsValueSub: {
    fontSize: 14,
    color: '#666',
  },
  rateBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rateText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.main[600],
  },
  legendContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  questionCard: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  correctAnswerLabel: {
    fontSize: 12,
    color: '#999',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionBlock: {
    width: '18%',
    aspectRatio: 1,
    marginHorizontal: '1%',
    marginVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  optionNum: {
    fontSize: 14,
    marginBottom: 2,
  },
  optionRate: {
    fontSize: 12,
    fontWeight: '600',
  },
  defaultBlock: {
    backgroundColor: '#F5F5F5',
  },
  defaultText: {
    color: '#9E9E9E',
  },
  correctBlock: {
    backgroundColor: palette.main[600],
  },
  incorrectBlock: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#FF5252',
  },
  whiteText: {
    color: '#FFF',
  },
  errorText: {
    color: '#FF5252',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 6,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default CompareSolution
