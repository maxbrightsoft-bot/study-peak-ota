import React, { FC, Fragment, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { ProblemKey, QuestionAnswerType } from '@/utils/enums'
import { ExamResult, Question } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'
interface Props {
  keyOpen: ProblemKey
  data: ExamResult
  isPrint: boolean
  openProblem?: ProblemKey
  changeOpen?: (key?: ProblemKey) => void
  isMyStoryStudent?: boolean
}

const limitQuestions = 5
const correctRateThreshHold = 70

const Vulnerable: FC<Props> = ({ data, keyOpen, openProblem, isPrint, changeOpen, isMyStoryStudent }) => {
  const { t } = useTranslation()
  const isOpen = openProblem === keyOpen || isPrint

  const incorrectQuestions = useMemo(() => {
    return data.questions
      .filter(
        (i) =>
          i.selectedAnswers !== '' &&
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
  }, [JSON.stringify(data.questions)])

  const renderTextbookAnswer = (
    type: QuestionAnswerType | undefined,
    answers?: number[],
    textualAnswers?: string[],
    isCorrect?: boolean
  ) => {
    switch (type) {
      case QuestionAnswerType.ShortAnswer:
      case QuestionAnswerType.SynonymProcessing:
        return isCorrect ? textualAnswers?.join(' | ') : textualAnswers?.[0] ?? ''
      case QuestionAnswerType.SingleChoice:
      case QuestionAnswerType.MultipleChoice:
        if (!answers?.length) return ''
        return answers.map((i) => t('number_question', { number: i })).join(',')
      default:
        return textualAnswers?.join(', ')
    }
  }

  const renderAnswer = (type: QuestionAnswerType | undefined, content: string) => {
    if (!content) return ''
    switch (type) {
      case QuestionAnswerType.ShortAnswer:
        return <MathRender content={content} />
      case QuestionAnswerType.SingleChoice:
        return t('number_question', { number: content })
      case QuestionAnswerType.MultipleChoice:
        return content
          ?.split('|')
          ?.map((i) => t('number_question', { number: i }))
          ?.join(',')
      default:
        return content
    }
  }

  const renderTableRow = (item: Question, index: number, dataLength: number) => (
    <View key={item.id} style={[styles.tableRow, index < dataLength - 1 && styles.tableRowBorder]}>
      <View style={styles.tdColumn1}>
        <Text style={styles.problemText}>{`${t('problem')} ${item.questionOrder + 1}`}</Text>
      </View>
      <View style={styles.tdColumnCenter}>
        <Text style={styles.centerText}>
          {item.overallCorrectRate.toFixed(2) ? `${item.overallCorrectRate.toFixed(2)}%` : ''}
        </Text>
      </View>
      <View style={styles.tdColumn3}>
        <Text style={styles.wrongAnswerText}>
          {typeof item.selectedAnswers === 'string'
            ? renderAnswer(item.questionAnswerType, item.selectedAnswers)
            : renderTextbookAnswer(item.questionAnswerType, item.selectedAnswers, item.textualAnswers)}
        </Text>
      </View>
      <View style={styles.tdColumnCenter}>
        <Text style={styles.normalText}>
          {typeof item.correctAnswers === 'string'
            ? renderAnswer(item.questionAnswerType, item.correctAnswers)
            : renderTextbookAnswer(item.questionAnswerType, item.correctAnswers, item.correctTextualAnswers, true)}
        </Text>
      </View>
      <View style={styles.tdColumnCenter}>
        <Text style={styles.normalText}>{item.category.name ? item.category.name : ''}</Text>
      </View>
    </View>
  )

  const renderQuestionItem = (question: Question) => (
    <View key={question.id} style={styles.contentContainer}>
      <View style={styles.contentColumn1}>
        <View style={styles.column1Content}>
          <View style={styles.problemInfo}>
            <Text style={styles.labelText}>{t('problem_number')}</Text>
            <Text style={styles.problemNumber}>{t('number_question', { number: question.questionOrder + 1 })}</Text>
          </View>
          {question.category?.name && <Text style={styles.categoryText}>{question.category.name}</Text>}
        </View>
      </View>
      <View style={styles.contentColumn2}>
        <View style={styles.column2Content}>
          <View style={styles.rateInfo}>
            <Text style={styles.labelText}>{t('total_correct_rate')}</Text>
            <Text style={styles.labelText}>{t('my_wrong_answer')}</Text>
          </View>
          <View style={styles.answerInfo}>
            <Text style={styles.rateValue}>{question.overallCorrectRate.toFixed(2)}%</Text>
            <Text style={styles.answerText}>
              {typeof question.selectedAnswers === 'string'
                ? renderAnswer(question.questionAnswerType, question.selectedAnswers)
                : renderTextbookAnswer(
                    question.questionAnswerType,
                    question.selectedAnswers,
                    question.textualAnswers
                  )}{' '}
              {t('answer')}{' '}
              {typeof question.correctAnswers === 'string'
                ? renderAnswer(question.questionAnswerType, question.correctAnswers)
                : renderTextbookAnswer(
                    question.questionAnswerType,
                    question.correctAnswers,
                    question.correctTextualAnswers,
                    true
                  )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

  const renderBody = () => {
    return (
      <Fragment>
        {incorrectQuestions.length ? (
          <ScrollView style={styles.tableContainer}>
            {isMyStoryStudent && (
              <View style={styles.table}>
                <View style={[styles.tableHeader, styles.tableRow]}>
                  <View style={styles.thColumn1}>
                    <Text style={styles.headerText}>{t('problem_number')}</Text>
                  </View>
                  <View style={styles.thColumnCenter}>
                    <Text style={styles.headerText}>{t('total_correct_rate')}</Text>
                  </View>
                  <View style={styles.thColumnCenter}>
                    <Text style={styles.headerText}>{t('my_wrong_answer')}</Text>
                  </View>
                  <View style={styles.thColumnCenter}>
                    <Text style={styles.headerText}>{t('answer')}</Text>
                  </View>
                  <View style={styles.thColumnCenter}>
                    <Text style={styles.headerText}>{t('_category')}</Text>
                  </View>
                </View>
                {incorrectQuestions.map((item, index) => renderTableRow(item, index, incorrectQuestions.length))}
              </View>
            )}
            {!isMyStoryStudent && <View>{incorrectQuestions.map(renderQuestionItem)}</View>}
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
      <TouchableOpacity
        style={[styles.header, !isOpen ? styles.closedHeader : { borderBottomWidth: 1, borderColor: palette.grey[100]}]}
        onPress={() => changeOpen?.(isOpen ? undefined : keyOpen)}
      >
        <Text style={[styles.headerText, !isOpen && { color: palette.grey[500] }]}>{t('issues_vulnerable')}</Text>
        {isOpen ? (
          <Ionicons name="chevron-up" size={24} color="#E0E0E0" />
        ) : (
          <Ionicons name="chevron-down" size={24} color="#E0E0E0" />
        )}
      </TouchableOpacity>

      {isOpen && <ScrollView style={styles.content}>{renderBody()}</ScrollView>}
    </View>
  )
}

const styles = ScaledSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: palette.grey[100],
    backgroundColor: palette.grey[50]
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
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.grey[700]
  },
  content: {
    maxHeight: 300
  },
  titleContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleOpen: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC'
  },
  titleClosed: {
    backgroundColor: '#FFFFFF'
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#414E62'
  },
  titleTextClosed: {
    color: '#97A1AF'
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#97A1AF'
  },
  tableContainer: {
    maxHeight: 400,
  },
  table: {
    width: '100%',
    marginBottom: 120
  },
  tableHeader: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC'
  },
  tdColumn1: {
    width: '20%'
  },
  tdColumnCenter: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tdColumn3: {
    width: '20%'
  },
  thColumn1: {
    width: '20%',
    alignItems: 'flex-start'
  },
  thColumnCenter: {
    width: '20%',
    alignItems: 'center'
  },
  problemText: {
    color: '#101828',
    fontSize: 13,
    fontWeight: '600'
  },
  centerText: {
    color: '#101828',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  wrongAnswerText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '500'
  },
  normalText: {
    color: '#667085',
    fontSize: 13,
    textAlign: 'center'
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC'
  },
  contentColumn1: {
    width: 160
  },
  contentColumn2: {
    flex: 1,
    justifyContent: 'center'
  },
  column1Content: {
    gap: 8
  },
  problemInfo: {
    flexDirection: 'row',
    gap: 4
  },
  labelText: {
    fontSize: 12,
    color: '#667085'
  },
  problemNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#101828'
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18442A',
    textAlign: 'center'
  },
  column2Content: {
    gap: 8
  },
  rateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  answerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101828'
  },
  answerText: {
    fontSize: 14,
    color: '#667085',
    flexShrink: 1
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
