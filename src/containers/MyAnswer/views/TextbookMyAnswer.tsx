import React, { FC, useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import { EffectSize, StudentQuestionResult, TextbookResult } from '@/utils/types'
import { formatTextbookDataMyAnswer } from '../configs/helpers'
import { formatTimeSecond, formatTimeDiffV2 } from '@/utils/helpers'
import AnswerItem from '../components/TextbookAnswerItem'
import { palette, red, primary } from '@/theme/colors'

interface Props {
  data: TextbookResult
  effectSize?: EffectSize[]
}

const TextbookMyAnswer: FC<Props> = ({ data, effectSize }) => {
  const { t } = useTranslation()

  const questionGroupIds = useMemo(
    () => Array.from(new Set(data.studentQuestionResults.map((i) => i.questionGroupId))).sort((a, b) => a - b),
    [data.studentQuestionResults]
  )

  const formattedData = useMemo(() => formatTextbookDataMyAnswer(data, questionGroupIds), [data, questionGroupIds])

  const newFormattedData = useMemo(() => {
    return formattedData.map((group) => {
      const solvedTime = group.questions.some((q) => q.duration)
        ? formatTimeSecond(Math.round(group.questions.reduce((acc, cur) => acc + (cur.duration || 0), 0)), t)
        : '-'

      const diffTime = group.questions.some((q) => q.duration && q.topDuration)
        ? formatTimeDiffV2(
            group.questions.reduce((acc, cur) => {
              if (cur.duration && cur.topDuration) {
                return acc + Math.round(cur.duration - cur.topDuration)
              }
              return acc
            }, 0),
            t
          )
        : '-'

      return {
        ...group,
        solvedTime,
        diffTime
      }
    })
  }, [formattedData, t])

  const renderAnswer = (
    item: StudentQuestionResult,
    index: number,
    questions: StudentQuestionResult[],
    questionGroupId: number
  ) => {
    const nextItem = index < questions.length - 1 ? questions[index + 1] : undefined

    const isLast = index === questions.length - 1
    const isFirst = index === 0

    const effectSizeItem = effectSize?.find((i) => i.id === item.id)

    return (
      <AnswerItem
        key={`${item.id}-${index}`}
        data={item}
        questionGroupId={questionGroupId}
        nextData={nextItem}
        isLast={isLast}
        isFirst={isFirst}
        effectSize={effectSizeItem}
      />
    )
  }

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.column1}>
        <Text style={styles.headerText}>{t('problem_number')}</Text>
      </View>
      <View style={styles.column2}>
        <Text style={styles.headerText}>{t('answer')}</Text>
      </View>
      <View style={styles.column3}>
        <Text style={styles.headerText}>{t('solve_time')}</Text>
      </View>
      <View style={styles.column4}>
        <Text style={styles.headerText}>{t('comparison_of_top_rankings')}</Text>
      </View>
      <View style={styles.column5}>
        <Text style={styles.headerText}>{t('total_correct_rate')}</Text>
        <Text style={styles.skipRateText}>{`(${t('not_selected')})`}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView>
        {newFormattedData.map((item) => (
          <View key={item.questionGroupId} style={styles.categorySection}>
            {renderHeader()}

            <View style={styles.groupHeader}>
              <View style={styles.groupColumn1}>
                <Text style={styles.subcategoryText}>{item.categories?.map((i) => i.name).join(' / ')}</Text>
              </View>
              <View style={styles.groupColumn2} />
              <View style={styles.groupColumn3}>
                <Text style={styles.groupHeaderTime}>{item.solvedTime}</Text>
              </View>
              <View style={styles.groupColumn4}>
                <Text style={styles.groupHeaderTime}>{item.diffTime}</Text>
              </View>
              <View style={styles.groupColumn5} />
            </View>

            <View style={styles.questionsContainer}>
              {item.questions.map((q, index) => renderAnswer(q, index, item.questions, item.questionGroupId))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF'
  },
  categorySection: {},
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 60
  },
  column1: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  column2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  column3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  column4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  column5: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  column6: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#97A1AF',
    textAlign: 'center'
  },
  skipRateText: {
    fontSize: 9,
    color: red[900]
  },
  categoryHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  categoryColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryLabel: {
    fontSize: 12,
    color: '#97A1AF',
    marginRight: 4
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#414E62',
    flex: 1
  },
  questionsContainer: {
    backgroundColor: '#FFFFFF'
  },
  groupHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB'
  },
  groupColumn1: {
    flex: 1.2,
    justifyContent: 'center'
  },
  groupColumn2: {
    flex: 1
  },
  groupColumn3: {
    flex: 1,
    alignItems: 'center'
  },
  groupColumn4: {
    flex: 1,
    alignItems: 'center'
  },
  groupColumn5: {
    flex: 1.5
  },
  subcategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: primary.main
  },
  groupHeaderTime: {
    fontSize: 12,
    fontWeight: '700',
    color: primary.main
  },
  titleBox: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    marginBottom: 10
  },
  titleText: {
    color: palette.main[600],
    fontSize: 16,
    fontWeight: '600'
  }
})

export default TextbookMyAnswer
