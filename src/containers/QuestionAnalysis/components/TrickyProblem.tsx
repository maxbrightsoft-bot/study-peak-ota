import { ConfidenceLevel } from '@/utils/enums'
import React, { FC, useMemo } from 'react'
import { View, Text } from 'react-native'
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
  superId?: number
}

interface Props {
  data: Question[]
  isPrint?: boolean
  categories?: CategoryResponse[]
  questionGroups?: any[]
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

const TrickyProblem: FC<Props> = ({ data, isPrint }) => {
  const { t } = useTranslation()

  const { correctCounts, wrongCounts, maxCorrect, maxWrong } = useMemo(() => {
    const questions: Question[] = data || []
    const correct = questions.filter((q) => q.isCorrect)
    const wrong = questions.filter((q) => !q.isCorrect)

    const getConfidence = (q: Question): ConfidenceType | undefined => {
      if (q.confidence) return q.confidence
      return undefined
    }

    const cCounts: Record<ConfidenceLevel, number> = { [ConfidenceLevel.Sure]: 0, [ConfidenceLevel.Unsure]: 0, [ConfidenceLevel.Random]: 0 }
    const wCounts: Record<ConfidenceLevel, number> = { [ConfidenceLevel.Sure]: 0, [ConfidenceLevel.Unsure]: 0, [ConfidenceLevel.Random]: 0 }

    correct.forEach((q) => {
      const conf = getConfidence(q)
      if (conf && cCounts[conf] !== undefined) {
        cCounts[conf] = (cCounts[conf] || 0) + 1
      }
    })
    wrong.forEach((q) => {
      const conf = getConfidence(q)
      if (conf && wCounts[conf] !== undefined) {
        wCounts[conf] = (wCounts[conf] || 0) + 1
      }
    })

    const maxC = Math.max(cCounts[ConfidenceLevel.Sure], cCounts[ConfidenceLevel.Unsure], cCounts[ConfidenceLevel.Random])
    const maxW = Math.max(wCounts[ConfidenceLevel.Sure], wCounts[ConfidenceLevel.Unsure], wCounts[ConfidenceLevel.Random])

    return {
      correctCounts: cCounts,
      wrongCounts: wCounts,
      maxCorrect: maxC,
      maxWrong: maxW
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

    return (
      <View
        key={col}
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
      </View>
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
  cell: {
    flex: 1,
    marginHorizontal: '3@ms',
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
  }
})

export default TrickyProblem
