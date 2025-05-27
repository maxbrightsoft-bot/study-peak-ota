import React, { FC } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { ProblemKey } from '@/utils/enums'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import TargetIcon from '@/assets/icons/target.svg'
import { TextbookResult } from '@/utils/types'

interface ExamResult {
  questions: Question[]
}

interface Question {
  id: number
  isStar: boolean
  isCorrect: boolean
  questionOrder: number
}

interface Props {
  data?: TextbookResult
  keyOpen: ProblemKey
  openProblem?: ProblemKey
  changeOpen?: (key?: ProblemKey) => void
  isPrint: boolean
}

const TrickyProblem: FC<Props> = ({ keyOpen, data, openProblem, changeOpen, isPrint }) => {
  const { t } = useTranslation()
  const isOpen = openProblem === keyOpen || isPrint
  const inCorrectQuestions = data?.studentQuestionResults.filter((i) => i.isStar && !i.isCorrect)
  const correctQuestions = data?.studentQuestionResults.filter((i) => i.isStar && i.isCorrect)

  const renderProblems = () => {
    return (
      <>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="close" size={20} color={palette.grey[700]} />
            <Text style={styles.sectionTitle}>{t('incorrect_problem_among_the_starred_problems')}</Text>
          </View>

          <View style={styles.questionsContainer}>
            {inCorrectQuestions?.length ? (
              inCorrectQuestions.map((question: Question) => (
                <Text key={question.id} style={[styles.questionText, { color: palette.error.main }]}>
                  {t('number_question', { number: question.questionOrder + 1 })}
                </Text>
              ))
            ) : (
              <Text style={styles.noDataText}>{t('no_data')}</Text>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TargetIcon />
            <Text style={styles.sectionTitle}>{t('correct_problem_among_the_starred_problems')}</Text>
          </View>

          <View style={styles.questionsContainer}>
            {correctQuestions?.length ? (
              correctQuestions.map((question: Question) => (
                <Text key={question.id} style={[styles.questionText, { color: palette.green_support[900] }]}>
                  {t('number_question', { number: question.questionOrder + 1 })}
                </Text>
              ))
            ) : (
              <Text style={styles.noDataText}>{t('no_data')}</Text>
            )}
          </View>
        </View>
      </>
    )
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.header, !isOpen && styles.closedHeader]}
        onPress={() => changeOpen?.(isOpen ? undefined : keyOpen)}
      >
        <Text style={[styles.headerText, !isOpen && { color: '#97A1AF' }]}>{t('tricky_problems')}</Text>
        {isOpen ? (
          <Ionicons name="chevron-up" size={24} color="#E0E0E0" />
        ) : (
          <Ionicons name="chevron-down" size={24} color="#E0E0E0" />
        )}
      </TouchableOpacity>

      {isOpen && <ScrollView style={styles.content}>{renderProblems()}</ScrollView>}
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
    color: palette.grey[500]
  },
  content: {
    maxHeight: 300
  },
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.grey[100],
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    color: palette.grey[700]
  },
  questionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: '24@ms',
    backgroundColor: '#FFF'
  },
  questionText: {
    fontSize: 12,
    fontWeight: 500,
    padding: 8
  },
  noDataText: {
    fontSize: 13,
    width: "100%",
    color: '#9E9E9E',
    textAlign: "center",
    paddingVertical: '12@ms',
  }
})

export default TrickyProblem
