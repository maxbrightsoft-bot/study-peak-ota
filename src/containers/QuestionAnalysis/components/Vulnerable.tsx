import React, { FC, Fragment, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { QuestionAnswerType } from '@/utils/enums'
import { ExamResult, Question } from '@/utils/types'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'
import { Ionicons } from '@expo/vector-icons'

type QuestionItem = Question & { categories?: Array<{ name: string }> }

interface Props {
  data: QuestionItem[]
  isPrint?: boolean
}

const limitQuestions = 5
const correctRateThreshHold = 70

const Vulnerable: FC<Props> = ({ data, isPrint }) => {
  const { t } = useTranslation()

  const incorrectQuestions = useMemo(() => {
    return data
      .filter(
        (i) =>
          (i.selectedAnswers?.length || i.textualAnswers?.length) &&
          i.isCorrect === false &&
          i.isStar === false &&
          i.overallCorrectRate >= correctRateThreshHold
      )
      .sort((q1, q2) =>
        q2.overallCorrectRate === q1.overallCorrectRate
          ? q1.questionOrder - q2.questionOrder
          : q2.overallCorrectRate - q1.overallCorrectRate
      )
      .slice(0, limitQuestions)
  }, [JSON.stringify(data)])

  const renderTextbookAnswer = (
    type: QuestionAnswerType | undefined,
    answers?: number[],
    textualAnswers?: string[],
    isCorrect?: boolean
  ) => {
    switch (type) {
      case QuestionAnswerType.ShortAnswer:
      case QuestionAnswerType.OrderDoesNotMatters:
      case QuestionAnswerType.OrderMatters:
      case QuestionAnswerType.SynonymProcessing:
        return isCorrect ? textualAnswers?.join(' | ') : (textualAnswers?.[0] ?? '')
      case QuestionAnswerType.SingleChoice:
      case QuestionAnswerType.MultipleChoice:
        if (!answers?.length) return ''
        return answers.map((i) => t('number_question', { number: i })).join(',')
      default:
        return textualAnswers?.join(', ')
    }
  }



  const renderTableRow = (item: QuestionItem, index: number, dataLength: number) => (
    <View key={item.id} style={[styles.tableRow, index < dataLength - 1 && styles.tableRowBorder]}>
      <View style={styles.tdColumn1}>
        <Text style={styles.problemText}>{`${t('problem')} ${item.parentQuestionId ? `${item.parentQuestionOrder + 1}.${item.questionOrder + 1}` : item.questionOrder + 1}`}</Text>
      </View>
      <View style={styles.tdColumn2}>
        <Text style={styles.centerText}>
          {item.overallCorrectRate?.toFixed(2) ? `${item.overallCorrectRate.toFixed(2)}%` : ''}
        </Text>
      </View>
      <View style={styles.tdColumn3}>
        {((item.questionAnswerType === QuestionAnswerType.ShortAnswer ||
           item.questionAnswerType === QuestionAnswerType.OrderDoesNotMatters ||
           item.questionAnswerType === QuestionAnswerType.OrderMatters ||
           item.questionAnswerType === QuestionAnswerType.SynonymProcessing)) ? (
             <View style={{ flexDirection: 'column', gap: 5, alignItems: 'center' }}>
               {item.textualAnswers?.map((ans, idx) => (
                 <View key={idx} style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                   <MathRender isChat content={ans} fontSize={13} />
                 </View>
               ))}
               {item.unit && <Text style={styles.wrongAnswerText}>({item.unit})</Text>}
             </View>
        ) : (
          <Text style={styles.wrongAnswerText}>{renderTextbookAnswer(item.questionAnswerType, item.selectedAnswers, item.textualAnswers)}</Text>
        )}
      </View>
      <View style={styles.tdColumn4}>
        {((item.questionAnswerType === QuestionAnswerType.ShortAnswer ||
           item.questionAnswerType === QuestionAnswerType.OrderDoesNotMatters ||
           item.questionAnswerType === QuestionAnswerType.OrderMatters ||
           item.questionAnswerType === QuestionAnswerType.SynonymProcessing)) ? (
             <View style={{ flexDirection: 'column', gap: 5, alignItems: 'center' }}>
               {item.correctTextualAnswers?.map((ans, idx) => (
                 <View key={idx} style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                   <MathRender isChat content={ans} fontSize={13} />
                 </View>
               ))}
               {item.unit && <Text style={styles.normalText}>({item.unit})</Text>}
             </View>
        ) : (
          <Text style={styles.normalText}>{renderTextbookAnswer(item.questionAnswerType, item.correctAnswers, item.correctTextualAnswers, true)}</Text>
        )}
      </View>
      <View style={styles.tdColumn5}>
        <Text style={styles.normalText}>{item.category?.name ? item.category.name : (item.categories ? item.categories.map((i) => i.name).join(', ') : '')}</Text>
      </View>
    </View>
  )

  const renderBody = () => {
    return (
      <Fragment>
        {incorrectQuestions.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableContainer}>
            <View style={styles.table}>
              <View style={[styles.tableHeader, styles.tableRow]}>
                <View style={styles.thColumn1}>
                  <Text style={styles.headerText}>{t('problem_number')}</Text>
                </View>
                <View style={styles.thColumn2}>
                  <Text style={styles.headerText}>{t('total_correct_rate')}</Text>
                </View>
                <View style={styles.thColumn3}>
                  <Text style={styles.headerText}>{t('my_wrong_answer')}</Text>
                </View>
                <View style={styles.thColumn4}>
                  <Text style={styles.headerText}>{t('answer')}</Text>
                </View>
                <View style={styles.thColumn5}>
                  <Text style={styles.headerText}>{t('_category')}</Text>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={true}>
                {incorrectQuestions.map((item, index) => renderTableRow(item, index, incorrectQuestions.length))}
              </ScrollView>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t('no_data')}</Text>
          </View>
        )}
      </Fragment>
    )
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: palette.bg[100],
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderColor: palette.grey[100]
        }}
      >
        <Text style={[styles.headerText]}>{t('issues_vulnerable')}</Text>
        {incorrectQuestions.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 11, color: palette.grey[500] }}>{t('scroll_horizontal')}</Text>
            <Ionicons name="swap-horizontal" size={14} color={palette.grey[500]} />
          </View>
        )}
      </View>
      <ScrollView style={styles.content}>{renderBody()}</ScrollView>
    </View>
  )
}

