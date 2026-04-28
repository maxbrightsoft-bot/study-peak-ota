import React, { useMemo } from 'react'
import { View, Text, Platform, KeyboardAvoidingView, TouchableOpacity, FlatList } from 'react-native'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import NotFoundExam from '@/components/NotFoundExam'
import useTextbook from './hooks/useTextbook'
import { ScrollType } from './config/types'
import TextbookQuestionGroup from './components/TextbookQuestionGroup'
import FloatingActionButton from '@/components/Button/FloatingActionButton'
import RestartPageDialog from '../Textbook/components/Dialog/RestartPageDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import useAlarmTextbook from './hooks/useAlarmTextbook'
import useDrawer from './hooks/useDrawer'
import { ExamStatus } from '@/utils/enums'
import LastIcon from '@/assets/iconJSX/last'
import NextIcon from '@/assets/iconJSX/next'
import ArrowDown from '@/assets/iconJSX/arrowDown'
import ArrowRight from '@/assets/iconJSX/arrowRight'
import TimerDropDown from '@/layouts/components/TimerDropDown'
import SelectAnswerSheet from './components/SelectAnswerSheet'
import MuteIcon from '@/assets/iconJSX/mute'
import { Ionicons } from '@expo/vector-icons'
import AudioGuideModal from '@/layouts/components/AudioGuideModal'
import TextbookDrawer from '../Textbook/components/Dialog/TextbookDrawer'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'

type Props = {
  textbookId: string
  page?: string
  reqTime?: string
  restart?: boolean
}

