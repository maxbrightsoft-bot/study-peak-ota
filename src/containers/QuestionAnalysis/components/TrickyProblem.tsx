import React, { FC } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Menu } from 'react-native-paper'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import TargetIcon from '@/assets/icons/target.svg'
import { CategoryResponse, ExamResult, QuestionGroupResponse } from '@/utils/types'

interface Question {
  id: number
  isStar: boolean
  isCorrect: boolean
  questionOrder: number
  questionGroupId?: number
  superId?: number
  category?: { name: string }
  categories?: Array<{ name: string }>
  questionTypeCategories?: Array<{
    category?: { name: string }
    subcategory?: { name: string }
  }>
}

interface Props {
  data?: ExamResult
  isPrint: boolean
  categories?: CategoryResponse[]
}

const QuestionItem = ({ question, color, categories, data }: { question: Question; color: string; categories?: CategoryResponse[]; data?: ExamResult }) => {
  const [visible, setVisible] = React.useState(false)

  const openMenu = () => setVisible(true)
  const closeMenu = () => setVisible(false)

  const categoryNames = React.useMemo(() => {
    const names = new Set<string>()

    if (question.category?.name) names.add(question.category.name)
    question.categories?.forEach((c) => {
      if (c.name) names.add(c.name)
    })
    question.questionTypeCategories?.forEach((qtc) => {
      if (qtc.category?.name) names.add(qtc.category.name)
      if (qtc.subcategory?.name) names.add(qtc.subcategory.name)
    })

    if (categories) {
      categories.forEach((cat) => {
        if (
          cat.questionIds?.includes(question.id) ||
          (question.questionGroupId && cat.questionIds?.includes(question.questionGroupId)) ||
          (question.superId && cat.questionIds?.includes(question.superId))
        ) {
          names.add(cat.name)
        }
      })
    }

    if (data?.questionGroups && question.questionGroupId) {
      const group = data.questionGroups.find((g: any) => g.id === question.questionGroupId)
      group?.articles?.forEach((article: any) => {
        if (article.category?.name) names.add(article.category.name)
        if (article.subcategory?.name) names.add(article.subcategory.name)
      })
    }

    return Array.from(names)
  }, [question, categories, data])

  return (
    <View style={styles.questionItemWrapper}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        contentStyle={{ backgroundColor: '#FFF' }}
        anchor={
          <TouchableOpacity
            onPress={openMenu}
            style={styles.questionPressable}
          >
            <Text style={[styles.questionText, { color, fontWeight: '500' }]}>
              {i18next.t('number_question', { number: question.questionOrder + 1 })}
            </Text>
          </TouchableOpacity>
        }
      >
        {categoryNames.length > 0 ? (
          categoryNames.map((name, index) => (
            <Menu.Item key={index} title={`• ${name}`} titleStyle={styles.categoryInfoText} />
          ))
        ) : (
          <Menu.Item title={i18next.t('no_category')} titleStyle={styles.categoryInfoText} />
        )}
      </Menu>
    </View>
  )
}

const TrickyProblem: FC<Props> = ({ data, isPrint, categories }) => {
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
                <QuestionItem key={question.id} question={question} color={palette.error.main} categories={categories} data={data} />
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
                <QuestionItem key={question.id} question={question} color={palette.green_support[900]} categories={categories} data={data} />
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
  },
  questionItemWrapper: {
    padding: 4
  },
  questionPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  categoryInfoText: {
    fontSize: 13,
    color: '#000'
  }
})

export default TrickyProblem
