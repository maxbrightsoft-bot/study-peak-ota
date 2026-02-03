import React, { FC, useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import { CategoryResponse, EffectSize, ExamResult, Question } from '@/utils/types'
import { SubjectType } from '@/utils/enums'
import { formatDataMyAnswer } from '../configs/helpers'
import { formatTimeDiffV2, formatTimeSecond } from '@/utils/helpers'
import AnswerItem from '../components/AnswerItem'
import { primary, red } from '@/theme/colors'

interface Props {
  data: ExamResult
  categories: CategoryResponse[]
  effectSize?: EffectSize[]
}

const MyAnswer: FC<Props> = ({ data, categories, effectSize }) => {
  const isMath = data.type === SubjectType.Math
  const { t } = useTranslation()

  const formattedData = useMemo(() => formatDataMyAnswer(data, categories), [data, categories])

  const newFormattedData = useMemo(() => {
    return formattedData.map((i) => {
      const groupedData: Record<number, Question[]> = i.questions.reduce((acc: any, item) => {
        if (!acc[item?.questionGroupIndex]) {
          acc[item?.questionGroupIndex] = []
        }
        acc[item.questionGroupIndex].push(item)
        return acc
      }, {})

      const result = Object.values(groupedData).map((x: Question[]) => ({
        solvedTime: x.some((i) => i.duration)
          ? formatTimeSecond(Math.round(x.reduce((acc, cur) => (acc += cur.duration || 0), 0)), t)
          : '-',
        diffTime:
          x.some((i) => i.duration) && x.some((i) => i.topDuration)
            ? formatTimeDiffV2(
                x.reduce(
                  (acc, cur) =>
                    cur.duration && cur.topDuration ? acc + Math.round(cur.duration - (cur?.topDuration || 0)) : acc,
                  0
                ),
                t
              )
            : '-'
      }))

      return {
        ...i,
        overall: result
      }
    })
  }, [formattedData, t])

  const renderAnswer = (
    item: Question,
    index: number,
    questions: Question[],
    subOverall: {
      solvedTime: string
      diffTime: string
    }[]
  ) => {
    const nextItem: Question | undefined = index < questions.length - 1 ? questions[index + 1] : undefined
    const lastItem: Question | undefined = index === 0 ? undefined : questions[index - 1]
    const isLast = index === questions.length - 1
    const isFirst = index === 0
    const effectSizeItem = effectSize?.find((i) => i.id === item.id)

    let indexQuestionGroup = 0
    if (index > 0) {
      for (let i = 0; i < index; i++) {
        if (i === 0 || questions[i - 1]?.questionGroupIndex !== questions[i]?.questionGroupIndex) {
          indexQuestionGroup++
        }
      }
    }

    const isVisible = lastItem?.questionGroupIndex !== item.questionGroupIndex
    const questionGroup =
      item.questionGroupIndex >= (data.questionGroups?.length || 0)
        ? null
        : data.questionGroups?.[item.questionGroupIndex]
    const subcategory = questionGroup?.articles[0]?.subcategory

    return (
      <View key={item.id}>
        {subOverall?.length > 0 && isVisible && (
          <View style={styles.groupHeader}>
            <View style={styles.groupHeaderColumn1}>
              {subcategory && (
                <Text style={styles.subcategoryText} numberOfLines={1}>
                  {subcategory.name}
                </Text>
              )}
            </View>
            <View style={styles.groupHeaderColumn2} />
            <View style={styles.groupHeaderColumn3}>
              <Text style={styles.groupHeaderTime}>{subOverall?.[indexQuestionGroup]?.solvedTime}</Text>
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
              <Text style={styles.questionTypeText} numberOfLines={1}>
                {item?.questionTypeCategories?.map((i) => i?.questionType?.name).join(', ')}
              </Text>
            </View>
            <View style={styles.questionTypeEmptyColumn} />
            <View style={styles.questionTypeEmptyColumn} />
            <View style={styles.questionTypeEmptyColumn} />
            <View style={styles.questionTypeEmptyColumn} />
          </View>
        )}

        <AnswerItem
          index={index}
          data={item}
          nextData={nextItem}
          effectSize={effectSizeItem}
          isLast={isLast}
          isFirst={isFirst}
        />
      </View>
    )
  }

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.column1}>
        <Text style={styles.headerText} numberOfLines={2}>
          {t('problem_number')}
        </Text>
      </View>
      <View style={styles.column2}>
        <Text style={styles.headerText} numberOfLines={2}>
          {t('answer')}
        </Text>
      </View>
      <View style={styles.column3}>
        <Text style={styles.headerText} numberOfLines={2}>
          {t('solve_time')}
        </Text>
      </View>
      <View style={styles.column4}>
        <Text style={styles.headerText} numberOfLines={3}>
          {t('comparison_of_top_rankings')}
        </Text>
      </View>
      <View style={styles.column5}>
        <Text style={styles.headerText} numberOfLines={3}>
          {t('total_correct_rate')}
          <Text style={styles.skipRateText}>{`\n(${t('not_selected')})`}</Text>
        </Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        {newFormattedData &&
          newFormattedData.length > 0 &&
          newFormattedData.map((item) => (
            <View key={item.category.id} style={styles.categorySection}>
              {renderHeader()}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryColumn}>
                  <Text style={styles.categoryLabel}>{t('_category')}</Text>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.category.name}
                  </Text>
                </View>
              </View>
              <View style={styles.questionsContainer}>
                {item.questions.map((question, index) => renderAnswer(question, index, item.questions, item.overall))}
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
  categorySection: {
    marginBottom: 16
  },
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
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    minHeight: 32
  },
  // Cùng flex ratios với header
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

export default MyAnswer
