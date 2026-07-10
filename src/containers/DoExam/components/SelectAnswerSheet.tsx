import BottomSheet from '@/components/ModalBase/BottomSheet'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LastIcon from '@/assets/iconJSX/last'
import NextIcon from '@/assets/iconJSX/next'
import { useEffect, useMemo, useState } from 'react'
import Star from '@/assets/iconJSX/star'
import StarOutline from '@/assets/iconJSX/startOutline'
import { ExamQuestion, Question, ScrollType } from '../config/types'
import { palette } from '@/theme'
import ExamAnswer from './ExamAnswer'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  visible: boolean
  onClose: () => void
  questionList: Question[]
  updateQuestionAnswer: ({ questionId, textualAnswers, answer }: ExamQuestion) => void
  updateQuestionStar: (questionId: number, isStar: boolean) => void
  scrollToQuestion: (type: ScrollType) => void
  onFishedExam: () => void
  currentQuestion: Question
  disabled?: boolean
}
const SelectAnswerSheet = ({
  visible,
  onClose,
  questionList,
  currentQuestion,
  updateQuestionAnswer,
  updateQuestionStar,
  scrollToQuestion,
  onFishedExam,
  disabled
}: Props) => {
  const { t } = useTranslation()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setIsReady(false)
    }
  }, [visible])
  const closeChildren = useMemo(
    () => (
      <TouchableOpacity
        onPress={onFishedExam}
        style={{
          paddingHorizontal: 10,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'red', fontWeight: 500, fontSize: 14 }}>{t('end_exam')}</Text>
      </TouchableOpacity>
    ),
    [onFishedExam]
  )

  const titleChildren = useMemo(
    () => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          onPress={() => {
            if (!currentQuestion) return 
            updateQuestionStar(currentQuestion?.id || 0, !(currentQuestion?.isStar || false))
          }}
        >
          {currentQuestion?.isStar ? <Star /> : <StarOutline />}
        </TouchableOpacity>
        <Text
          style={{ fontSize: 16, fontWeight: '600', color: '#222222' }}
        >{t('question_number', {
          number: currentQuestion?.parentQuestionId
            ? `${(currentQuestion.parentQuestionOrder || 0) + 1}-(${currentQuestion.questionOrder + 1})`
            : (currentQuestion?.questionOrder || 0) + 1
        })}</Text>
      </View>
    ),
    [currentQuestion, updateQuestionStar]
  )

  return (
    <BottomSheet isVisible={visible} onClose={onClose} titleChildren={titleChildren} closeChildren={closeChildren}>
      {isReady && (
        <>
          <View style={styles.sheetContent}>
            <Text style={styles.title}>{t('answer_sheet_note')}</Text>

            <ExamAnswer t={t} question={currentQuestion} isLastQuestion={currentQuestion?.id === questionList[questionList.length - 1]?.id} updateQuestionAnswer={updateQuestionAnswer} onClose={onClose} disabled={disabled} />
          </View>

          <View style={styles.navRow}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[0]?.id}
                style={[styles.navButton, currentQuestion?.id === questionList[0]?.id && { borderColor: palette.grey[300] }]}
                onPress={() => scrollToQuestion(ScrollType.FIRST)}
              >
                <View style={{ transform: 'rotate(180deg)' }}>
                  <LastIcon color={currentQuestion?.id === questionList[0]?.id ? palette.grey[300] : '#222222'} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[0]?.id}
                style={[styles.navButton, currentQuestion?.id === questionList[0]?.id && { borderColor: palette.grey[300] }]}
                onPress={() => scrollToQuestion(ScrollType.PREV)}
              >
                <View style={{ transform: 'rotate(180deg)', padding: 4 }}>
                  <NextIcon color={currentQuestion?.id === questionList[0]?.id ? palette.grey[300] : '#222222'} />
                </View>
                <Text style={[styles.actionTitle, currentQuestion?.id === questionList[0]?.id && { color: palette.grey[300] }]}>
                  {t('previous_question')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[questionList.length - 1]?.id}
                style={[
                  styles.navButton,
                  currentQuestion?.id === questionList[questionList.length - 1]?.id && { borderColor: palette.grey[300] }
                ]}
                onPress={() => scrollToQuestion(ScrollType.NEXT)}
              >
                <Text
                  style={[
                    styles.actionTitle,
                    currentQuestion?.id === questionList[questionList.length - 1]?.id && { color: palette.grey[300] }
                  ]}
                >
                  {t('next_question')}
                </Text>
                <View style={{ padding: 4 }}>
                  <NextIcon
                    color={currentQuestion?.id === questionList[questionList.length - 1]?.id ? palette.grey[300] : '#222222'}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[questionList.length - 1]?.id}
                style={[
                  styles.navButton,
                  currentQuestion?.id === questionList[questionList.length - 1]?.id && { borderColor: palette.grey[300] }
                ]}
                onPress={() => scrollToQuestion(ScrollType.LAST)}
              >
                <LastIcon
                  color={currentQuestion?.id === questionList[questionList.length - 1]?.id ? palette.grey[300] : '#222222'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </>)}
    </BottomSheet>
  )
}

export default SelectAnswerSheet

const styles = ScaledSheet.create({
  row: {
    padding: '16@ms',
    borderBottomWidth: '1@ms',
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  activeRow: {
    backgroundColor: '#f3e8ff'
  },
  questionText: {
    fontSize: '16@ms'
  },
  sheetContent: {
    paddingHorizontal: '20@ms',
    paddingVertical: '24@ms',
    gap: '16@ms'
  },
  title: {
    fontSize: '12@ms',
    color: '#858588',
    lineHeight: '20@ms',
    textAlign: 'center'
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '16@ms',
    paddingHorizontal: '15@ms',
    justifyContent: 'space-between'
  },
  answerButton: {
    width: '50@ms',
    height: '50@ms',
    borderRadius: '25@ms',
    borderWidth: '1@ms',
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navRow: {
    paddingVertical: '12@ms',
    paddingHorizontal: '20@ms',
    flexDirection: 'row',
    paddingBottom: '34@ms',
    gap: '8@ms',
    justifyContent: 'space-between'
  },
  actionTitle: {
    fontSize: '14@ms',
    lineHeight: '22@ms',
    color: '#222222',
    fontWeight: 500
  },
  selectedAnswerButton: {
    backgroundColor: palette.main[600],
    color: '#fff'
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    paddingVertical: '7@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '26@ms',
    borderWidth: '1@ms',
    borderColor: '#222222'
  }
})
