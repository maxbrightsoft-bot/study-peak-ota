import React from 'react'
import { View, Text, ScrollView, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import NotFoundExam from '@/components/NotFoundExam'
import useTextbook from './hooks/useTextbook'
import { PreparedQuestionGroupResponse } from './config/types'
import TextbookQuestionGroup from './components/TextbookQuestionGroup'
import FloatingActionButton from '@/components/Button/FloatingActionButton'
import RestartPageDialog from '../Textbook/components/Dialog/RestartPageDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import useAlarm from '@/layouts/hooks/useAlarm'
import AudioGuideModal from '@/layouts/components/AudioGuideModal'
import useAlarmTextbook from './hooks/useAlarmTextbook'
import TextbookDrawer from '../Textbook/components/Dialog/TextbookDrawer'
import useDrawer from './hooks/useDrawer'
import { ExamStatus } from '@/utils/enums'

type Props = {
  textbookId: string
  page?: string
  reqTime?: string
  restart?: boolean
}

const DoTextbook = ({ textbookId, page, reqTime, restart }: Props) => {
  const {
    alarmClockProps: {
      panelProps: { onStart, onPauseOrResume }
    }
  } = useAlarm(false, [])

  const { isOpenDialog, handleCloseDialog, handleOpenDialog } = useDrawer()

  const { isOpenAudioGuide, handleOpenAudioGuide, handleCloseAudioGuide, handleStartTextbook } = useAlarmTextbook({
    onStart,
    handleCloseDialog
  })

  const handleOpenDrawer = () => {
    handleOpenDialog()
    handleCloseAudioGuide()
  }
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
    remainTimeString,
    totalTasks,
    startPageOptions,
    scrollToNextQuestion,
    completedTasks,
    handleQuestionLayout,
    onFinishedTextbook,
    isOpenConfirmDialog,
    handleRestartTextbook,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    openRestartTextbookDialog,
    handleCloseRestartTextbookDialog,
    handleOpenRestartTextbookDialog,
    handlePauseAndResumeTextbook
  } = useTextbook({ textbookId, page, reqTime, handleOpenDrawer, onPauseOrResume, restart })

  const audioTextbookProp = !textbook
    ? undefined
    : {
        ...textbook,
        createdAt: '',
        coverImage: '',
        limitedTimeInMinutes: 0,
        totalUses: 0
      }
  if (isNotFoundTextbook) {
    return <NotFoundExam title={t('textbook_not_found')} />
  }

  const handleStartTextbookFromGuideModal = (enable: boolean) => {
    if (!audioTextbookProp) return
    handleStartTextbook(enable, audioTextbookProp)
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
        <View style={{ height: '85%' }}>
          <ScrollView contentContainerStyle={styles.scrollContainer} onScroll={handleScroll} ref={scrollViewRef}>
            {questionGroupList.map((questionGroup: PreparedQuestionGroupResponse, groupIndex: number) => (
              <React.Fragment key={`group-${questionGroup.id}`}>
                <View onLayout={handleLayout(questionGroup.pageFrom || 1)} />
                <TextbookQuestionGroup
                  t={t}
                  data={questionGroup}
                  questionRefs={questionRefs}
                  handleQuestionLayout={handleQuestionLayout}
                  scrollToNextQuestion={scrollToNextQuestion}
                  updateQuestionStar={updateQuestionStar}
                  updateQuestionAnswer={updateQuestionAnswer}
                  groupIndex={groupIndex}
                  expandedId={expandedId}
                  isEnd={textbook?.status === ExamStatus.Completed}
                  isMock={textbook?.isMock}
                  status={textbook?.status}
                  questionList={questionList}
                  toggleExpand={toggleExpand}
                />
              </React.Fragment>
            ))}
          </ScrollView>
        </View>

        <View>
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

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{t(!textbook?.isMock ? 'time' : 'current_time')}:</Text>
            <Text
              style={[
                styles.timeText,
                { fontWeight: 700, color: palette.main[500], width: !textbook?.isMock ? 100 : 'auto' }
              ]}
            >
              {!textbook?.isMock ? formattedTime : remainTimeString}
            </Text>
          </View>
          {!textbook?.isMock && (
            <View style={styles.container}>
              <Text style={[styles.timeText, { fontWeight: 700 }]}>
                {completedTasks}/{totalTasks}
              </Text>
              <Text style={[styles.timeText, { fontWeight: 700 }]}>
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onFinishedTextbook}
            style={{
              width: 36,
              height: 36,
              borderRadius: 255,
              backgroundColor: palette.grey[50],
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="exit" size={14} color={palette.main[700]} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <RestartPageDialog
        title={t('restart')}
        options={startPageOptions}
        t={t}
        onClose={handleCloseRestartTextbookDialog}
        open={openRestartTextbookDialog}
        onSubmit={handleOpenConfirmDialog}
      />
      {audioTextbookProp && (
        <AudioGuideModal
          open={isOpenAudioGuide}
          audioUrls={audioTextbookProp.subject?.audioUrls ?? []}
          onClose={handleCloseAudioGuide}
          onStart={handleStartTextbookFromGuideModal}
        />
      )}
      {isOpenDialog && (
        <TextbookDrawer
          isOpen={isOpenDialog}
          onClose={handleCloseDialog}
          textbookId={textbook?.id}
          onOpenAudioGuide={handleOpenAudioGuide}
        />
      )}
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
    paddingHorizontal: 24
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
  scrollContainer: {
    paddingHorizontal: 24
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 8,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  timeContainer: {
    flexDirection: 'row',
    gap: '8@ms',
    paddingVertical: 8
  },
  timeText: {
    fontSize: 16
  },
  totalTime: {
    color: palette.grey[500],
    fontSize: 14,
    fontWeight: 500
  }
})

export default DoTextbook
