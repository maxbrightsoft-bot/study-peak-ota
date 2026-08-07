import React, { FC, useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import { CategoryResponse, EffectSize, ExamResult, Question } from '@/utils/types'
import { SubjectType } from '@/utils/enums'
import { formatDataMyAnswer } from '../configs/helpers'
import { formatTimeDiffV2, formatTimeSecond } from '@/utils/helpers'
import AnswerItem from '../components/AnswerItem'
import { palette, primary, red } from '@/theme/colors'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  data: ExamResult
  categories: CategoryResponse[]
  effectSize?: EffectSize[]
  onCreateNote?: (question: Question) => void
  onCreateQuestion?: (question: Question) => void
}

const MyAnswer: FC<Props> = ({ data, categories, effectSize, onCreateNote, onCreateQuestion }) => {
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
                <Text style={styles.subcategoryText}>
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
              <Text style={styles.questionTypeText}>
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
          onCreateNote={onCreateNote}
          onCreateQuestion={onCreateQuestion}
        />
      </View>
    )
  }

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.column1}>
        <Text style={styles.headerText}>
          {t('problem_number')}
        </Text>
      </View>
      <View style={styles.column2}>
        <Text style={styles.headerText}>
          {t('answer')}
        </Text>
      </View>
      <View style={styles.column3}>
        <Text style={styles.headerText}>
          {t('solve_time')}
        </Text>
      </View>
      <View style={styles.column4}>
        <Text style={styles.headerText}>
          {t('comparison_of_top_rankings')}
        </Text>
      </View>
      <View style={styles.column5}>
        <Text style={styles.headerText}>{t('total_correct_rate')}</Text>
        <Text style={styles.skipRateText}>{`(${t('not_selected')})`}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View
        style={{
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
          paddingVertical: 8,
          marginBottom: 10
        }}
      >
        <Text style={{ color: palette.main[600], fontSize: 16, fontWeight: 600 }}>{t('my_answers')}</Text>
      </View>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 350
        }}
      >
        {newFormattedData &&
          newFormattedData.length > 0 &&
          newFormattedData.map((item, index) => (
            <View key={item.category.id} style={styles.categorySection}>
              {index == 0 && renderHeader()}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryColumn}>
                  <Text style={styles.categoryLabel}>{t('_category')}</Text>
                  <Text style={styles.categoryName}>
                    {item.category.name}
                  </Text>
                </View>
              </View>
              <View style={[styles.questionsContainer, index == newFormattedData.length - 1 && { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }]}>
                {item.questions.map((question, index) => renderAnswer(question, index, item.questions, item.overall))}
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {},
  categorySection: {},
  headerRow: {
    flexDirection: 'row',
    borderTopRightRadius: '14@ms',
    borderTopLeftRadius: '14@ms',
    backgroundColor: '#F9FAFB',
    paddingVertical: '12@ms',
    paddingHorizontal: '12@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#E5E7EB',
    minHeight: '60@ms'
  },
  column1: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  column2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  column3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  column4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  column5: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  headerText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: '#97A1AF',
    textAlign: 'center'
  },
  skipRateText: {
    fontSize: '9@ms',
    color: red[900]
  },
  categoryHeader: {
    flexDirection: 'row',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#E5E7EB'
  },
  categoryColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  categoryLabel: {
    fontSize: '12@ms',
    color: '#97A1AF',
    marginRight: '4@ms'
  },
  categoryName: {
    fontSize: '12@ms',
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
    paddingVertical: '4@ms',
    paddingHorizontal: '12@ms',
    minHeight: '32@ms'
  },
  groupHeaderColumn1: {
    flex: 1.2,
    justifyContent: 'center',
    paddingHorizontal: '4@ms'
  },
  groupHeaderColumn2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  groupHeaderColumn3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  groupHeaderColumn4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  groupHeaderColumn5: {
    flex: 1.5,
    paddingHorizontal: '4@ms'
  },
  subcategoryText: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: primary.main
  },
  groupHeaderTime: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: primary.main,
    textAlign: 'center'
  },
  questionTypeContainer: {
    flexDirection: 'row',
    paddingVertical: '4@ms',
    paddingHorizontal: '12@ms',
    backgroundColor: '#FEF3C7',
    minHeight: '28@ms'
  },
  questionTypeColumn: {
    flex: 1.2,
    justifyContent: 'center',
    paddingHorizontal: '4@ms'
  },
  questionTypeEmptyColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4@ms'
  },
  questionTypeText: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#92400E'
  }
})

export default MyAnswer
