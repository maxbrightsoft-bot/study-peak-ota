import { Text, TouchableOpacity, View } from 'react-native'
import CustomDropDown from '@/components/DropDown/CustomDropDown'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import StarSwitch from '@/components/Switch/StarSwitch'
import { ScaledSheet } from 'react-native-size-matters'
import { QuestionAnswerType } from '@/utils/enums'
import ExamAnswer from './ExamAnswer'
import { ExamQuestion, Question, QuestionGroupResponse } from '../config/types'

type Props = {
  t: any
  data: QuestionGroupResponse
  expandedId: number | null
  groupIndex: number
  toggleExpand: (id: number | null) => void
  questionRefs: React.MutableRefObject<(View | null)[]>
  questionList: Question[]
  scrollToNextQuestion: (index: number) => void
  updateQuestionStar: (questionId: number, isStar: boolean) => void
  updateQuestionAnswer: ({ questionId, textualAnswers, answer }: ExamQuestion) => void
}
const ExamQuestionGroup = ({
  t,
  data,
  groupIndex,
  expandedId,
  toggleExpand,
  questionRefs,
  questionList,
  scrollToNextQuestion,
  updateQuestionStar,
  updateQuestionAnswer
}: Props) => {
  const questions = questionList.filter((q) => q.questionGroupId === data.id)

  return questions.map((question: Question) => {
    return (
      <View
        key={`question-${question.id}`}
        ref={(ref) => (questionRefs.current[question.questionIndex || 0] = ref)}
        collapsable={false}
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
                        borderWidth: question.textualAnswers ? 0 : 1,
                        paddingHorizontal: 5,
                        paddingVertical: question.isStar ? 5 : 0,
                        alignItems: question.textualAnswers ? 'flex-start' : 'center',
                        justifyContent: 'center',
                        borderColor: '#FFF',
                        backgroundColor: question.isStar ? '#FFF' : palette.main[500]
                      }}
                    >
                      <Text style={{ fontSize: 13, color: '#FFF' }}>
                        {question.isStar ? (
                          <Ionicons name="star" size={14} color={palette.warning.light} />
                        ) : (
                          question.textualAnswers?.join(', ') || question?.selectedAnswers?.sort().join(', ') || '-'
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <StarSwitch
                    isStar={question.isStar}
                    onSwitch={() => updateQuestionStar(question.id, !question.isStar)}
                  />
                </View>
              )}
            </View>
          }
          expanded={expandedId === question.id}
          onPress={() => toggleExpand(question.id)}
        >
          <ExamAnswer
            t={t}
            question={question}
            updateQuestionAnswer={({ questionId, answer, textualAnswers }) => {
              updateQuestionAnswer({ questionId, answer, textualAnswers })
              question.questionAnswerType !== QuestionAnswerType.MultipleChoice && scrollToNextQuestion(question.questionIndex || 0);
              (question.questionIndex || 0) === questionList.length - 1 && toggleExpand(null)
            }}
            updateQuestionStar={updateQuestionStar}
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

export default ExamQuestionGroup
