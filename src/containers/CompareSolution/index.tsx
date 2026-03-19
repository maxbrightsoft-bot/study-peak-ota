import React, { FC, useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EffectSize, ExamResult, TextbookResult } from '@/utils/types'
import { QuestionAnswerType } from '@/utils/enums'
import { answerTypeOptions } from '@/utils/constants'
import MathRender from '@/components/MathRender'
import { palette } from '@/theme'

interface Props {
  effectSize: EffectSize[]
  data?: ExamResult | TextbookResult
  isPrint?: boolean
}

export type InfoQuestionAnswer = {
  textualAnswers: string[]
  isCorrectAnswer?: boolean
  isCorrect?: boolean
  title?: string
  correctTextualAnswers?: string[]
  questionAnswerType: QuestionAnswerType
}

const CompareSolution: FC<Props> = ({ effectSize, isPrint = false }) => {
  const [info, setInfo] = useState<InfoQuestionAnswer>()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const { width } = useWindowDimensions()
  const tableWidth = width - 40

  const maxAnswerCount = useMemo(() => {
    return Math.max(
      5,
      effectSize.reduce((acc, cur) => (acc = acc > cur.answersCount ? acc : cur.answersCount), 1)
    )
  }, [effectSize])

  const handleClose = () => {
    setModalVisible(false)
    setInfo(undefined)
    setSelectedItem(null)
  }

  const handleClick = ({
    textualAnswers,
    isCorrect,
    title,
    questionAnswerType
  }: {
    textualAnswers: string[]
    isCorrect?: boolean
    title?: string
    questionAnswerType: number
  }) => {
    setInfo({ textualAnswers, isCorrect, title, questionAnswerType })
    setModalVisible(true)
  }

  const { t } = useTranslation()

  const renderAnswer = (
    column: string,
    type: QuestionAnswerType | undefined,
    answers?: string[],
    textualAnswers?: string[],
    isCorrect?: boolean
  ) => {
    switch (type) {
      case QuestionAnswerType.SingleChoice:
      case QuestionAnswerType.MultipleChoice:
        if (!answers?.length) return ''
        return answers.map((i) => t('number_question', { number: i })).join(', ')
      default: {
        const content = textualAnswers
        if (!content) return ''
        return (
          <TouchableOpacity
            onPress={() => {
              handleClick({
                textualAnswers: content,
                isCorrect,
                title: column,
                questionAnswerType: type ?? 0
              })
            }}
          >
            <View style={styles.answerContainer}>
              {isPrint || content?.length <= 2 ? (
                <View style={styles.row}>
                  {textualAnswers?.map((i: string, index: number) => (
                    <React.Fragment key={index}>
                      <MathRender content={i} style={styles.questionContent} />
                      {index !== textualAnswers.length - 1 && <Text>,</Text>}
                    </React.Fragment>
                  ))}
                </View>
              ) : (
                <View style={styles.row}>
                  <MathRender content={textualAnswers?.[0] ?? ''} style={styles.questionContent} />
                  <Text>,...</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )
      }
    }
  }

  const renderTableBody = (effectSize: EffectSize[]) => {
    return effectSize.map((item: EffectSize, index: number) => {
      switch (item.questionAnswerType) {
        case QuestionAnswerType.SingleChoice:
        case QuestionAnswerType.MultipleChoice:
          return (
            <View key={item.id} style={[styles.row, index < effectSize.length - 1 && styles.rowBorder]}>
              <View style={[styles.cell, styles.cellProblem]}>
                <Text style={styles.cellText}>
                  {t('problem')}{' '}
                  {item.parentQuestionId
                    ? `${(item?.parentQuestionOrder || 0) + 1}.${item.questionOrder + 1}`
                    : item.questionOrder + 1}
                </Text>
              </View>
              {Array.from({ length: maxAnswerCount }, (_, colIndex) => (
                <View
                  key={colIndex}
                  style={[
                    styles.cell,
                    item?.correctAnswers?.includes(colIndex + 1) && styles.correctAnswerCell,
                    {
                      borderRightWidth: item?.correctAnswers?.includes(colIndex + 1) ? 2 : 1,
                      borderRightColor: item?.correctAnswers?.includes(colIndex + 1)
                        ? palette.main[600]
                        : palette.grey[100]
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      !!item?.selectedAnswers?.length &&
                        item?.selectedAnswers.includes(colIndex + 1) &&
                        (item?.isCorrect ? styles.successText : styles.errorText)
                    ]}
                  >
                    {item?.averageAnswers?.[colIndex] ? `${item?.averageAnswers?.[colIndex]?.toFixed(2) || 0}%` : '0%'}
                  </Text>
                </View>
              ))}
            </View>
          )
        default:
          const textColor = item?.textualAnswers?.length
            ? item?.isCorrect
              ? styles.successText
              : styles.errorText
            : styles.disabledText
          return (
            <View key={item.id} style={[styles.row, index < effectSize.length - 1 && styles.rowBorder]}>
              <View style={[styles.cell, styles.cellProblem]}>
                <Text style={styles.cellText}>
                  {t('problem')}{' '}
                  {item.parentQuestionId
                    ? `${(item?.parentQuestionOrder || 0) + 1}.${item.questionOrder + 1}`
                    : item.questionOrder + 1}
                </Text>
              </View>

              <View style={[styles.cell, styles.cellWide]}>
                <View style={styles.row}>
                  <View>
                    {renderAnswer(
                      t('answer'),
                      item.questionAnswerType,
                      item.correctAnswers,
                      item.correctTextualAnswers,
                      true
                    )}
                  </View>
                  <View>
                    <Text>({answerTypeOptions(t).find((i) => i.value === item.questionAnswerType)?.label})</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.cell, styles.cellWide, styles.mySolutionCell]}>
                <View>
                  {renderAnswer(
                    t('my_solution'),
                    item.questionAnswerType,
                    item.selectedAnswers,
                    item.textualAnswers,
                    item.isCorrect
                  )}
                </View>
              </View>

              <View style={[styles.cell, styles.rateCell]}>
                <Text style={[styles.cellText, styles.textRight]}>{item.correctRate?.toFixed(2)}%</Text>
              </View>
            </View>
          )
      }
    })
  }

  const styles = StyleSheet.create({
    container: {},
    row: {
      flexDirection: 'row',
      minHeight: 40,
      backgroundColor: '#FFF'
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: palette.grey[100]
    },
    headerRow: {
      borderBottomWidth: 1,
      borderBottomColor: palette.grey[100],
      backgroundColor: palette.bg[100]
    },
    subHeaderRow: {
      borderBottomWidth: 1,
      borderBottomColor: palette.grey[100]
    },
    cell: {
      width: tableWidth / 6,
      padding: 8,
      justifyContent: 'center'
    },
    cellProblem: {
      width: tableWidth / 6
    },
    cellWide: {
      width: (tableWidth / 6) * 2
    },
    mySolutionCell: {
      borderLeftWidth: 2,
      borderLeftColor: palette.main[600],
      borderRightWidth: 2,
      borderRightColor: palette.main[600]
    },
    rateCell: {
      borderRightWidth: 2,
      borderRightColor: palette.main[600]
    },
    headerCell: {
      backgroundColor: palette.bg[100],
      borderBottomWidth: 1,
      borderBottomColor: palette.grey[100]
    },
    subHeaderCell: {
      backgroundColor: '#fff',
      borderRightWidth: 1,
      borderRightColor: palette.grey[100]
    },
    cellText: {
      fontSize: 12,
      color: '#1a1a1a'
    },
    headerText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: palette.grey[500]
    },
    subHeaderText: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center'
    },
    textCenter: {
      textAlign: 'center'
    },
    textRight: {
      textAlign: 'right'
    },
    successText: {
      color: '#2e7d32'
    },
    errorText: {
      color: '#d32f2f'
    },
    disabledText: {
      color: '#9e9e9e'
    },
    correctAnswerCell: {
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      borderColor: palette.main[600]
    },
    answerContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    questionContent: {
      maxWidth: 64,
      maxHeight: 18
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20
    }
  })

  return (
    <View style={styles.container}>
      <View
        style={{
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
          paddingVertical: 8,
          marginBottom: 10
        }}
      >
        <Text style={{ color: palette.main[600], fontSize: 16, fontWeight: 600 }}>{t('compare_solution')}</Text>
      </View>
      <ScrollView horizontal showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}>
        <View style={{ borderRadius: 14 }}>
          <View style={[styles.row, styles.headerRow]}>
            <View style={[styles.cell, styles.cellProblem]}>
              <Text style={styles.headerText}>{t('problem_number')}</Text>
            </View>
            <View style={[styles.cell, { width: maxAnswerCount * (tableWidth / 6), justifyContent: 'center' }]}>
              <Text style={[styles.headerText, styles.textCenter]}>{t('selection_rate_by_option')}</Text>
            </View>
          </View>

          <View style={[styles.row, styles.subHeaderRow]}>
            <View style={[styles.cell, styles.cellProblem, styles.subHeaderCell]} />
            {Array.from({ length: maxAnswerCount }, (_, index) => (
              <View key={index} style={[styles.cell, styles.subHeaderCell]}>
                <Text style={styles.subHeaderText}>{index + 1}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingBottom: 200
            }}
          >
            <View style={{ borderBottomRightRadius: 14, borderBottomLeftRadius: 14 }}>
              {renderTableBody(effectSize)}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}

export default CompareSolution
