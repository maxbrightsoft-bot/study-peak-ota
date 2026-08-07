import React, { FC, useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EffectSize } from '@/utils/types'
import { QuestionAnswerType } from '@/utils/enums'
import { palette } from '@/theme'
import { ms } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'

const C = {
  correctBg:    palette.green_support[900],
  correctLight: '#E6F9EC',
  errorBg:      palette.red[900],
  errorLight:   '#FEE9ED',
  neutralBg:    '#F2F4F7',
  neutralText:  '#5D5D5B',
  border:       '#E4E7EC',
  white:        '#FFFFFF',
  labelText:    '#9A9A98',
  bg:           '#F9FAFB',
  problemText:  '#1A1A1A',
}

const PILL_H   = ms(32)
const ICON_S   = ms(20)

interface Props {
  effectSize: EffectSize[]
  isTextbook?: boolean
}

const ResultBadge: FC<{ isCorrect: boolean }> = ({ isCorrect }) => {
  const { t } = useTranslation()
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isCorrect ? C.correctLight : C.errorLight,
      borderRadius: ms(14),
      paddingHorizontal: ms(10),
      paddingVertical: ms(4),
      gap: ms(4),
    }}>
      <View style={{
        width: ICON_S, height: ICON_S,
        borderRadius: ICON_S / 2,
        backgroundColor: isCorrect ? C.correctBg : C.errorBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: C.white, fontSize: ms(11), fontWeight: '700' }}>
          {isCorrect ? '✓' : '✕'}
        </Text>
      </View>
      <Text style={{
        fontSize: ms(12),
        fontWeight: '600',
        color: isCorrect ? C.correctBg : C.errorBg,
      }}>
        {isCorrect ? t('correct', '정답') : t('incorrect', '오답')}
      </Text>
    </View>
  )
}
type PillVariant = 'correctSelected' | 'correctNotSelected' | 'incorrectSelected' | 'neutral'

const ChoicePill: FC<{
  optionNum: number | string
  rate: number
  variant: PillVariant
  isNoResponse?: boolean
}> = ({ optionNum, rate, variant, isNoResponse }) => {
  const bg =
    variant === 'correctSelected'    ? C.correctBg   :
    variant === 'correctNotSelected' ? C.correctLight :
    variant === 'incorrectSelected'  ? C.errorBg     : C.neutralBg

  const fg =
    variant === 'correctSelected'    ? C.white      :
    variant === 'correctNotSelected' ? C.correctBg  :
    variant === 'incorrectSelected'  ? C.white      : C.neutralText

  const iconBg = C.white
  const iconFg =
    variant === 'correctSelected'    ? C.correctBg :
    variant === 'correctNotSelected' ? C.correctBg :
    variant === 'incorrectSelected'  ? C.errorBg   : '#171719'

  const iconLabel =
    variant === 'correctSelected'   ? '✓' :
    variant === 'incorrectSelected' ? '✕' :
    isNoResponse                    ? '-' : `${optionNum}`

  return (
    <View style={{
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      gap: ms(5),
      paddingVertical: ms(10),
    }}>
      <View style={{
        width: ms(34), height: ms(34),
        borderRadius: ms(17),
        backgroundColor: bg,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: variant === 'correctNotSelected' ? 2 : 0,
        borderColor: variant === 'correctNotSelected' ? C.correctBg : 'transparent',
      }}>
        <View style={{
          width: ms(22), height: ms(22),
          borderRadius: ms(11),
          backgroundColor: iconBg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: iconFg, fontSize: ms(11), fontWeight: '700' }}>
            {iconLabel}
          </Text>
        </View>
      </View>
      <Text style={{ color: C.neutralText, fontSize: ms(11), fontWeight: '600' }}>
        {Math.round(rate)}%
      </Text>
    </View>
  )
}

