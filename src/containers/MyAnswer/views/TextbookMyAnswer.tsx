import React, { FC, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EffectSize, Question, StudentQuestionResult, TextbookResult } from '@/utils/types'
import { SubjectType } from '@/utils/enums'
import { formatTextbookDataMyAnswer } from '../configs/helpers'
import { formatTimeSecond, formatTimeDiffV2 } from '@/utils/helpers'
import AnswerItem from '../components/TextbookAnswerItem'
import { red, primary, palette } from '@/theme/colors'

interface Props {
  data: TextbookResult
  effectSize?: EffectSize[]
  onCreateNote?: (question: Question) => void
  onCreateQuestion?: (question: Question) => void
}

const TextbookMyAnswer: FC<Props> = ({ data, effectSize, onCreateNote, onCreateQuestion }) => {
  const { t } = useTranslation()
  const isMath = data.type === SubjectType.Math

  const questionGroupIds = useMemo(
    () => Array.from(new Set(data.studentQuestionResults.map((i) => i.questionGroupId))).sort((a, b) => a - b),
    [data.studentQuestionResults]
  )

  const formattedData = useMemo(
    () => formatTextbookDataMyAnswer(data, questionGroupIds),
    [data, questionGroupIds]
  )

  const newFormattedData = useMemo(() => {
    return formattedData.map((group) => {
      const groupedData = group.questions.reduce((acc: any, item) => {
        const idx = item?.questionGroupIndex || 0
        if (!acc[idx]) acc[idx] = []
        acc[idx].push(item)
        return acc
      }, {} as Record<number, StudentQuestionResult[]>)

      const overall = Object.values(groupedData).map((questionsInSubGroup: any) => ({
        solvedTime: questionsInSubGroup.some((q: any) => q.duration)
          ? formatTimeSecond(Math.round(questionsInSubGroup.reduce((acc: any, cur: any) => acc + (cur.duration || 0), 0)), t)
          : '-',
        diffTime:
          questionsInSubGroup.some((q: any) => q.duration) && questionsInSubGroup.some((q: any) => q.topDuration)
            ? formatTimeDiffV2(
              questionsInSubGroup.reduce((acc: any, cur: any) => {
                if (cur.duration && cur.topDuration) return acc + Math.round(cur.duration - cur.topDuration)
                return acc
              }, 0),
              t
            )
            : '-'
      }))

      return { ...group, overall }
    })
  }, [formattedData, t])

  const renderAnswer = (
    item: StudentQuestionResult,
    index: number,
    questions: StudentQuestionResult[],
    questionGroupId: number,
    subOverall: any[]
  ) => {
    const nextItem = index < questions.length - 1 ? questions[index + 1] : undefined
    const lastItem = index === 0 ? undefined : questions[index - 1]
    const isLast = index === questions.length - 1
    const isFirst = index === 0

    let indexQuestionGroup = 0
    if (index > 0) {
      for (let i = 0; i < index; i++) {
        if (i === 0 || questions[i - 1]?.questionGroupIndex !== questions[i]?.questionGroupIndex) {
          indexQuestionGroup++
        }
      }
    }

    const isVisible = lastItem?.questionGroupIndex !== item.questionGroupIndex
    const effectSizeItem = effectSize?.find((i) => i.id === item.id)
    const questionGroup =
      item.questionGroupIndex >= (data.questionGroups?.length || 0)
        ? null
        : data.questionGroups?.[item.questionGroupIndex]
    const subcategory = questionGroup?.articles?.[0]?.subcategory

    return (
      <View key={`${item.id}-${index}`}>
        {subOverall?.length > 0 && isVisible && (
          <View style={styles.groupHeader}>
            <View style={styles.groupHeaderColumn1}>
              {subcategory && <Text style={styles.subcategoryText}>{subcategory.name}</Text>}
            </View>
            <View style={styles.groupHeaderColumn2} />
            <View style={styles.groupHeaderColumn3}>
              <Text style={styles.groupHeaderTime}>{subOverall[indexQuestionGroup]?.solvedTime}</Text>
            </View>
            <View style={styles.groupHeaderColumn4}>
              <Text style={styles.groupHeaderTime}>{subOverall[indexQuestionGroup]?.diffTime}</Text>
            </View>
            <View style={styles.groupHeaderColumn5} />
          </View>
        )}

        {isMath && item?.questionTypeCategories && (
          <View style={styles.questionTypeContainer}>
            <View style={styles.questionTypeColumn}>
              <Text style={styles.questionTypeText}>
                {item.questionTypeCategories.map((i) => i?.questionType?.name).join(', ')}
              </Text>
            </View>
            <View style={styles.questionTypeEmptyColumn} />
            <View style={styles.questionTypeEmptyColumn} />
            <View style={styles.questionTypeEmptyColumn} />
            <View style={styles.questionTypeEmptyColumn} />
          </View>
        )}

        <AnswerItem
          data={item}
          questionGroupId={questionGroupId}
          nextData={nextItem}
          isLast={isLast}
          isFirst={isFirst}
          effectSize={effectSizeItem}
          onCreateNote={onCreateNote}
          onCreateQuestion={onCreateQuestion}
        />
      </View>
    )
  }

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.column1}><Text style={styles.headerText}>{t('problem_number')}</Text></View>
      <View style={styles.column2}><Text style={styles.headerText}>{t('answer')}</Text></View>
      <View style={styles.column3}><Text style={styles.headerText}>{t('solve_time')}</Text></View>
      <View style={styles.column4}><Text style={styles.headerText}>{t('comparison_of_top_rankings')}</Text></View>
      <View style={styles.column5}>
        <Text style={styles.headerText}>{t('total_correct_rate')}</Text>
        <Text style={styles.skipRateText}>{`(${t('not_selected')})`}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{t('my_answers')}</Text>
      </View>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 350 }}
      >
        {newFormattedData &&
          newFormattedData.length > 0 &&
          newFormattedData.map((item, index) => (
            <View key={item.questionGroupId} style={styles.categorySection}>
              {index === 0 && renderHeader()}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryColumn}>
                  <Text style={styles.categoryLabel}>{t('_category')}</Text>
                  <Text style={styles.categoryName}>
                    {item.categories?.map((i: any) => i.name).join(' / ')}
                  </Text>
                </View>
              </View>
              <View style={[styles.questionsContainer, index === newFormattedData.length - 1 && { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }]}>
                {item.questions.map((question, qIndex) => renderAnswer(question, qIndex, item.questions, item.questionGroupId, item.overall))}
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  titleContainer: {
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
  },
  categorySection: {},
  headerRow: {
    flexDirection: 'row',
    borderTopRightRadius: 14,
    borderTopLeftRadius: 14,
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
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#97A1AF',
    textAlign: 'center'
  },
  skipRateText: {
    fontSize: 9,
    color: red[900],
    textAlign: 'center'
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
    alignItems: 'center',
    flexWrap: 'wrap'
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  groupHeader: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 12,
    minHeight: 32
  },
  groupHeaderColumn1: {
    flex: 1.2,
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  groupHeaderColumn2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  groupHeaderColumn3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  groupHeaderColumn4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  groupHeaderColumn5: {
    flex: 1.5,
    paddingHorizontal: 4
  },
  subcategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: primary.main
  },
  groupHeaderTime: {
    fontSize: 12,
    fontWeight: '700',
    color: primary.main,
    textAlign: 'center'
  },
  questionTypeContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    minHeight: 28
  },
  questionTypeColumn: {
    flex: 1.2,
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  questionTypeEmptyColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  questionTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E'
  }
})

export default TextbookMyAnswer