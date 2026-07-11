import React, { useMemo, useCallback } from 'react'
import { View, Text, Platform, KeyboardAvoidingView, TouchableOpacity, FlatList } from 'react-native'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import useExam from './hooks/useExam'
import NotFoundExam from '@/components/NotFoundExam'
import Loading from '@/components/Loading'
import HangOnDialog from './components/HangOnDialog'
import LiveResultDialog from './components/LiveResultDialog'
import ExamResult from '../ExamResult/views'
import { ScrollType } from './config/types'
import ExamQuestionGroup from './components/ExamQuestionGroup'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import FloatingActionButton from '@/components/Button/FloatingActionButton'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import { ExamStatus } from '@/utils/enums'
import LastIcon from '@/assets/iconJSX/last'
import NextIcon from '@/assets/iconJSX/next'
import ArrowDown from '@/assets/iconJSX/arrowDown'
import ArrowRight from '@/assets/iconJSX/arrowRight'
import SelectAnswerSheet from './components/SelectAnswerSheet'
import InfoExamCode from './components/InfoExamCode'

type Props = {
  examCode: string
}

const DoExam = ({ examCode }: Props) => {
  const {
    t,
    exam,
    isEnding,
    endExam,
    openLeaveDialog,
    handleOpenLeaveDialog,
    handleCloseLeaveDialog,
    questionListMapped,
    questionList,
    remainTime,
    remainTimeString,
    questionStarList,
    handleNextStar,
    handlePrevStar,
    isNotFoundExam,
    openAnswerSheet,
    examSession,
    openInfoExamDialog,
    handleOpenInfoExamDialog,
    handleCloseInfoExamDialog,
    isAllQuestionsAnswered,
    handleOpenAnswerSheet,
    handleCloseAnswerSheet,
    questionRefs,
    scrollViewRef,
    handleOpenFinishConfirmDialog,
    handleCloseFinishConfirmDialog,
    openConfirmFinishDialog,
    scrollToQuestion,
    currentQuestionId,
    openResultDialog,
    liveResultDialog,
    handleConfirmLeave,
    handleRestartExam,
    updateQuestionAnswer,
    updateQuestionStar,
    isOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handlePauseAndResumeExam,
    handleExamEnd,
    handleDetailExamResult,
    handleCloseLiveResultDialog,
    handleFinishExam,
  } = useExam({ examCode })

  const currentQuestion = useMemo(
    () => questionList.find((q) => q.id === currentQuestionId),
    [questionList, currentQuestionId]
  )

  const groupedQuestions = useMemo(() => {
    return questionListMapped.map((group) => ({
      ...group,
      questions: questionList.filter((q) => q.questionGroupId === group.id)
    }))
  }, [questionListMapped, questionList])

  const disabled = (exam?.isLate
    ? exam?.lateStatus === ExamStatus.Paused || exam.lateStatus === ExamStatus.Completed
    : exam?.status === ExamStatus.Paused || exam?.status === ExamStatus.Completed) || (remainTime !== undefined && remainTime <= 0);

  const renderQuestionGroup = useCallback(({ item }: { item: any }) => (
    <ExamQuestionGroup
      t={t}
      type={exam?.type}
      onOpenAnswerSheet={handleOpenAnswerSheet}
      data={item}
      questionRefs={questionRefs}
      isEnd={exam?.isLate ? exam?.lateStatus === ExamStatus.Completed : exam?.status === ExamStatus.Completed}
      status={exam?.isLate ? exam.lateStatus : exam?.status}
      currentQuestionId={currentQuestionId}
      disabled={disabled}
    />
  ), [
    t,
    exam?.type,
    exam?.isLate,
    exam?.lateStatus,
    exam?.status,
    handleOpenAnswerSheet,
    questionRefs,
    currentQuestionId
  ])

  if (isNotFoundExam) return <NotFoundExam title={t('the_exam_code_you_are_looking_for_was_not_found')} />

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleOpenLeaveDialog}>
            <View style={{ transform: 'rotate(180deg)' }}>
              <ArrowRight width={24} height={24} color={palette.grey[300]} />
            </View>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('live_exam_in_progress')}</Text>
            <Text style={[styles.subtitle, { color: (remainTime || 0) < 10 ? palette.red[900] : palette.grey[400] }]}>
              {remainTimeString || 0}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {(exam?.isLate || (!exam?.isLate && exam?.lateStatus === ExamStatus.Completed)) && (
              <FloatingActionButton
                t={t}
                status={exam?.lateStatus}
                onTogglePauseResume={handlePauseAndResumeExam}
                onOpenConfirmDialog={handleOpenConfirmDialog}
                keys={{
                  pause: 'pause_exam',
                  resume: 'resume_exam',
                  restart: 'restart_exam'
                }}
                ariaLabel="exam-actions"
              />
            )}
          </View>
        </View>

        {questionStarList.length > 0 && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 14,
              zIndex: 1,
              backgroundColor: palette.grey[500]
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#FFF' }}>{t('view_starred_questions')}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={handleNextStar}>
                  <ArrowDown />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePrevStar}>
                  <View style={{ transform: 'rotate(180deg)' }}>
                    <ArrowDown />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <FlatList
          ref={scrollViewRef}
          data={groupedQuestions}
          keyExtractor={(item) => `group-${item.id}`}
          ListHeaderComponent={
            <View
              style={{
                borderWidth: 1,
                borderColor: '#EAEAEA',
                backgroundColor: '#FBFBF9',
                borderRadius: 10,
                marginTop: 20,
                flexDirection: 'row',
                paddingHorizontal: 14,
                paddingVertical: 8,
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#171719', flexShrink: 1 }} numberOfLines={1}>{examSession?.subject}</Text>
                <View style={{ backgroundColor: palette.grey[300], paddingVertical: 7, width: 2 }} />
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#222222', flexShrink: 1 }} numberOfLines={1}>{exam?.title}</Text>
                {(exam?.totalStudentAttemptNumber || 0) >= 1 && (
                  <View
                    style={[
                      styles.attemptBadge,
                      {
                        backgroundColor: exam?.isSelected ? palette.main[100] : palette.red[100]
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.attemptText,
                        {
                          color: exam?.isSelected ? palette.main[700] : palette.red[900]
                        }
                      ]}
                    >
                      {`#${(exam?.totalStudentAttemptNumber || 0) + 1}`}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={handleOpenInfoExamDialog}>
                <Text style={{ color: palette.grey[300] }}>{t('see_more')}</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.scrollContainer}
          renderItem={renderQuestionGroup}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />

        <View style={styles.footer}>
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <TouchableOpacity
              onPress={disabled ? undefined : () => handleOpenAnswerSheet()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.timeLeft}>
                  {t('question_number', {
                    number: currentQuestion?.parentQuestionId
                      ? `${(currentQuestion.parentQuestionOrder || 0) + 1}-(${currentQuestion.questionOrder + 1})`
                      : (currentQuestion?.questionOrder || 0) + 1
                  })}{' '}
                </Text>
                <Text style={styles.totalTime}>{t('return_to_question')}</Text>
              </View>
              <View style={{ transform: 'rotate(180deg)' }}>
                <ArrowDown color="#222222" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenFinishConfirmDialog}
              style={{
                paddingHorizontal: 10,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'red', fontWeight: '500', fontSize: 14 }}>{t('end_exam')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.navRow}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[0]?.id}
                style={[
                  styles.navButton,
                  currentQuestion?.id === questionList[0]?.id && { borderColor: palette.grey[300] }
                ]}
                onPress={disabled ? undefined : () => scrollToQuestion(ScrollType.FIRST)}
              >
                <View style={{ transform: 'rotate(180deg)' }}>
                  <LastIcon color={currentQuestion?.id === questionList[0]?.id ? palette.grey[300] : '#222222'} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[0]?.id}
                style={[
                  styles.navButton,
                  currentQuestion?.id === questionList[0]?.id && { borderColor: palette.grey[300] }
                ]}
                onPress={disabled ? undefined : () => scrollToQuestion(ScrollType.PREV)}
              >
                <View style={{ transform: 'rotate(180deg)', padding: 4 }}>
                  <NextIcon color={currentQuestion?.id === questionList[0]?.id ? palette.grey[300] : '#222222'} />
                </View>
                <Text
                  style={[
                    styles.actionTitle,
                    currentQuestion?.id === questionList[0]?.id && { color: palette.grey[300] }
                  ]}
                >
                  {t('previous_question')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[questionList.length - 1]?.id}
                style={[
                  styles.navButton,
                  currentQuestion?.id === questionList[questionList.length - 1]?.id && {
                    borderColor: palette.grey[300]
                  }
                ]}
                onPress={disabled ? undefined : () => scrollToQuestion(ScrollType.NEXT)}
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
                    color={
                      currentQuestion?.id === questionList[questionList.length - 1]?.id ? palette.grey[300] : '#222222'
                    }
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={currentQuestion?.id === questionList[questionList.length - 1]?.id}
                style={[
                  styles.navButton,
                  currentQuestion?.id === questionList[questionList.length - 1]?.id && {
                    borderColor: palette.grey[300]
                  }
                ]}
                onPress={disabled ? undefined : () => scrollToQuestion(ScrollType.LAST)}
              >
                <LastIcon
                  color={
                    currentQuestion?.id === questionList[questionList.length - 1]?.id ? palette.grey[300] : '#222222'
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {!isEnding && (
          <HangOnDialog
            title={t('notification')}
            content={t('waiting_for_all_students_to_complete_the_exam')}
            open={!!endExam && !!exam && !exam.isLate && !liveResultDialog}
          />
        )}

        {!exam && remainTime !== undefined && remainTime < 0 && liveResultDialog && <Loading isOverlay={false} />}
        <ConfirmDialog
          open={isOpenConfirmDialog}
          toggle={handleCloseConfirmDialog}
          text={t('are_you_sure_you_want_to_restart_the_exam')}
          onConfirm={() => {
            handleCloseConfirmDialog()
            handleRestartExam()
          }}
        />
        <ConfirmDialog
          open={openConfirmFinishDialog}
          title={t('exam_end')}
          toggle={handleCloseFinishConfirmDialog}
          text={
            isAllQuestionsAnswered(questionList)
              ? t('do_you_want_to_quit_your_exam')
              : t('there_are_still_unanswered_questions_do_you_want_to_end_the_exam')
          }
          onConfirm={handleFinishExam}
        />
        <ConfirmDialog
          open={openLeaveDialog}
          toggle={handleCloseLeaveDialog}
          text={t('are_you_sure_you_want_to_leave')}
          onConfirm={handleConfirmLeave}
        />
        <InfoExamCode open={openInfoExamDialog} onClose={handleCloseInfoExamDialog} examSession={examSession} />
        {currentQuestion && (
          <SelectAnswerSheet
            onFishedExam={handleOpenFinishConfirmDialog}
            visible={openAnswerSheet}
            onClose={handleCloseAnswerSheet}
            scrollToQuestion={scrollToQuestion}
            updateQuestionStar={updateQuestionStar}
            updateQuestionAnswer={updateQuestionAnswer}
            questionList={questionList}
            currentQuestion={currentQuestion}
            disabled={disabled}
          />
        )}
        {liveResultDialog && (
          <LiveResultDialog
            open={liveResultDialog}
            examCode={examCode}
            onClose={() => {
              handleCloseLiveResultDialog()
              navigate(Routes.Auth.Home)
            }}
            handleExamEnd={handleExamEnd}
            handleDetailExamResult={handleDetailExamResult}
          />
        )}
        {openResultDialog && (
          <ExamResult
            onClose={handleExamEnd}
            examCode={examCode}
            examSessionId={exam?.id}
            studentExamSessionId={exam?.studentExamSessionId}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100],
    zIndex: 10,
    backgroundColor: '#FFF',
  },
  titleContainer: {
    gap: '4@ms',
  },
  attemptBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '20@ms'
  },
  attemptText: {
    fontSize: '11@ms',
    fontWeight: '600'
  },
  title: {
    fontSize: '16@ms',
    color: '#222222',
    fontWeight: '600'
  },
  subtitle: {
    fontSize: '14@ms',
    fontWeight: '500',
    textAlign: 'center',
    color: palette.grey[400]
  },
  scrollContainer: {
    paddingHorizontal: '24@ms',
    paddingBottom: '200@ms',
    gap: '24@ms'
  },
  footer: {
    borderTopRightRadius: '12@ms',
    borderTopLeftRadius: '12@ms',
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: '20@ms',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: '-6@ms' },
    shadowOpacity: 0.1,
    shadowRadius: '14@ms',
    elevation: '10@ms',
    zIndex: 20
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  timeLeft: {
    color: '#222222',
    fontWeight: 600,
    fontSize: '16@ms'
  },
  totalTime: {
    color: '#222222',
    fontSize: '16@ms',
    fontWeight: 600
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
    fontWeight: '500'
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

export default DoExam
