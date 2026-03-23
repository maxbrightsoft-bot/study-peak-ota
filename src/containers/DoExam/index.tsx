import React from 'react'
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
    handleFinishExam
  } = useExam({ examCode })

  const currentQuestion = questionList.find((question) => question.id === currentQuestionId)
  const disabled = exam?.isLate
    ? exam?.lateStatus === ExamStatus.Paused || exam.lateStatus === ExamStatus.Completed
    : exam?.status === ExamStatus.Paused || exam?.status === ExamStatus.Completed

  if (isNotFoundExam) return <NotFoundExam title={'the_exam_code_you_are_looking_for_was_not_found'} />
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <TouchableOpacity onPress={handleOpenLeaveDialog}>
            <View style={{ transform: 'rotate(180deg)' }}>
              <ArrowRight width={24} height={24} color={palette.grey[300]} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>라이브 시험 중</Text>
          <Text style={styles.subtitle}>{remainTimeString}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}></View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1, position: 'relative' }}
      >
        {questionStarList.length > 0 && (
          <View
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 20,
              paddingVertical: 14,
              zIndex: 1,
              backgroundColor: palette.grey[500]
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#FFF' }}>별 표시한 문제 보기</Text>
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
          data={questionListMapped}
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
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: 600, color: '#171719' }}>{examSession?.subject}</Text>
                <View style={{ backgroundColor: palette.grey[300], paddingVertical: 7, width: 2 }} />
                <Text style={{ fontSize: 12, fontWeight: 500, color: '#222222' }}>{exam?.title}</Text>
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
                <Text style={{ color: palette.grey[300] }}>더보기</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.scrollContainer}
          renderItem={({ item }) => (
            <ExamQuestionGroup
              t={t}
              type={exam?.type}
              currentQuestion={currentQuestion}
              onOpenAnswerSheet={handleOpenAnswerSheet}
              data={item}
              questionRefs={questionRefs}
              isEnd={exam?.isLate ? exam?.lateStatus === ExamStatus.Completed : exam?.status === ExamStatus.Completed}
              status={exam?.isLate ? exam.lateStatus : exam?.status}
              questionList={questionList}
            />
          )}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews
        />

        <View>
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
                <Text style={styles.timeLeft}>{(currentQuestion?.questionOrder || 0) + 1}번 </Text>
                <Text style={styles.totalTime}>문제로 돌아가기</Text>
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
              <Text style={{ color: '#222222', fontWeight: 500, fontSize: 14 }}>시험종료</Text>
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
                onPress={() => scrollToQuestion(ScrollType.FIRST)}
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
                onPress={() => scrollToQuestion(ScrollType.PREV)}
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
                  이전 문항
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
                onPress={() => scrollToQuestion(ScrollType.NEXT)}
              >
                <Text
                  style={[
                    styles.actionTitle,
                    currentQuestion?.id === questionList[questionList.length - 1]?.id && { color: palette.grey[300] }
                  ]}
                >
                  다음 문항
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
                onPress={() => scrollToQuestion(ScrollType.LAST)}
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
      </KeyboardAvoidingView>
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
            : '아직 풀지 않은 문제가 있습니다.\n시험을 종료하시겠습니까?'
        }
        onConfirm={handleFinishExam}
      />
      <ConfirmDialog
        open={openLeaveDialog}
        toggle={handleCloseLeaveDialog}
        text={t('are_you_sure_you_want_to_leave')}
        onConfirm={() => navigate(Routes.Auth.Home)}
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
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  titleContainer: {
    gap: '4@ms'
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
    fontSize: 16,
    color: '#222222',
    fontWeight: '600'
  },
  attempt: {
    fontSize: 12,
    fontWeight: 500,
    color: palette.red[900]
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
    color: palette.grey[400]
  },
  currentQuestion: {
    fontWeight: 'bold',
    color: palette.grey[900],
    fontSize: 14
  },
  styleCard: {
    backgroundColor: palette.grey[50],
    marginVertical: 10,
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms'
  },
  styleExpand: {
    marginTop: 10
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 200,
    gap: 24
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
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 20,
    backgroundColor: '#FFF',
    boxShadow: '0px -6px 14px 0px #0000000F'
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  timeLeft: {
    color: '#222222',
    fontWeight: 600,
    fontSize: 16
  },
  totalTime: {
    color: '#222222',
    fontSize: 16,
    fontWeight: 600
  },
  navRow: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    paddingBottom: 34,
    gap: 8,
    justifyContent: 'space-between'
  },
  actionTitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#222222',
    fontWeight: 500
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#222222'
  },
  optionWrap: {},
  optionText: {}
})

export default DoExam