const TextPill: FC<{
  label: string
  answers: string[]
  unit?: string
  rate: number
  isCorrect: boolean
  isMyAnswer: boolean
}> = ({ label, answers, unit, rate, isCorrect, isMyAnswer }) => {
  const bg = isMyAnswer
    ? (isCorrect ? C.correctBg : C.errorBg)
    : (isCorrect ? C.correctBg : C.correctLight)

  const fg = isMyAnswer ? C.white : (isCorrect ? C.white : C.correctBg)
  const iconFg = isMyAnswer ? (isCorrect ? C.correctBg : C.errorBg) : C.correctBg

  const answersText = answers.length ? answers : ['-']

  return (
    <View style={{ gap: ms(5) }}>
      <Text style={{ fontSize: ms(11), color: C.labelText, fontWeight: '600' }}>
        {label}
      </Text>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bg,
        borderRadius: ms(24),
        minHeight: PILL_H + ms(10),
        paddingHorizontal: ms(8),
        paddingVertical: ms(8),
        gap: ms(8),
      }}>
        <View style={{
          width: ICON_S, height: ICON_S,
          borderRadius: ICON_S / 2,
          backgroundColor: C.white,
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Text style={{ color: iconFg, fontSize: ms(11), fontWeight: '700' }}>
            {isMyAnswer ? (isCorrect ? '✓' : '✕') : '✓'}
          </Text>
        </View>
        {/* Mỗi answer là 1 MathRender riêng, mỗi cái 1 dòng phân cách bằng divider View */}
        <View style={{ flex: 1, flexDirection: 'column', gap: ms(6) }}>
          {answersText.map((a, i) => {
            const dividerColor = isMyAnswer
              ? 'rgba(255, 255, 255, 0.25)'
              : (isCorrect ? 'rgba(255, 255, 255, 0.25)' : 'rgba(43, 186, 132, 0.2)')
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <View style={{ height: 1, backgroundColor: dividerColor, marginVertical: ms(2) }} />
                )}
                <MathRender content={a} fontSize={13} textColor={fg} isChat />
              </React.Fragment>
            )
          })}
          {unit ? (
            <Text style={{ color: fg, fontSize: ms(12), fontWeight: '500', marginTop: ms(2) }}>
              ({unit})
            </Text>
          ) : null}
        </View>
        <Text style={{
          color: fg,
          fontSize: ms(12),
          fontWeight: '700',
          flexShrink: 0,
        }}>
          {Math.round(rate)}%
        </Text>
      </View>
    </View>
  )
}