const styles = ScaledSheet.create({
  wrapper: {
    borderRadius: '14@ms',
    overflow: 'hidden',
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms'
  },
  closedHeader: {
    backgroundColor: '#FAFAFA'
  },
  headerText: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: '#171719',
    textAlign: 'center'
  },
  content: {
    maxHeight: '300@ms'
  },
  titleContainer: {
    padding: '16@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleOpen: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#E4E7EC'
  },
  titleClosed: {
    backgroundColor: '#FFFFFF'
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '24@ms'
  },
  titleText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#414E62'
  },
  titleTextClosed: {
    color: '#97A1AF'
  },
  subtitleText: {
    fontSize: '11@ms',
    fontWeight: '500',
    color: '#97A1AF'
  },
  tableContainer: {
    maxHeight: '400@ms'
  },
  table: {
    minWidth: '460@ms',
    marginBottom: '20@ms'
  },
  tableHeader: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#E4E7EC'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: '12@ms',
    paddingHorizontal: '8@ms'
  },
  tableRowBorder: {
    borderBottomWidth: '1@ms',
    borderBottomColor: '#E4E7EC'
  },
  tdColumn1: {
    width: '72@ms',
    justifyContent: 'center'
  },
  tdColumn2: {
    width: '88@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tdColumn3: {
    width: '120@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tdColumn4: {
    width: '120@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tdColumn5: {
    flex: 1,
    minWidth: '100@ms',
    justifyContent: 'center'
  },
  thColumn1: {
    width: '72@ms',
    justifyContent: 'center'
  },
  thColumn2: {
    width: '88@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thColumn3: {
    width: '120@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thColumn4: {
    width: '120@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thColumn5: {
    flex: 1,
    minWidth: '100@ms',
    justifyContent: 'center'
  },
  problemText: {
    color: '#101828',
    fontSize: '13@ms',
    fontWeight: '600'
  },
  centerText: {
    color: '#101828',
    fontSize: '13@ms',
    fontWeight: '600',
    textAlign: 'center'
  },
  wrongAnswerText: {
    color: '#B42318',
    fontSize: '13@ms',
    fontWeight: '500',
    textAlign: 'center'
  },
  normalText: {
    color: '#667085',
    fontSize: '13@ms',
    textAlign: 'center'
  },
  noDataContainer: {
    paddingVertical: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  noDataText: {
    color: palette.grey[500]
  }
})

export default Vulnerable