const DoTextbook = ({ textbookId, page, reqTime, restart }: Props) => {
  const { isOpenDialog, handleCloseDialog, handleOpenDialog } = useDrawer()

  const handleOpenDrawer = () => {
    handleOpenDialog()
    handleCloseAudioGuide()
  }

  const {
    t,
    textbook,
    questionRefs,
    questionList,
    questionGroupList,
    scrollViewRef,
    isNotFoundTextbook,
    updateQuestionAnswer,
    updateQuestionStar,
    formattedTime,
    remainTime,
    remainTimeString,
    totalTasks,
    speaker,
    openExpiredQuestionDialog,
    handleCloseExpiredQuestionDialog,
    handleOpenExpiredQuestionDialog,
    disabledSpeaker,
    openTimerDialog,
    handleOpenAnswerSheet,
    handleTimerDialogToggle,
    alarmClockProps,
    audioGuideModalProps,
    isAlarmRunning,
    isTimerRunning,
    studyTimerProps,
    openTextbookResultDialog,
    handleCloseTextbookResultDialog,
    handleOpenTextbookResultDialog,
    timeUpdateDialogProps,
    handleToggleSpeaker,
    currentQuestionId,
    startPageOptions,
    scrollToQuestion,
    completedTasks,
    openAnswerSheet,
    questionStarList,
    handleNextStar,
    handlePrevStar,
    openLeaveDialog,
    handleCloseLeaveDialog,
    handleOpenLeaveDialog,
    handleCloseAnswerSheet,
    onFinishedTextbook,
    isOpenConfirmDialog,
    handleRestartTextbook,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    openRestartTextbookDialog,
    handleCloseRestartTextbookDialog,
    handleOpenRestartTextbookDialog,
    handlePauseAndResumeTextbook
  } = useTextbook({
    textbookId,
    page,
    reqTime,
    handleOpenDrawer,
    restart
  })

  const { isOpenAudioGuide, handleOpenAudioGuide, handleCloseAudioGuide, handleStartTextbook } = useAlarmTextbook({
    onStart: alarmClockProps.panelProps.onStart,
    handleCloseDialog,
  })
  const disabled = textbook?.status === ExamStatus.Completed || textbook?.status === ExamStatus.Paused

  const currentQuestion = useMemo(
    () => questionList.find((q) => q.id === currentQuestionId),
    [questionList, currentQuestionId]
  )

  const groupedQuestions = useMemo(() => {
    return questionGroupList.map((group) => ({
      ...group,
      questions: questionList.filter((q) => q.questionGroupId === group.id)
    }))
  }, [questionGroupList, questionList])

  if (isNotFoundTextbook) {
    return <NotFoundExam title={t('textbook_not_found')} />
  }

  const audioTextbookProp = !textbook
    ? undefined
    : {
      ...textbook,
      createdAt: '',
      coverImage: '',
      limitedTimeInMinutes: 0,
      totalUses: 0
    }

  const handleStartTextbookFromGuideModal = (enable: boolean) => {
    if (!audioTextbookProp) return
    handleStartTextbook(enable, audioTextbookProp)
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <TouchableOpacity>
            <TouchableOpacity onPress={handleOpenLeaveDialog}>
              <View style={{ transform: 'rotate(180deg)' }}>
                <ArrowRight width={24} height={24} color={palette.grey[300]} />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.subtitle, { color: (remainTime || 0) < 10 && textbook?.isMock ? palette.red[900] : palette.grey[400] }]}>{!textbook?.isMock ? formattedTime : remainTimeString}</Text>
            {!textbook?.isMock && (
              <View style={styles.timeContainer}>
                <Text style={styles.timeLeft}>
                  {completedTasks}/{totalTasks}
                </Text>
                <Text style={styles.totalTime}>
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {(isTimerRunning || isAlarmRunning) && (
              <TouchableOpacity onPress={() => handleToggleSpeaker()}>
                {speaker ? <Ionicons name="volume-high" size={24} color={palette.grey[500]} /> : <MuteIcon />}
              </TouchableOpacity>
            )}
            <TimerDropDown
              speaker={speaker}
              isTextbook
              disabledSpeaker={disabledSpeaker}
              openTimerDialog={openTimerDialog}
              alarmClockProps={alarmClockProps}
              audioGuideModalProps={audioGuideModalProps}
              isAlarmRunning={isAlarmRunning}
              isTimerRunning={isTimerRunning}
              studyTimerProps={studyTimerProps}
              timeUpdateDialogProps={timeUpdateDialogProps}
              onToggleSpeaker={handleToggleSpeaker}
              onToggleTimerDialog={handleTimerDialogToggle}
            />
            <FloatingActionButton
              t={t}
              isOnlyRestart={!textbook?.isMock}
              status={textbook?.status}
              onTogglePauseResume={handlePauseAndResumeTextbook}
              onOpenConfirmDialog={textbook?.isMock ? handleOpenConfirmDialog : handleOpenRestartTextbookDialog}
              keys={{
                pause: 'pause_textbook',
                resume: 'resume_textbook',
                restart: 'restart_textbook'
              }}
              ariaLabel="textbook-actions"
            />
          </View>
        </View>

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
          data={groupedQuestions}
          keyExtractor={(item) => `group-${item.id}`}
          ref={scrollViewRef}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <TextbookQuestionGroup
              t={t}
              data={item}
              questionRefs={questionRefs}
              type={textbook?.type}
              handleOpenExpiredQuestionDialog={handleOpenExpiredQuestionDialog}
              currentQuestionId={currentQuestionId}
              onOpenAnswerSheet={handleOpenAnswerSheet}
              isEnd={textbook?.status === ExamStatus.Completed}
              isMock={textbook?.isMock}
              status={textbook?.status}
              subjectType={textbook?.type}
            />
          )}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
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
              onPress={
                disabled
                  ? textbook?.status === ExamStatus.Completed
                    ? handleOpenExpiredQuestionDialog
                    : undefined
                  : () => handleOpenAnswerSheet()
              }
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.timeLeft}>{t('number_question', { number: (currentQuestion?.questionOrder || 0) + 1 })} </Text>
                <Text style={styles.totalTime}>{t('return_to_question')}</Text>
              </View>
              <View style={{ transform: 'rotate(180deg)' }}>
                <ArrowDown color="#222222" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenLeaveDialog}
              style={{
                paddingHorizontal: 10,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'red', fontWeight: 500, fontSize: 14 }}>{t('end_exam')}</Text>
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
                onPress={disabled
                  ? textbook?.status === ExamStatus.Completed
                    ? handleOpenExpiredQuestionDialog
                    : undefined
                  : () => scrollToQuestion(ScrollType.FIRST)}
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
                onPress={disabled
                  ? textbook?.status === ExamStatus.Completed
                    ? handleOpenExpiredQuestionDialog
                    : undefined
                  : () => scrollToQuestion(ScrollType.PREV)}
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
                onPress={disabled
                  ? textbook?.status === ExamStatus.Completed
                    ? handleOpenExpiredQuestionDialog
                    : undefined
                  : () => scrollToQuestion(ScrollType.NEXT)}
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
                onPress={disabled
                  ? textbook?.status === ExamStatus.Completed
                    ? handleOpenExpiredQuestionDialog
                    : undefined
                  : () => scrollToQuestion(ScrollType.LAST)}
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
        <RestartPageDialog
          title={t('restart')}
          options={startPageOptions}
          t={t}
          onClose={handleCloseRestartTextbookDialog}
          open={openRestartTextbookDialog}
          onSubmit={handleOpenConfirmDialog}
        />
        <ConfirmDialog
          open={isOpenConfirmDialog}
          toggle={handleCloseConfirmDialog}
          text={t('are_you_sure_you_want_to_restart_the_textbook')}
          onConfirm={() => {
            if (textbook?.isMock) {
              handleCloseConfirmDialog()
              handleOpenAudioGuide()
            } else handleRestartTextbook()
          }}
        />
        {openTextbookResultDialog && (
          <TextbookDrawer
            isOpen={openTextbookResultDialog}
            onOpenAudioGuide={() => audioGuideModalProps.onStart(true)}
            onClose={() => {
              navigate(Routes.Auth.Textbook)
              handleCloseTextbookResultDialog()
            }}
            textbookId={+textbookId}
          />
        )}
        <ConfirmDialog
          open={openLeaveDialog}
          toggle={handleCloseLeaveDialog}
          text={t('are_you_sure_you_want_to_leave')}
          onConfirm={onFinishedTextbook}
        />
        <ConfirmDialog
          open={openExpiredQuestionDialog}
          toggle={handleCloseExpiredQuestionDialog}
          onCancel={() => navigate(Routes.Auth.Textbook)}
          text={t('expired_question_prompt')}
          onConfirm={handleOpenTextbookResultDialog}
        />
        {currentQuestion && (
          <SelectAnswerSheet
            onFishedExam={handleOpenLeaveDialog}
            visible={openAnswerSheet}
            onClose={handleCloseAnswerSheet}
            scrollToQuestion={scrollToQuestion}
            updateQuestionStar={updateQuestionStar}
            updateQuestionAnswer={updateQuestionAnswer}
            questionList={questionList}
            currentQuestion={currentQuestion}
          />
        )}
        {audioTextbookProp && (
          <AudioGuideModal
            open={isOpenAudioGuide}
            audioUrls={audioTextbookProp.subject?.audioUrls ?? []}
            onClose={handleCloseAudioGuide}
            onStart={handleStartTextbookFromGuideModal}
          />
        )}
        {audioGuideModalProps.open && (
          <AudioGuideModal
            open={audioGuideModalProps.open}
            audioUrls={audioGuideModalProps.audioUrls}
            onClose={audioGuideModalProps.onClose}
            onStart={audioGuideModalProps.onStart}
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
  titleContainer: {
    gap: '4@ms'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 10,
    borderColor: palette.grey[100],
    backgroundColor: '#FFF',
    elevation: 5
  },
  title: {
    fontSize: 16,
    color: '#222222',
    fontWeight: '600'
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: palette.grey[400]
  },
  currentQuestion: {
    fontWeight: 'bold',
    fontSize: 14,
    color: palette.grey[900]
  },
  scrollContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 200,
    gap: 24
  },
  footer: {
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 20
  },
  footerTop: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  finishText: {
    color: '#222222',
    fontWeight: 500,
    fontSize: 14
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
    paddingBottom: 34,
    gap: 8,
    flexDirection: 'row',
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
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#222222'
  }
})

export default DoTextbook
