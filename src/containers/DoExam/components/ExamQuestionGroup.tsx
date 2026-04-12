import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { palette } from '@/theme'
import { ExamStatus, QuestionAnswerType, SubjectType } from '@/utils/enums'
import { QuestionGroupResponse, QuestionResponse } from '../config/types'
import React, { useMemo } from 'react'
import StarRating from '@/assets/iconJSX/starRating'
import MathRender from '@/components/MathRender'
import { useTranslation } from 'react-i18next'

type Props = {
  t: any
  data: QuestionGroupResponse
  questionRefs: React.MutableRefObject<(View | null)[]>
  isEnd: boolean
  type?: SubjectType
  status?: ExamStatus
  currentQuestionId?: number
  onOpenAnswerSheet: (id?: number) => void
}
const ExamQuestionGroup = ({
  data,
  isEnd,
  status,
  type,
  questionRefs,
  currentQuestionId,
  onOpenAnswerSheet,
}: Props) => {
  const { t } = useTranslation()
  const questions = data.questions
  const disabled = isEnd || status === ExamStatus.Paused
  const questionContent = useMemo(() => {
    const title = data.articles?.[0].title
    const author = data.articles?.[0].author
    const category = data.articles?.[0]?.category?.name
    const subCategory = data.articles?.[0]?.subcategory?.name
    const titleAuthor = [title, author].filter((i) => !!i).join(', ')
    const content = type !== SubjectType.Math ? [subCategory, titleAuthor].filter((i) => !!i).join('|') : category
    return content
  }, [
    type,
    data.articles?.[0].title,
    data.articles?.[0].author,
    data.articles?.[0]?.category?.name,
    data.articles?.[0]?.subcategory?.name
  ])

  const renderAnswer = (question: QuestionResponse) => {
    switch (question.questionAnswerType) {
      case QuestionAnswerType.ShortAnswer:
      case QuestionAnswerType.OrderMatters:
      case QuestionAnswerType.OrderDoesNotMatters:
      case QuestionAnswerType.SynonymProcessing:
        return <MathRender style={{ backgroundColor: 'transparent' }} content={question.textualAnswers?.[0] || ''} />
      default:
        return Array.from({ length: question.answerCount }).map((_, index) => {
          const isSelected = question.selectedAnswers?.includes(index + 1)
          return (
            <View key={index} style={[styles.option, isSelected && styles.selectedOption]}>
              <Text style={[styles.optionText, isSelected && styles.selectedText]}>{index + 1}</Text>
            </View>
          )
        })
    }
  }

  const renderRow = (item: QuestionResponse, lastQuestionIndex: number) => {
    const answerCount = item.answerCount

    return (
      <TouchableOpacity
        ref={(ref) => (questionRefs.current[item.questionIndex || 0] = ref)}
        onPress={() => (disabled ? undefined : onOpenAnswerSheet(item.id))}
        style={[
          styles.row,
          currentQuestionId === item.id && styles.activeRow,
          { borderBottomWidth: item.questionOrder === lastQuestionIndex - 1 ? 0 : 1 }
        ]}
      >
        {item.isStar && (
          <View style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
            <StarRating />
          </View>
        )}
        <View
          style={[
            styles.questionCol,
            {
              borderRightWidth: currentQuestionId === item.id ? 0 : 1,
              borderColor: palette.grey[200]
            }
          ]}
        >
          <Text style={[styles.questionText, currentQuestionId === item.id && styles.activeQuestionText]}>
            {t('number_question', { number: item.questionOrder + 1 })}
          </Text>
        </View>

        <View style={{ flex: 3 }}>
          <View style={styles.answerCol}>{renderAnswer(item)}</View>
        </View>
      </TouchableOpacity>
    )
  }

  const totalScore = useMemo(() => {
    return questions.reduce((sum, question) => {
      return sum + (question.score || 0)
    }, 0)
  }, [questions])

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 8, gap: 4 }}>
        {questionContent && (
          <Text style={{ fontSize: 14, fontWeight: 500, color: palette.grey[500] }}>{questionContent}</Text>
        )}
        {questionContent && <View style={{ backgroundColor: palette.grey[300], paddingVertical: 7, width: 2 }} />}
        <Text style={{ fontSize: 14, fontWeight: 500, color: palette.grey[500] }}>{totalScore}p</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ borderRightWidth: 1, borderColor: palette.grey[300], flex: 1 }}>
            <Text style={styles.headerText}>{t('problem_number')}</Text>
          </View>
          <View style={{ flex: 3 }}>
            <Text style={styles.headerText}>{t('answer_sheet')}</Text>
          </View>
        </View>

        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderRow(item, questions.length)}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: 8,
    flex: 1
  },
  header: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: palette.grey[300],
    backgroundColor: palette.grey[100]
  },
  headerText: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 7,
    color: '#222222'
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderColor: palette.grey[200]
  },
  activeRow: {
    backgroundColor: palette.main[50]
  },
  questionCol: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center'
  },
  questionText: {
    fontSize: 16,
    color: '#333'
  },
  activeQuestionText: {
    color: palette.main[600],
    fontWeight: '600'
  },
  answerCol: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 4,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  option: {
    width: 30,
    height: 30,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedOption: {
    borderRadius: 255,
    backgroundColor: palette.main[600]
  },
  optionText: {
    color: '#333',
    fontWeight: '500'
  },
  selectedText: {
    color: '#fff'
  }
})
export default React.memo(ExamQuestionGroup)