const CompareSolution: FC<Props> = ({ effectSize: originalEffectSize, isTextbook }) => {
  const { t } = useTranslation()

  const effectSize = useMemo(() => {
    if (!isTextbook) return originalEffectSize
    return originalEffectSize.filter(
      (i) => (i.selectedAnswers?.length || 0) > 0 || (i.textualAnswers?.length || 0) > 0
    )
  }, [originalEffectSize, isTextbook])

  const statistics = useMemo(() => {
    const correctCount = effectSize.filter((i) => i.isCorrect).length
    const total = effectSize.length
    return {
      correctCount,
      total,
      rate: total > 0 ? ((correctCount / total) * 100).toFixed(1) : '0.0',
    }
  }, [effectSize])

  const maxChoiceCount = useMemo(() =>
    Math.max(
      5,
      ...effectSize
        .filter((i) =>
          i.questionAnswerType === QuestionAnswerType.SingleChoice ||
          i.questionAnswerType === QuestionAnswerType.MultipleChoice
        )
        .map((i) => i.answersCount || 0)
    ),
    [effectSize]
  )

  const renderTextType = (type?: QuestionAnswerType) => {
    switch (type) {
      case QuestionAnswerType.ShortAnswer:          return t('shortanswer')
      case QuestionAnswerType.OrderMatters:         return t('order_matters')
      case QuestionAnswerType.OrderDoesNotMatters:  return t('order_does_not_matter')
      case QuestionAnswerType.SynonymProcessing:    return t('synonym_processing')
      default:                                      return ''
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 200, gap: ms(8) }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: C.white,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: ms(12),
        padding: ms(16),
      }}>
        <View style={{ gap: ms(3) }}>
          <Text style={{ fontSize: ms(12), color: C.labelText }}>
            {t('compare_solution')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: ms(3) }}>
            <Text style={{ fontSize: ms(32), fontWeight: '800', color: C.correctBg }}>
              {statistics.correctCount}
            </Text>
            <Text style={{ fontSize: ms(14), color: C.neutralText }}>
              / {statistics.total} {t('problem_unit')}
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: C.correctLight,
          paddingHorizontal: ms(18),
          paddingVertical: ms(10),
          borderRadius: ms(28),
        }}>
          <Text style={{ fontSize: ms(22), fontWeight: '800', color: C.correctBg }}>
            {statistics.rate}%
          </Text>
        </View>
      </View>

      {/* ── Section title ── */}
      <Text style={{
        fontSize: ms(14),
        fontWeight: '700',
        color: C.neutralText,
        paddingHorizontal: ms(2),
        marginTop: ms(4),
      }}>
        {t('compare_detail', '문항별 분석')}
      </Text>

      {effectSize.map((item, idx) => {
        const label = item.parentQuestionId
          ? `${(item.parentQuestionOrder || 0) + 1}.${item.questionOrder + 1}`
          : `${item.questionOrder + 1}`

        const isChoice =
          item.questionAnswerType === QuestionAnswerType.SingleChoice ||
          item.questionAnswerType === QuestionAnswerType.MultipleChoice

        const isCorrect = !!item.isCorrect

        const totalAnswered = item.averageAnswers?.reduce((s, r) => s + r, 0) ?? 0
        const noResponseRate = Math.max(0, 100 - totalAnswered)
        const noAnswerSelected = !item.selectedAnswers || item.selectedAnswers.length === 0

        return (
          <View
            key={item.id || idx}
            style={{
              backgroundColor: C.white,
              borderWidth: 1,
              borderColor: isCorrect ? C.correctBg : C.border,
              borderRadius: ms(12),
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: ms(14),
              paddingVertical: ms(12),
              borderBottomWidth: 1,
              borderBottomColor: C.border,
              backgroundColor: isCorrect ? C.correctLight : C.errorLight,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(8) }}>
                <View style={{
                  width: ms(32), height: ms(32),
                  borderRadius: ms(16),
                  backgroundColor: isCorrect ? C.correctBg : C.errorBg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: C.white, fontSize: ms(13), fontWeight: '700' }}>
                    {label}
                  </Text>
                </View>
                <Text style={{ fontSize: ms(14), fontWeight: '700', color: C.problemText }}>
                  {t('problem')} {label}
                </Text>
                {!isChoice && renderTextType(item.questionAnswerType) ? (
                  <View style={{
                    backgroundColor: C.neutralBg,
                    borderRadius: ms(10),
                    paddingHorizontal: ms(8),
                    paddingVertical: ms(3),
                  }}>
                    <Text style={{ fontSize: ms(11), color: C.neutralText }}>
                      {renderTextType(item.questionAnswerType)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <ResultBadge isCorrect={isCorrect} />
            </View>

            <View style={{ padding: ms(12) }}>
              {isChoice ? (
                <View>
                  <View style={{ flexDirection: 'row', marginBottom: ms(2) }}>
                    {Array.from({ length: maxChoiceCount }, (_, i) => (
                      <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: ms(12), color: C.labelText, fontWeight: '600' }}>
                          {t('number_question', { number: i + 1 })}
                        </Text>
                      </View>
                    ))}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: ms(12), color: C.labelText, fontWeight: '600' }}>
                        {t('no_response')}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row' }}>
                    {Array.from({ length: maxChoiceCount }, (_, optIdx) => {
                      const opt = optIdx + 1
                      const isCorrectAnswer = item.correctAnswers?.includes(opt)
                      const isSelected =
                        item.selectedAnswers?.includes(opt.toString()) ||
                        item.selectedAnswers?.includes(opt)
                      const rate = item.averageAnswers?.[optIdx] ?? 0

                      let variant: PillVariant = 'neutral'
                      if (isCorrectAnswer && isSelected)        variant = 'correctSelected'
                      else if (isCorrectAnswer && !isSelected)  variant = 'correctNotSelected'
                      else if (!isCorrectAnswer && isSelected)  variant = 'incorrectSelected'

                      return (
                        <ChoicePill
                          key={opt}
                          optionNum={opt}
                          rate={rate}
                          variant={variant}
                        />
                      )
                    })}

                    <ChoicePill
                      optionNum="-"
                      rate={noResponseRate}
                      variant={noAnswerSelected ? 'incorrectSelected' : 'neutral'}
                      isNoResponse
                    />
                  </View>
                </View>
              ) : (
                <View style={{ gap: ms(12) }}>
                  {isCorrect ? (
                    <TextPill
                      label={t('my_answer', '내 답안')}
                      answers={item.textualAnswers?.length ? item.textualAnswers : ['-']}
                      unit={item.unit}
                      rate={item.correctRate ?? 0}
                      isCorrect
                      isMyAnswer
                    />
                  ) : (
                    <>
                      <TextPill
                        label={t('my_answer', '내 답안')}
                        answers={item.textualAnswers?.length ? item.textualAnswers : ['-']}
                        unit={item.unit}
                        rate={item.sameAnswerRate ?? 0}
                        isCorrect={false}
                        isMyAnswer
                      />
                      <TextPill
                        label={t('correct_answer', '정답')}
                        answers={item.correctTextualAnswers?.length ? item.correctTextualAnswers : ['-']}
                        unit={item.unit}
                        rate={item.correctRate ?? 0}
                        isCorrect
                        isMyAnswer={false}
                      />
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        )
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

export default CompareSolution
