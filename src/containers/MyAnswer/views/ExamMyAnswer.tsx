import React, { FC } from 'react'
import { View, Text, FlatList, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import { formatDataMyAnswer } from '../configs/helpers'
import { Category, CategoryResponse, ExamResult, Question } from '@/utils/types'
import AnswerItem from '../components/AnswerItem'
import { AnswerItemBaseProps } from '../configs/types'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

interface Props {
  data: ExamResult
  questionIdContextMenu?: number
  categories: CategoryResponse[]
  itemProps?: AnswerItemBaseProps
}

const MyAnswer: FC<Props> = ({ data, categories, itemProps, questionIdContextMenu }) => {
  const formattedData = formatDataMyAnswer(data, categories)
  const { t } = useTranslation()

  const renderAnswer = (item: Question, index: number, questions: Question[]) => {
    const nextItem: Question | undefined = index < questions.length - 1 ? questions[index + 1] : undefined
    const isLast = index === questions.length - 1
    const isFirst = index === 0
    return <AnswerItem key={item.id} {...itemProps} data={item} nextData={nextItem} isLast={isLast} isFirst={isFirst} />
  }

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={[styles.headerCell, { alignItems: 'flex-start' }]}>
        <Text style={styles.headerText}>{t('problem_number')}</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>{t('answer')}</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>{t('solve_time')}</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>{t('comparison_of_top_rankings')}</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>{t('total_correct_rate')}</Text>
      </View>
    </View>
  )

  const renderCategoryHeader = (category: Category) => (
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryLabel}>{t('_category')}</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {formattedData && formattedData.length > 0 && (
        <ScrollView>
          {formattedData.map((item) => (
            <View key={item.category.id}>
              {renderHeader()}
              {renderCategoryHeader(item.category)}
              {item.questions.map((question, index) => renderAnswer(question, index, item.questions))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    marginBottom: 150,
    backgroundColor: '#fff'
  },
  categoryContainer: {
    marginBottom: 16
  },
  categorySection: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '24@ms',
    borderColor: palette.grey[100],
    backgroundColor: palette.grey[50]
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#97A1AF'
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: '24@ms',
    gap: 8,
    backgroundColor: palette.grey[50],
    borderTopWidth: 1,
    borderColor: palette.grey[100]
  },
  categoryLabel: {
    color: '#97A1AF',
    fontSize: 12,
    marginRight: 4
  },
  categoryName: {
    color: '#414E62',
    fontSize: 12,
    fontWeight: '700'
  }
})

export default MyAnswer
