import React, { FC, useMemo, useCallback, memo } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EffectSize, Question, StudentQuestionResult, TextbookResult } from '@/utils/types'
import { SubjectType } from '@/utils/enums'
import { formatTextbookDataMyAnswer } from '../configs/helpers'
import { formatTimeSecond, formatTimeDiffV2 } from '@/utils/helpers'
import AnswerItem from '../components/TextbookAnswerItem'
import { red, primary } from '@/theme/colors'

interface Props {
  data: TextbookResult
  effectSize?: EffectSize[]
  onCreateNote?: (question: Question) => void
  onCreateQuestion?: (question: Question) => void
}

const TableHeader = memo(({ t }: { t: any }) => (
  <View style={styles.headerRow}>
    <View style={styles.column1}><Text style={styles.headerText}>{t('problem_number')}</Text></View>
    <View style={styles.column2}><Text style={styles.headerText}>{t('answer')}</Text></View>
    <View style={styles.column3}><Text style={styles.headerText}>{t('solve_time')}</Text></View>
    <View style={styles.column4}><Text style={styles.headerText}>{t('comparison_of_top_rankings')}</Text></View>
    <View style={styles.column5}>
      <Text style={styles.headerText}>{t('total_correct_rate')}</Text>
      <Text style={styles.skipRateText}>{`(${t('not_selected')})`}</Text>
    </View>
  </View>
))

const TextbookMyAnswer: FC<Props> = ({ data, effectSize, onCreateNote, onCreateQuestion }) => {
  const { t } = useTranslation()
  const isMath = data.type === SubjectType.Math

  const questionGroupIds = useMemo(
    () => Array.from(new Set(data.studentQuestionResults.map((i) => i.questionGroupId))).sort((a, b) => a - b),
    [data.studentQuestionResults]
  )

  const formattedData = useMemo(
    () => formatTextbookDataMyAnswer(data, questionGroupIds),
    [data, questionGroupIds]
  )

  const newFormattedData = useMemo(() => {
    return formattedData.map((group) => {
      const groupedData = group.questions.reduce((acc: any, item) => {
        const idx = item?.questionGroupIndex || 0
        if (!acc[idx]) acc[idx] = []
        acc[idx].push(item)
        return acc
      }, {} as Record<number, StudentQuestionResult[]>)

      const overall = Object.values(groupedData).map((questionsInSubGroup: any) => ({
        solvedTime: questionsInSubGroup.some((q: any) => q.duration)
          ? formatTimeSecond(Math.round(questionsInSubGroup.reduce((acc: any, cur: any) => acc + (cur.duration || 0), 0)), t)
          : '-',
        diffTime:
          questionsInSubGroup.some((q: any) => q.duration) && questionsInSubGroup.some((q: any) => q.topDuration)
            ? formatTimeDiffV2(
              questionsInSubGroup.reduce((acc: any, cur: any) => {
                if (cur.duration && cur.topDuration) return acc + Math.round(cur.duration - cur.topDuration)
                return acc
              }, 0),
              t
            )
            : '-'
      }))

      return { ...group, overall }
    })
  }, [formattedData])

  const renderAnswer = useCallback((
    item: StudentQuestionResult,
    index: number,
    questions: StudentQuestionResult[],
    questionGroupId: number,
    subOverall: any[]
  ) => {
    const nextItem = index < questions.length - 1 ? questions[index + 1] : undefined
    const lastItem = index === 0 ? undefined : questions[index - 1]
    const isLast = index === questions.length - 1
    const isFirst = index === 0

    let indexQuestionGroup = 0
    if (index > 0) {
      for (let i = 0; i < index; i++) {
        if (i === 0 || questions[i - 1]?.questionGroupIndex !== questions[i]?.questionGroupIndex) {
          indexQuestionGroup++
        }
      }
    }

    const isVisible = lastItem?.questionGroupIndex !== item.questionGroupIndex
    const effectSizeItem = effectSize?.find((i) => i.id === item.id)
    const questionGroup =
      item.questionGroupIndex >= (data.questionGroups?.length || 0)
        ? null
        : data.questionGroups?.[item.questionGroupIndex]
    const subcategory = questionGroup?.articles?.[0]?.subcategory

    return (
      <View key={`${item.id}-${index}`}>
        {subOverall?.length > 0 && isVisible && (
          <View style={styles.groupHeader}>
            <View style={styles.groupColumn1}>
              {subcategory && <Text style={styles.subcategoryText}>{subcategory.name}</Text>}
            </View>
            <View style={styles.groupColumn2} />
            <View style={styles.groupColumn3}>
              <Text style={styles.groupHeaderTime}>{subOverall[indexQuestionGroup]?.solvedTime}</Text>
            </View>
            <View style={styles.groupColumn4}>
              <Text style={styles.groupHeaderTime}>{subOverall[indexQuestionGroup]?.diffTime}</Text>
            </View>
            <View style={styles.groupColumn5} />
          </View>
        )}

        {isMath && item?.questionTypeCategories && (
          <View style={styles.mathTypeContainer}>
            <Text style={styles.mathTypeText}>
              {item.questionTypeCategories.map((i) => i?.questionType?.name).join(', ')}
            </Text>
          </View>
        )}

        <AnswerItem
          data={item}
          questionGroupId={questionGroupId}
          nextData={nextItem}
          isLast={isLast}
          isFirst={isFirst}
          effectSize={effectSizeItem}
          onCreateNote={onCreateNote}
          onCreateQuestion={onCreateQuestion}
        />
      </View>
    )
  }, [data.questionGroups, effectSize, isMath])

  const flatItems = useMemo(() => {
    const result: any[] = []
    newFormattedData.forEach((group) => {
      result.push({ type: 'header', key: `header-${group.questionGroupId}` })
      result.push({ type: 'category', key: `cat-${group.questionGroupId}`, group })
      group.questions.forEach((q, index) => {
        result.push({
          type: 'question',
          key: `q-${q.id}-${index}`,
          item: q,
          index,
          questions: group.questions,
          questionGroupId: group.questionGroupId,
          overall: group.overall,
        })
      })
    })
    return result
  }, [newFormattedData])

  const renderItem = useCallback(({ item: flatItem }: any) => {
    if (flatItem.type === 'header') {
      return <TableHeader t={t} />
    }
    if (flatItem.type === 'category') {
      return (
        <View style={styles.categoryNameRow}>
          <Text style={styles.categoryLabel}>{t('_category')}</Text>
          <Text style={styles.categoryValue}>
            {flatItem.group.categories?.map((i: any) => i.name).join(' / ')}
          </Text>
        </View>
      )
    }
    return renderAnswer(flatItem.item, flatItem.index, flatItem.questions, flatItem.questionGroupId, flatItem.overall)
  }, [t, renderAnswer])

  return (
    <FlatList
      data={flatItems}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 350 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={15}
    />
  )
}

