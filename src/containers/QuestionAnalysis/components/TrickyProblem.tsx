import React, { FC } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import TargetIcon from '@/assets/icons/target.svg'

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
  data?: ExamResult
  isPrint: boolean
}

const TrickyProblem: FC<Props> = ({ data, isPrint }) => {
  const { t } = useTranslation()
  const inCorrectQuestions = data?.questions.filter((i) => i.isStar && !i.isCorrect)
  const correctQuestions = data?.questions.filter((i) => i.isStar && i.isCorrect)

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
      <View style={{ justifyContent: 'center', backgroundColor: palette.bg[100], paddingVertical: 8 }}>
        <Text style={[styles.headerText]}>{t('tricky_problems')}</Text>
      </View>
      <ScrollView style={styles.content}>{renderProblems()}</ScrollView>
    </View>
  )
}

const styles = ScaledSheet.create({
  wrapper: {
    borderRadius: 14,
    overflow: 'hidden'
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
    color: '#171719',
    textAlign: 'center'
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
    backgroundColor: palette.bg[100],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.grey[100],
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms'
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
    width: '100%',
    color: palette.grey[500],
    textAlign: 'center',
    paddingVertical: '12@ms'
  }
})

export default TrickyProblem
