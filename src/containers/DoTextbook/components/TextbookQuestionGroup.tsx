import { Text, TouchableOpacity, View } from 'react-native'
import { PreparedQuestionGroupResponse, PreparedQuestionResponse, TextbookQuestion } from '../config/types'
import CustomDropDown from '@/components/DropDown/CustomDropDown'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import StarSwitch from '@/components/Switch/StarSwitch'
import TextbookAnswer from './TextbookAnswer'
import { ScaledSheet } from 'react-native-size-matters'
import { ExamStatus, QuestionAnswerType } from '@/utils/enums'

type Props = {
  t: any
  data: PreparedQuestionGroupResponse
  expandedId: number | null
  groupIndex: number
  isEnd: boolean
  status?: ExamStatus
  isMock?: boolean
  toggleExpand: (id: number | null) => void
  questionRefs: React.MutableRefObject<(View | null)[]>
  questionList: PreparedQuestionResponse[]
  handleQuestionLayout: (index: number) => void
  scrollToNextQuestion: (index: number) => void
  updateQuestionStar: (questionId: number, isStar: boolean) => void
  updateQuestionAnswer: ({ questionId, textualAnswers, answer }: TextbookQuestion) => void
}
const TextbookQuestionGroup = ({
  t,
  data,
  isEnd,
  status,
  isMock,
  expandedId,
  toggleExpand,
  questionRefs,
  questionList,
  handleQuestionLayout,
  scrollToNextQuestion,
  updateQuestionStar,
  updateQuestionAnswer
}: Props) => {
  const questions = questionList.filter((q) => q.questionGroupId === data.id)

  const afterAnswer = (questionAnswerType: QuestionAnswerType, absoluteIndex: number) => {
    switch (questionAnswerType) {
      case QuestionAnswerType.MultipleChoice:
        return
      default:
        return scrollToNextQuestion(absoluteIndex)
    }
  }
  return questions.map((question: PreparedQuestionResponse) => {
    return (
      <View
        key={`question-${question.id}`}
        ref={(ref) => (questionRefs.current[question.questionIndex || 0] = ref)}
        collapsable={false}
        onLayout={() => handleQuestionLayout(question.questionIndex || 0)}
      >
        <CustomDropDown
          styleCard={styles.styleCard}
          styleExpand={styles.styleExpand}
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '500' }}>{t('question')}</Text>
              <Text style={{ fontSize: 16, fontWeight: '700' }}>{question.questionOrder + 1}</Text>
            </View>
          }
          subHeader={
            <View style={{ width: '100%' }}>
              {expandedId !== question.id && !!question.selectedAnswers?.length && (
                <View style={{ width: '100%' }}>
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      borderWidth: 1,
                      borderRadius: 8,
                      marginBottom: 10,
                      paddingVertical: 8,
                      alignItems: 'center',
                      backgroundColor: question.isStar ? palette.warning.light : palette.main[500],
                      borderColor: question.isStar ? palette.warning.light : palette.main[500]
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 255,
                        borderWidth: question.textualAnswer ? 0 : 1,
                        paddingHorizontal: 5,
                        paddingVertical: question.isStar ? 5 : 0,
                        alignItems: question.textualAnswer ? 'flex-start' : 'center',
                        justifyContent: 'center',
                        borderColor: '#FFF',
                        backgroundColor: question.isStar ? '#FFF' : palette.main[500]
                      }}
                    >
                      <Text style={{ fontSize: 13, color: '#FFF' }}>
                        {question.isStar ? (
                          <Ionicons name="star" size={14} color={palette.warning.light} />
                        ) : (
                          question.textualAnswer || question?.selectedAnswers?.sort().join(', ') || '-'
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <StarSwitch
                    isStar={question.isStar}
                    isDisable={isEnd || (!!isMock && status === ExamStatus.Paused)}
                    onSwitch={() => updateQuestionStar(question.id, !question.isStar)}
                  />
                </View>
              )}
            </View>
          }
          expanded={question.id === expandedId}
          onPress={() => toggleExpand(question.id)}
        >
          <TextbookAnswer
            t={t}
            question={question}
            updateQuestionAnswer={async ({ questionId, textualAnswers, answer }) => {
              await updateQuestionAnswer({ questionId, answer, textualAnswers })
              afterAnswer(question.questionAnswerType, question?.questionIndex || 0)
              ;(question.questionIndex || 0) === questionList.length - 1 && toggleExpand(null)
            }}
            isDisable={isEnd || (!!isMock && status === ExamStatus.Paused)}
            updateQuestionStar={isEnd || (isMock && status === ExamStatus.Paused) ? () => {} : updateQuestionStar}
          />
        </CustomDropDown>
      </View>
    )
  })
}

const styles = ScaledSheet.create({
  container: {},
  styleCard: {
    backgroundColor: palette.grey[50],
    marginVertical: 10,
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms'
  },
  styleExpand: {
    marginTop: 10
  },
  currentQuestion: {
    fontWeight: 'bold',
    fontSize: 14
  },
  scrollContainer: {
    paddingBottom: 80
  },
  accordionBox: {
    marginBottom: '16@ms'
  },
  accordionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms'
  },
  answerBox: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center'
  },
  answerText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  bookmarkBox: {
    backgroundColor: '#eee',
    padding: 6,
    borderRadius: 12,
    width: 40,
    alignItems: 'center',
    marginTop: 4
  },
  bookmarkText: {
    color: '#aaa'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  timeText: {
    color: palette.main[700],
    fontWeight: 'bold',
    fontSize: 16,
    width: '100@ms'
  },
  totalTime: {
    color: palette.grey[500],
    fontSize: 14,
    fontWeight: 500
  }
})

export default TextbookQuestionGroup
