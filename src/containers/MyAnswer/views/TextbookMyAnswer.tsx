import React, { FC, useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import { EffectSize, StudentQuestionResult, TextbookResult } from '@/utils/types'
import { formatTextbookDataMyAnswer } from '../configs/helpers'
import AnswerItem from '../components/TextbookAnswerItem'
import { FormatTextbookDataMyAnswer } from '../configs/types'
import { red } from '@/theme/colors'

interface Props {
  data: TextbookResult
  effectSize?: EffectSize[]
  isStudent?: boolean
  openContextMenu?: boolean
  onOpenContextMenu?: (data: any) => void
  onCloseContextMenu?: (data: any) => void
  menuContextActions?: any[]
}

const TextbookMyAnswer: FC<Props> = ({
  data,
  effectSize,
  isStudent = true,
  openContextMenu,
  onOpenContextMenu,
  onCloseContextMenu,
  menuContextActions = []
}) => {
  const questionGroupIds = useMemo(
    () => Array.from(new Set(data.studentQuestionResults.map((i) => i.questionGroupId))).sort((a, b) => a - b),
    [data.studentQuestionResults]
  )

  const formattedData = useMemo(() => formatTextbookDataMyAnswer(data, questionGroupIds), [data, questionGroupIds])

  const { t } = useTranslation()

  const renderAnswer = (
    item: StudentQuestionResult,
    index: number,
    questions: StudentQuestionResult[],
    questionGroupId: number
  ) => {
    const nextItem: StudentQuestionResult | undefined = index < questions.length - 1 ? questions[index + 1] : undefined
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
        {formattedData &&
          formattedData.length > 0 &&
          formattedData.map((item: FormatTextbookDataMyAnswer) => (
            <View key={item.questionGroupId} style={styles.categorySection}>
              {renderHeader()}

              <View style={styles.categoryHeader}>
                <View style={styles.categoryColumn}>
                  <Text style={styles.categoryLabel}>{t('_category')}</Text>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.categories?.map((i) => i.name).join(' / ')}
                  </Text>
                </View>
              </View>

              <View style={styles.questionsContainer}>
                {item.questions.map((question, index) =>
                  renderAnswer(question, index, item.questions, item.questionGroupId)
                )}
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
  }
})

export default TextbookMyAnswer
