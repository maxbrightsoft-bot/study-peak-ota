import React from 'react'
import { View, Text, ScrollView, Platform, KeyboardAvoidingView } from 'react-native'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import NotFoundExam from '@/components/NotFoundExam'
import useTextbook from './hooks/useTextbook'
import { PreparedQuestionGroupResponse } from './config/types'
import TextbookQuestionGroup from './components/TextbookQuestionGroup'

type Props = {
  textbookId: string
  page?: string
}

const DoTextbook = ({ textbookId, page }: Props) => {
  const {
    t,
    textbook,
    toggleExpand,
    currentIndex,
    questionRefs,
    expandedId,
    questionList,
    activePage,
    handleLayout,
    handleScroll,
    questionGroupList,
    scrollViewRef,
    isNotFoundTextbook,
    updateQuestionAnswer,
    updateQuestionStar,
    formattedTime,
    totalTasks,
    scrollToNextQuestion,
    completedTasks,
    onFinishedTextbook
  } = useTextbook({ textbookId, page })

  if (isNotFoundTextbook) {
    return <NotFoundExam title={t('exam_not_found')} />
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{textbook?.name}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.subtitle}>{t('title')}</Text>
            <Text style={styles.subtitle}>{t('page_number', { number: activePage })}</Text>
          </View>
        </View>
        <Text style={styles.currentQuestion}>{`${t('question')} ${currentIndex + 1}`}</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
        style={{ flex: 1, position: 'relative' }}
      >
        <View style={{ height: '75%' }}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            onScroll={handleScroll}
            ref={scrollViewRef}
            scrollEventThrottle={16}
          >
            {questionGroupList.map((questionGroup: PreparedQuestionGroupResponse, groupIndex: number) => (
              <React.Fragment key={`group-${questionGroup.id}`}>
                <View onLayout={handleLayout(questionGroup.pageFrom || 1)} />
                <TextbookQuestionGroup
                  t={t}
                  data={questionGroup}
                  questionRefs={questionRefs}
                  scrollToNextQuestion={scrollToNextQuestion}
                  updateQuestionStar={updateQuestionStar}
                  updateQuestionAnswer={updateQuestionAnswer}
                  groupIndex={groupIndex}
                  expandedId={expandedId}
                  questionList={questionList}
                  toggleExpand={toggleExpand}
                />
              </React.Fragment>
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {t('time')}: {formattedTime}
            </Text>
          </View>
          <View style={styles.container}>
            <Text style={styles.timeText}>
              {completedTasks}/{totalTasks}
            </Text>
            <Text style={styles.timeText}>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</Text>
          </View>
          <Ionicons onPress={onFinishedTextbook} name="exit" size={18} color={palette.main[700]} />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    alignItems: 'center',
    marginBottom: '28@ms'
  },
  titleContainer: {
    flexDirection: 'row',
    gap: '16@ms',
    alignItems: 'center'
  },
  title: {
    fontSize: 14,
    color: '#000'
  },
  subtitle: {
    fontSize: 12,
    color: '#aaa'
  },
  styleCard: {
    marginVertical: 10,
    padding: 10
  },
  styleExpand: {
    marginTop: 10
  },
  currentQuestion: {
    fontWeight: 'bold',
    fontSize: 14
  },
  scrollContainer: {},
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

export default DoTextbook
