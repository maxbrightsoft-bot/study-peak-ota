import React, { FC, useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EffectSize, ExamResult, TextbookResult } from '@/utils/types'
import { QuestionAnswerType } from '@/utils/enums'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'

interface Props {
  effectSize: EffectSize[]
  isPrint?: boolean
  isTextbook?: boolean
}

const CompareSolution: FC<Props> = ({ effectSize: originalEffectSize, isTextbook }) => {
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
    const selectedAnswers = item.selectedAnswers
    const isSelected = selectedAnswers?.includes(optionNum.toString()) || selectedAnswers?.includes(optionNum)
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

      {effectSize.map((item, index) => {
        const isChoice = item.questionAnswerType === QuestionAnswerType.SingleChoice || item.questionAnswerType === QuestionAnswerType.MultipleChoice;
        const isCorrect = item.isCorrect;

        return (
          <View key={item.id || index} style={styles.questionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.questionTitle}>
                  {t('problem')} {item.parentQuestionId ? `${(item?.parentQuestionOrder || 0) + 1}.${item.questionOrder + 1}` : item.questionOrder + 1}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: isCorrect ? '#F3E5F5' : '#FFEBEE' }]}>
                  <Text style={[styles.statusText, { color: isCorrect ? palette.main[600] : '#D32F2F' }]}>
                    {isCorrect ? t('correct') : t('incorrect')}
                  </Text>
                </View>
              </View>
              {isChoice && (
                <Text style={styles.correctAnswerLabel}>
                  {t('correct_answer')} {item.correctAnswers?.map(ans => {
                    const circleNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
                    return circleNumbers[ans - 1] || ans
                  }).join(', ')}
                </Text>
              )}
            </View>

            {isChoice ? (
              <View style={styles.optionsRow}>
                {Array.from({ length: item.answersCount || 5 }).map((_, optIndex) => renderOptionBlock(item, optIndex))}
              </View>
            ) : (
              <View style={styles.textAnswerContainer}>
                <View style={styles.textAnswerRow}>
                  <Text style={styles.textAnswerLabel}>{t('answer')}</Text>
                  <View style={{ flexDirection: 'column', gap: 5, alignItems: 'center' }}>
                    {item.correctTextualAnswers?.map((ans, idx) =>
                      <View key={idx} style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <MathRender key={idx} isChat content={ans} fontSize={13} />
                      </View>)}
                    {item.unit && <Text style={styles.textAnswerValue}>({item.unit})</Text>}
                  </View>
                </View>
                <View style={styles.textAnswerRow}>
                  <Text style={styles.textAnswerLabel}>{t('my_solution')}</Text>
                  <View style={{ flexDirection: 'column', gap: 5, alignItems: 'center' }}>
                    {item.textualAnswers?.map((ans, idx) =>
                      <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <MathRender key={idx} isChat content={ans} fontSize={13} />
                      </View>
                    )}
                    {item.unit && <Text style={styles.textAnswerValue}>({item.unit})</Text>}
                  </View>
                </View>
                <View style={styles.textAnswerRow}>
                  <Text style={styles.textAnswerLabel}>{t('correct_rate')}</Text>
                  <Text style={styles.textAnswerValue}>{item.correctRate?.toFixed(2)}%</Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = ScaledSheet.create({
  container: {
  },
  subjectHeader: {
    paddingHorizontal: '20@ms',
    paddingVertical: '12@ms',
    backgroundColor: '#FFF',
    marginBottom: '10@ms',
  },
  subjectText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    color: '#DDD',
    marginHorizontal: '4@ms',
  },
  statsCard: {
    padding: '16@ms',
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    marginBottom: '12@ms',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: '12@ms',
    color: '#999',
    marginBottom: '4@ms',
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsValueMain: {
    fontSize: '24@ms',
    fontWeight: '700',
    color: palette.main[600],
  },
  statsValueSub: {
    fontSize: '14@ms',
    color: '#666',
  },
  rateBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
    borderRadius: '20@ms',
  },
  rateText: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.main[600],
  },
  legendContainer: {
    flexDirection: 'row',
    padding: '12@ms',
    backgroundColor: '#FFF',
    borderRadius: '12@ms',
    marginBottom: '16@ms',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: '16@ms',
    height: '16@ms',
    borderRadius: '4@ms',
    marginRight: '6@ms',
  },
  legendText: {
    fontSize: '11@ms',
    color: '#666',
  },
  questionCard: {
    padding: '16@ms',
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    marginBottom: '12@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: '2@ms',
    elevation: '1@ms',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: '#333',
    marginRight: '8@ms',
  },
  statusBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    borderRadius: '8@ms',
  },
  statusText: {
    fontSize: '11@ms',
    fontWeight: '600',
  },
  correctAnswerLabel: {
    fontSize: '12@ms',
    color: '#999',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: '-4@ms',
  },
  optionBlock: {
    width: '18%',
    aspectRatio: 1,
    marginHorizontal: '1%',
    marginVertical: '4@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  optionNum: {
    fontSize: '14@ms',
    marginBottom: '2@ms',
  },
  optionRate: {
    fontSize: '12@ms',
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
    borderWidth: '1.5@ms',
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
    top: '4@ms',
    right: '4@ms',
    borderRadius: '6@ms',
    width: '14@ms',
    height: '14@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAnswerContainer: {
    backgroundColor: '#F9F9F9',
    padding: '12@ms',
    borderRadius: '8@ms',
    gap: '8@ms',
  },
  textAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textAnswerLabel: {
    fontSize: '13@ms',
    color: '#666',
    width: '100@ms',
    marginRight: 20
  },
  textAnswerValue: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
})

export default CompareSolution
