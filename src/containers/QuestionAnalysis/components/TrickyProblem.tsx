import { ConfidenceLevel } from '@/utils/enums'
import React, { FC, useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import Tooltip from 'react-native-walkthrough-tooltip'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { CategoryResponse } from '@/utils/types'

interface Question {
  id: number
  isStar: boolean
  confidence?: ConfidenceLevel
  isCorrect: boolean
  questionOrder: number
  questionGroupId?: number
  questionGroupIndex?: number
  superId?: number
  parentQuestionId?: number
  parentQuestionOrder?: number
  chapterName?: string
  subChapterName?: string
  pageNumber?: number
  pageFrom?: number
  pageTo?: number
  category?: { name?: string }
  categories?: Array<{ name?: string }>
  questionTypeCategories?: Array<{
    subcategory?: { name?: string }
    category?: { name?: string }
    questionType?: { name?: string }
  }>
}

interface ConfidenceQuestionGroup {
  id?: number
  page?: number | null
  order?: number
  questions?: Array<{ id?: number }>
  articles?: Array<{
    title?: string | null
    category?: { name?: string | null } | null
    subcategory?: { name?: string | null } | null
    questionType?: { name?: string | null } | null
  }>
}

interface Props {
  data: Question[]
  isPrint?: boolean
  categories?: CategoryResponse[]
  questionGroups?: ConfidenceQuestionGroup[]
}

interface GroupMeta {
  order: number
  label: string
}

interface GroupedQuestions {
  key: string
  label: string
  items: { key: string; label: string }[]
}

type ConfidenceType = ConfidenceLevel

interface CellConfig {
  titleKey: string
  subKey: string
  highlightBg: string
  highlightBorder: string
  highlightTextColor: string
}

const CELL_DEFINITIONS: Record<'correct' | 'wrong', Record<ConfidenceLevel, CellConfig>> = {
  correct: {
    [ConfidenceLevel.Sure]: {
      titleKey: 'confidence_cell_correct_sure_title',
      subKey: 'confidence_cell_correct_sure_sub',
      highlightBg: palette.confidence.table.correctSure.bg,
      highlightBorder: palette.confidence.table.correctSure.border,
      highlightTextColor: palette.confidence.table.correctSure.text
    },
    [ConfidenceLevel.Unsure]: {
      titleKey: 'confidence_cell_correct_unsure_title',
      subKey: 'confidence_cell_correct_unsure_sub',
      highlightBg: palette.confidence.table.correctUnsure.bg,
      highlightBorder: palette.confidence.table.correctUnsure.border,
      highlightTextColor: palette.confidence.table.correctUnsure.text
    },
    [ConfidenceLevel.Random]: {
      titleKey: 'confidence_cell_correct_random_title',
      subKey: 'confidence_cell_correct_random_sub',
      highlightBg: palette.confidence.table.correctRandom.bg,
      highlightBorder: palette.confidence.table.correctRandom.border,
      highlightTextColor: palette.confidence.table.correctRandom.text
    }
  },
  wrong: {
    [ConfidenceLevel.Sure]: {
      titleKey: 'confidence_cell_wrong_sure_title',
      subKey: 'confidence_cell_wrong_sure_sub',
      highlightBg: palette.confidence.table.wrongSure.bg,
      highlightBorder: palette.confidence.table.wrongSure.border,
      highlightTextColor: palette.confidence.table.wrongSure.text
    },
    [ConfidenceLevel.Unsure]: {
      titleKey: 'confidence_cell_wrong_unsure_title',
      subKey: 'confidence_cell_wrong_unsure_sub',
      highlightBg: palette.confidence.table.wrongUnsure.bg,
      highlightBorder: palette.confidence.table.wrongUnsure.border,
      highlightTextColor: palette.confidence.table.wrongUnsure.text
    },
    [ConfidenceLevel.Random]: {
      titleKey: 'confidence_cell_wrong_random_title',
      subKey: 'confidence_cell_wrong_random_sub',
      highlightBg: palette.confidence.table.wrongRandom.bg,
      highlightBorder: palette.confidence.table.wrongRandom.border,
      highlightTextColor: palette.confidence.table.wrongRandom.text
    }
  }
}

const findQuestionGroup = (
  q: Question,
  questionGroups?: ConfidenceQuestionGroup[]
): ConfidenceQuestionGroup | undefined => {
  if (!questionGroups?.length) return undefined
  if (q.questionGroupId !== undefined && q.questionGroupId !== null && q.questionGroupId > 0) {
    const byId = questionGroups.find((g) => g?.id === q.questionGroupId)
    if (byId) return byId
  }
  const byQuestion = questionGroups.find((g) =>
    g?.questions?.some(
      (qq) => qq?.id === q.id || (q.parentQuestionId !== undefined && q.parentQuestionId !== null && qq?.id === q.parentQuestionId)
    )
  )
  if (byQuestion) return byQuestion
  if (q.questionGroupIndex !== undefined && q.questionGroupIndex !== null) {
    return questionGroups[q.questionGroupIndex]
  }
  return undefined
}

const getQuestionGroupKey = (
  q: Question,
  questionGroups?: ConfidenceQuestionGroup[]
): string => {
  if (q.questionGroupId !== undefined && q.questionGroupId !== null && q.questionGroupId > 0) {
    return `id:${q.questionGroupId}`
  }
  const matchedGroup = findQuestionGroup(q, questionGroups)
  if (matchedGroup?.id !== undefined && matchedGroup?.id !== null && matchedGroup.id > 0) {
    return `id:${matchedGroup.id}`
  }
  if (q.questionGroupIndex !== undefined && q.questionGroupIndex !== null) {
    return `idx:${q.questionGroupIndex}`
  }
  return 'default'
}

const formatQuestionNumberLabel = (q: Question, t: (key: string, opts?: any) => string): string => {
  const num =
    q.parentQuestionId && q.parentQuestionOrder !== undefined
      ? `${q.parentQuestionOrder + 1}.${q.questionOrder + 1}`
      : `${q.questionOrder + 1}`
  return t('number_problem', { number: num }) || `No.${num}`
}

const formatPageLabel = (
  q: Question,
  qg: ConfidenceQuestionGroup | undefined,
  t: (key: string, opts?: any) => string
): string => {
  const groupPage = q.pageNumber ?? qg?.page
  let pageStr = ''
  if (groupPage !== undefined && groupPage !== null && groupPage > 0) {
    pageStr = `${groupPage}`
  } else if (q.pageFrom && q.pageTo) {
    pageStr = q.pageFrom === q.pageTo ? `${q.pageFrom}` : `${q.pageFrom}-${q.pageTo}`
  } else if (q.pageFrom || q.pageTo) {
    pageStr = `${q.pageFrom || q.pageTo}`
  }
  if (!pageStr) return ''
  return t('page_number', { number: pageStr }) || `p.${pageStr}`
}

const getQuestionSortKey = (q: Question): [number, number] => {
  if (q.parentQuestionId && q.parentQuestionOrder !== undefined) {
    return [q.parentQuestionOrder, q.questionOrder ?? 0]
  }
  return [q.questionOrder ?? 0, -1]
}

const buildGroupMetaMap = (
  data: Question[],
  questionGroups: ConfidenceQuestionGroup[] | undefined,
  categories: CategoryResponse[] | undefined,
  t: (key: string, opts?: any) => string
): Map<string, GroupMeta> => {
  const rawEntries: { key: string; order: number; baseLabel: string; hasExplicitName: boolean }[] = []
  const seen = new Set<string>()

  for (const q of data || []) {
    const key = getQuestionGroupKey(q, questionGroups)
    if (seen.has(key)) continue
    seen.add(key)

    const order = rawEntries.length + 1
    const qg = findQuestionGroup(q, questionGroups)

    const chapterText = [q.chapterName?.trim(), q.subChapterName?.trim()]
      .filter((v, idx, arr): v is string => Boolean(v) && arr.indexOf(v) === idx)
      .join(' > ')
    const pageLabel = formatPageLabel(q, qg, t)
    const firstArticle = qg?.articles?.[0]
    const articleTitle =
      firstArticle?.subcategory?.name?.trim() ||
      firstArticle?.title?.trim() ||
      firstArticle?.category?.name?.trim() ||
      firstArticle?.questionType?.name?.trim() ||
      ''
    const matchedRespCategory = categories?.find((c) => c?.id !== 0 && c?.name?.trim() && c.questionIds?.includes(q.id))?.name?.trim()
    const categoryName =
      q.category?.name?.trim() ||
      q.categories?.map((c) => c?.name?.trim()).filter(Boolean).join(' / ') ||
      q.questionTypeCategories
        ?.map((c) => c?.subcategory?.name?.trim() || c?.category?.name?.trim() || c?.questionType?.name?.trim())
        .filter(Boolean)
        .join(', ') ||
      matchedRespCategory ||
      ''

    const primaryName = chapterText || articleTitle || categoryName
    const baseLabel = primaryName
      ? [primaryName, pageLabel].filter(Boolean).join(' · ')
      : `${t('group')} ${order}${pageLabel ? ` · ${pageLabel}` : ''}`

    rawEntries.push({
      key,
      order,
      baseLabel,
      hasExplicitName: Boolean(primaryName)
    })
  }

  const labelCounts = new Map<string, number>()
  for (const entry of rawEntries) {
    labelCounts.set(entry.baseLabel, (labelCounts.get(entry.baseLabel) || 0) + 1)
  }

  const metaMap = new Map<string, GroupMeta>()
  for (const entry of rawEntries) {
    const isDuplicateLabel = (labelCounts.get(entry.baseLabel) || 0) > 1
    const label =
      isDuplicateLabel && entry.hasExplicitName
        ? `${entry.baseLabel} (${t('group')} ${entry.order})`
        : entry.baseLabel
    metaMap.set(entry.key, { order: entry.order, label })
  }

  return metaMap
}

const groupCellQuestions = (
  qList: Question[],
  questionGroups: ConfidenceQuestionGroup[] | undefined,
  groupMetaMap: Map<string, GroupMeta>,
  t: (key: string, opts?: any) => string
): GroupedQuestions[] => {
  const bucket = new Map<string, Question[]>()
  for (const q of qList) {
    const key = getQuestionGroupKey(q, questionGroups)
    const list = bucket.get(key)
    if (list) {
      list.push(q)
    } else {
      bucket.set(key, [q])
    }
  }

  return Array.from(bucket.entries())
    .sort(([keyA], [keyB]) => (groupMetaMap.get(keyA)?.order ?? 0) - (groupMetaMap.get(keyB)?.order ?? 0))
    .map(([key, items]) => {
      const sorted = [...items].sort((a, b) => {
        const [mainA, subA] = getQuestionSortKey(a)
        const [mainB, subB] = getQuestionSortKey(b)
        return mainA !== mainB ? mainA - mainB : subA - subB
      })
      return {
        key,
        label: groupMetaMap.get(key)?.label || `${t('group')} 1`,
        items: sorted.map((q, idx) => ({
          key: `${key}-${q.id}-${q.questionOrder}-${idx}`,
          label: formatQuestionNumberLabel(q, t)
        }))
      }
    })
}

const TrickyProblem: FC<Props> = ({ data, isPrint, categories, questionGroups }) => {
  const { t } = useTranslation()
  const [activePopoverKey, setActivePopoverKey] = useState<string | null>(null)

  const groupMetaMap = useMemo(
    () => buildGroupMetaMap(data || [], questionGroups, categories, t),
    [data, questionGroups, categories, t]
  )

  const { correctCounts, wrongCounts, maxCorrect, maxWrong, cQuestions, wQuestions } = useMemo(() => {
    const questions: Question[] = data || []
    const correct = questions.filter((q) => q.isCorrect)
    const wrong = questions.filter((q) => !q.isCorrect)

    const getConfidence = (q: Question): ConfidenceType | undefined => {
      if (q.confidence) return q.confidence
      return undefined
    }

    const cCounts: Record<ConfidenceLevel, number> = { [ConfidenceLevel.Sure]: 0, [ConfidenceLevel.Unsure]: 0, [ConfidenceLevel.Random]: 0 }
    const wCounts: Record<ConfidenceLevel, number> = { [ConfidenceLevel.Sure]: 0, [ConfidenceLevel.Unsure]: 0, [ConfidenceLevel.Random]: 0 }
    const cQ: Record<ConfidenceLevel, Question[]> = { [ConfidenceLevel.Sure]: [], [ConfidenceLevel.Unsure]: [], [ConfidenceLevel.Random]: [] }
    const wQ: Record<ConfidenceLevel, Question[]> = { [ConfidenceLevel.Sure]: [], [ConfidenceLevel.Unsure]: [], [ConfidenceLevel.Random]: [] }

    correct.forEach((q) => {
      const conf = getConfidence(q)
      if (conf && cCounts[conf] !== undefined) {
        cCounts[conf] = (cCounts[conf] || 0) + 1
        cQ[conf].push(q)
      }
    })
    wrong.forEach((q) => {
      const conf = getConfidence(q)
      if (conf && wCounts[conf] !== undefined) {
        wCounts[conf] = (wCounts[conf] || 0) + 1
        wQ[conf].push(q)
      }
    })

    const maxC = Math.max(cCounts[ConfidenceLevel.Sure], cCounts[ConfidenceLevel.Unsure], cCounts[ConfidenceLevel.Random])
    const maxW = Math.max(wCounts[ConfidenceLevel.Sure], wCounts[ConfidenceLevel.Unsure], wCounts[ConfidenceLevel.Random])

    return {
      correctCounts: cCounts,
      wrongCounts: wCounts,
      maxCorrect: maxC,
      maxWrong: maxW,
      cQuestions: cQ,
      wQuestions: wQ
    }
  }, [data])

  const isCellHighlighted = (row: 'correct' | 'wrong', col: ConfidenceType) => {
    if (row === 'correct') {
      return maxCorrect > 0 && correctCounts[col] === maxCorrect
    }
    return maxWrong > 0 && wrongCounts[col] === maxWrong
  }

  const renderCell = (row: 'correct' | 'wrong', col: ConfidenceType) => {
    const def = CELL_DEFINITIONS[row][col]
    const highlighted = isCellHighlighted(row, col)
    const count = row === 'correct' ? correctCounts[col] : wrongCounts[col]
    const qList = row === 'correct' ? cQuestions[col] : wQuestions[col]
    const groupedQuestions = groupCellQuestions(qList, questionGroups, groupMetaMap, t)
    const cellKey = `${row}_${col}`
    const isVisible = activePopoverKey === cellKey

    const popoverContent = (
      <View style={styles.popoverContainer}>
        <View style={styles.popoverHeader}>
          <Text style={styles.popoverTitle} numberOfLines={1}>
            {t(def.titleKey)}
          </Text>
          <View
            style={[
              styles.popoverBadge,
              {
                backgroundColor: def.highlightBg,
                borderColor: def.highlightBorder
              }
            ]}
          >
            <Text
              style={[
                styles.popoverBadgeText,
                { color: def.highlightTextColor }
              ]}
            >
              {t('confidence_total_count', { count }) || `Total: ${count}`}
            </Text>
          </View>
        </View>

        <Text style={styles.popoverSub}>{t(def.subKey)}</Text>

        <View style={styles.popoverDivider} />

        {qList.length > 0 ? (
          <ScrollView
            style={styles.popoverScroll}
            contentContainerStyle={styles.popoverGroupList}
            showsVerticalScrollIndicator={true}
          >
            {groupedQuestions.map((grp, grpIdx) => (
              <View
                key={grp.key}
                style={grpIdx < groupedQuestions.length - 1 ? styles.groupSectionSpacing : undefined}
              >
                <Text style={styles.groupHeaderText} numberOfLines={2}>
                  • {grp.label}
                </Text>
                <View style={styles.popoverQuestionsList}>
                  {grp.items.map((item) => (
                    <View key={item.key} style={styles.questionChip}>
                      <Text style={styles.questionChipText}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyQuestionsText}>
            {t('no_questions_found')}
          </Text>
        )}
      </View>
    )

    return (
      <Tooltip
        key={col}
        isVisible={isVisible}
        content={popoverContent}
        onClose={() => setActivePopoverKey(null)}
        placement="top"
        backgroundColor="rgba(0, 0, 0, 0.3)"
        contentStyle={styles.popoverContentStyle as any}
        arrowSize={{ width: 12, height: 6 }}
        parentWrapperStyle={styles.cellWrapper as any}
        showChildInTooltip={false}
        closeOnContentInteraction={false}
      >
        <TouchableOpacity
          activeOpacity={count > 0 ? 0.7 : 1}
          onPress={() => setActivePopoverKey(isVisible ? null : cellKey)}
          style={[
            styles.cell,
            highlighted
              ? {
                  backgroundColor: def.highlightBg,
                  borderColor: def.highlightBorder,
                  borderWidth: 1.5,
                  shadowColor: def.highlightBorder,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 2,
                  elevation: 2
                }
              : {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderWidth: 1
                }
          ]}
        >
          <Text
            style={[
              styles.cellTitle,
              highlighted
                ? { color: def.highlightTextColor, fontWeight: '700' }
                : { color: '#1F2937', fontWeight: '700' }
            ]}
            numberOfLines={2}
          >
            {t(def.titleKey)}
          </Text>
          <Text
            style={[
              styles.cellSub,
              highlighted
                ? { color: def.highlightTextColor, opacity: 0.95 }
                : { color: '#6B7280' }
            ]}
            numberOfLines={2}
          >
            {t(def.subKey)}
          </Text>

          {count > 0 && (
            <View
              style={[
                styles.countBadge,
                highlighted
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: def.highlightBorder }
                  : { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  { color: highlighted ? def.highlightTextColor : '#4B5563' }
                ]}
              >
                {count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Tooltip>
    )
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {t('self_correction_analysis')}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Header Row - Matches Web: neutral #F9FAFB background, colored text labels */}
        <View style={styles.headerRow}>
          <View style={styles.rowLabelSpacer} />
          <View style={styles.colHeader}>
            <Text style={[styles.colHeaderText, { color: palette.confidence.sure.text }]}>
              ○ {t('confidence_sure')}
            </Text>
          </View>
          <View style={styles.colHeader}>
            <Text style={[styles.colHeaderText, { color: palette.confidence.unsure.text }]}>
              △ {t('confidence_unsure')}
            </Text>
          </View>
          <View style={styles.colHeader}>
            <Text style={[styles.colHeaderText, { color: palette.confidence.random.text }]}>
              × {t('confidence_random')}
            </Text>
          </View>
        </View>

        {/* Row 1: Correct answers - Matches Web: neutral #F9FAFB label, dark text */}
        <View style={styles.dataRow}>
          <View style={styles.rowLabelBadge}>
            <Text style={styles.rowLabelText}>
              {t('correct_answer')}
            </Text>
          </View>
          {renderCell('correct', ConfidenceLevel.Sure)}
          {renderCell('correct', ConfidenceLevel.Unsure)}
          {renderCell('correct', ConfidenceLevel.Random)}
        </View>

        {/* Row 2: Incorrect answers - Matches Web: neutral #F9FAFB label, dark text */}
        <View style={styles.dataRow}>
          <View style={styles.rowLabelBadge}>
            <Text style={styles.rowLabelText}>
              {t('incorrect_answer')}
            </Text>
          </View>
          {renderCell('wrong', ConfidenceLevel.Sure)}
          {renderCell('wrong', ConfidenceLevel.Unsure)}
          {renderCell('wrong', ConfidenceLevel.Random)}
        </View>
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  wrapper: {
    borderRadius: '10@ms',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  header: {
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center'
  },
  contentContainer: {
    padding: '10@ms',
    backgroundColor: '#FFFFFF'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6@ms'
  },
  rowLabelSpacer: {
    width: '46@ms'
  },
  colHeader: {
    flex: 1,
    marginHorizontal: '3@ms',
    paddingVertical: '8@ms',
    paddingHorizontal: '2@ms',
    borderRadius: '6@ms',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  colHeaderText: {
    fontWeight: '700',
    fontSize: '12@ms',
    textAlign: 'center'
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginVertical: '3@ms'
  },
  rowLabelBadge: {
    width: '46@ms',
    borderRadius: '6@ms',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '4@ms',
    paddingHorizontal: '2@ms'
  },
  rowLabelText: {
    fontWeight: '700',
    fontSize: '11@ms',
    color: '#111827',
    textAlign: 'center'
  },
  cellWrapper: {
    flex: 1,
    marginHorizontal: '3@ms'
  },
  cell: {
    flex: 1,
    width: '100%',
    paddingVertical: '10@ms',
    paddingHorizontal: '4@ms',
    borderRadius: '8@ms',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '74@ms'
  },
  cellTitle: {
    fontSize: '11@ms',
    textAlign: 'center',
    marginBottom: '2@ms'
  },
  cellSub: {
    fontSize: '9.5@ms',
    textAlign: 'center',
    lineHeight: '13@ms'
  },
  countBadge: {
    marginTop: '4@ms',
    paddingHorizontal: '6@ms',
    paddingVertical: '1@ms',
    borderRadius: '8@ms',
    borderWidth: 0.5
  },
  countText: {
    fontSize: '9@ms',
    fontWeight: '700'
  },
  popoverContentStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10@ms',
    padding: '10@ms',
    maxWidth: '280@ms',
    minWidth: '200@ms'
  },
  popoverContainer: {
    width: '100%'
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4@ms'
  },
  popoverTitle: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: '6@ms'
  },
  popoverBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    borderRadius: '10@ms',
    borderWidth: 1
  },
  popoverBadgeText: {
    fontSize: '10@ms',
    fontWeight: '700'
  },
  popoverSub: {
    fontSize: '10@ms',
    color: '#6B7280',
    marginBottom: '6@ms',
    lineHeight: '14@ms'
  },
  popoverDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: '6@ms'
  },
  popoverScroll: {
    maxHeight: '180@ms'
  },
  popoverGroupList: {
    flexDirection: 'column'
  },
  groupSectionSpacing: {
    marginBottom: '6@ms'
  },
  groupHeaderText: {
    fontSize: '10.5@ms',
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: '4@ms',
    lineHeight: '14@ms'
  },
  popoverQuestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  questionChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: '8@ms',
    paddingVertical: '3@ms',
    borderRadius: '6@ms',
    marginRight: '5@ms',
    marginBottom: '5@ms'
  },
  questionChipText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: '#374151'
  },
  emptyQuestionsText: {
    fontSize: '11@ms',
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: '4@ms'
  }
})

export default TrickyProblem