const styles = StyleSheet.create({
  categorySection: { marginBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  column1: { flex: 1.2, alignItems: 'center' },
  column2: { flex: 1, alignItems: 'center' },
  column3: { flex: 1, alignItems: 'center' },
  column4: { flex: 1, alignItems: 'center' },
  column5: { flex: 1.5, alignItems: 'center' },
  headerText: { fontSize: 11, fontWeight: '600', color: '#97A1AF', textAlign: 'center' },
  skipRateText: { fontSize: 9, color: red[900] },

  categoryNameRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center'
  },
  categoryLabel: { fontSize: 12, color: '#97A1AF', marginRight: 8 },
  categoryValue: { fontSize: 12, fontWeight: '700', color: '#414E62' },

  groupHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  groupColumn1: { flex: 1.2, justifyContent: 'center' },
  groupColumn2: { flex: 1 },
  groupColumn3: { flex: 1, alignItems: 'center' },
  groupColumn4: { flex: 1, alignItems: 'center' },
  groupColumn5: { flex: 1.5 },

  subcategoryText: { fontSize: 12, fontWeight: '700', color: primary.main },
  groupHeaderTime: { fontSize: 12, fontWeight: '700', color: primary.main },

  mathTypeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  mathTypeText: { fontSize: 12, fontWeight: '700', color: '#414E62' },
  questionsContainer: { backgroundColor: '#FFFFFF' }
})

export default TextbookMyAnswer