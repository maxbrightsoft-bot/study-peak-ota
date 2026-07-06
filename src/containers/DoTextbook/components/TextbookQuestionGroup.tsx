import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { palette } from '@/theme'
import { ExamStatus, QuestionAnswerType, SubjectType } from '@/utils/enums'
import { PreparedQuestionGroupResponse, PreparedQuestionResponse } from '../config/types'
import StarRating from '@/assets/iconJSX/starRating'
import React, { useCallback, useMemo } from 'react'
import MathRender from '@/components/MathRender'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: any
  data: PreparedQuestionGroupResponse
  questionRefs: React.MutableRefObject<(View | null)[]>
  isEnd: boolean
  type?: SubjectType
  status?: ExamStatus
  isMock?: boolean
  handleOpenExpiredQuestionDialog: () => void
  onOpenAnswerSheet: (id?: number) => void
  currentQuestionId?: number
  subjectType?: SubjectType
}

const QuestionRow = React.memo(({ 
  item, 
  lastIndex, 
  questionRefs, 
  disabled, 
  isEnd, 
  handleOpenExpiredQuestionDialog, 
  onOpenAnswerSheet, 
  currentQuestionId, 
  t,
  renderAnswer 
}: { 
  item: PreparedQuestionResponse, 
  lastIndex: number, 
  questionRefs: any, 
  disabled: boolean, 
  isEnd: boolean, 
  handleOpenExpiredQuestionDialog: () => void, 
  onOpenAnswerSheet: (id?: number) => void, 
  currentQuestionId?: number,
  t: any,
  renderAnswer: (q: PreparedQuestionResponse) => React.ReactNode
}) => {
  return (
    <TouchableOpacity
      ref={(ref) => (questionRefs.current[item.questionIndex || 0] = ref)}
      onPress={() => (disabled ? isEnd ? handleOpenExpiredQuestionDialog() : undefined : onOpenAnswerSheet(item.id))}
      style={[
        styles.row,
        currentQuestionId === item.id && styles.activeRow,
        { borderBottomWidth: item.questionOrder === lastIndex - 1 ? 0 : 1 }
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
})

const TextbookQuestionGroup = ({
  data,
  isEnd,
  status,
  isMock,
  handleOpenExpiredQuestionDialog,
  onOpenAnswerSheet,
  currentQuestionId,
  questionRefs,
  subjectType
}: Props) => {
  const { t } = useTranslation()
  const questions = data.questions
  const disabled = isEnd || status === ExamStatus.Paused
  const questionContent = useMemo(() => {
    const title = data.articles?.[0].title;
    const author = data.articles?.[0].author;
    const category = data.articles?.[0]?.category?.name;
    const subCategory = data.articles?.[0]?.subcategory?.name;
    const titleAuthor = [title, author].filter((i) => !!i).join(", ");
    const content =
      subjectType !== SubjectType.Math
        ? [subCategory, titleAuthor].filter((i) => !!i).join(", ")
        : category;
    return content;
  }, [
    subjectType,
    data.articles?.[0].title,
    data.articles?.[0].author,
    data.articles?.[0]?.category?.name,
    data.articles?.[0]?.subcategory?.name
  ]);

  const page = t("page_number", {
    number: data.pageFrom ?? data.pageTo ?? "_"
  });

  const renderAnswer = useCallback((question: PreparedQuestionResponse) => {
    switch (question.questionAnswerType) {
      case QuestionAnswerType.ShortAnswer:
      case QuestionAnswerType.OrderMatters:
      case QuestionAnswerType.OrderDoesNotMatters:
      case QuestionAnswerType.SynonymProcessing:
        return (
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <MathRender style={{ backgroundColor: 'transparent' }} isChat content={question.textualAnswers?.[0] || ''} />
            {question.unit && <Text style={styles.textAnswerValue}>({question.unit})</Text>}
          </View>
        )
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
  }, []);

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 8, gap: 4, flexWrap: 'wrap' }}>
        {questionContent && (
          <Text style={{ fontSize: 14, fontWeight: 500, color: palette.grey[500] }}>{questionContent}</Text>
        )}
        {questionContent && <View style={{ backgroundColor: palette.grey[300], paddingVertical: 7, width: 2 }} />}
        <Text style={{ fontSize: 14, fontWeight: 500, color: palette.grey[500] }}>{page}</Text>
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

        {questions.map((item) => (
          <QuestionRow
            key={item.id}
            item={item}
            lastIndex={questions.length}
            questionRefs={questionRefs}
            disabled={disabled}
            isEnd={isEnd}
            handleOpenExpiredQuestionDialog={handleOpenExpiredQuestionDialog}
            onOpenAnswerSheet={onOpenAnswerSheet}
            currentQuestionId={currentQuestionId}
            t={t}
            renderAnswer={renderAnswer}
          />
        ))}
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    borderWidth: '1@ms',
    borderColor: palette.grey[300],
    borderRadius: '8@ms',
    flex: 1,
    overflow: 'hidden'
  },
  header: {
    borderTopLeftRadius: '8@ms',
    borderTopRightRadius: '8@ms',
    flexDirection: 'row',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[300],
    backgroundColor: palette.grey[100]
  },
  headerText: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    color: '#222222',
    paddingVertical: '7@ms'
  },
  row: {
    minHeight: '50@ms',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: '1@ms',
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
    fontSize: '16@ms',
    color: '#333'
  },
  activeQuestionText: {
    color: palette.main[600],
    fontWeight: '600'
  },
  answerCol: {
    paddingHorizontal: '8@ms',
    paddingVertical: '12@ms',
    gap: '4@ms',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  option: {
    width: '30@ms',
    height: '30@ms',
    borderRadius: '999@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedOption: {
    borderRadius: '255@ms',
    backgroundColor: palette.main[600]
  },
  optionText: {
    color: '#333',
    fontWeight: '500'
  },
  selectedText: {
    color: '#fff'
  },
  starWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1
  },
  starButton: {
    position: 'absolute',
    right: '10@ms'
  },
  textAnswerValue: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#333'
  }
})

export default React.memo(TextbookQuestionGroup)
