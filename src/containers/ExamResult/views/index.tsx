import SlideDrawer from '@/components/ModalBase/SlideDrawer'
import StartArrowSelect from '@/components/Select/StartArrowSelect'
import { palette, TYPO } from '@/theme'
import { isValidTime, utcToLocalTime } from '@/utils/helpers'
import { Action, NoteResponse, Question } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { ExamStatusView } from '@/utils/enums'
import ExamMyAnswer from '@/containers/MyAnswer/views/ExamMyAnswer'
import TextbookMyAnswer from '@/containers/MyAnswer/views/TextbookMyAnswer'
import ExamQuestionAnalysis from '@/containers/QuestionAnalysis/views/ExamQuestionAnalysis'
import TextbookQuestionAnalysis from '@/containers/QuestionAnalysis/views/TextbookQuestionAnalysis'
import IncorrectAnswerNotes from '@/containers/IncorrectAnswerNotes'
import { NotesContainerProps } from '@/containers/IncorrectAnswerNotes/configs/interfaces'
import ExamNoteDialog from '@/containers/IncorrectAnswerNotes/components/ExamNoteDialog'
import CreateNewQuestionDialog from '../components/CreateNewQuestionDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import ExamOverView from '../components/ExamOverView'
import { examStatusViewOptions } from '../configs/constants'
import useExamResult from '../hooks/useExamResult'
import PrintExamResult from './PrintExamResult'
import TextbookOverView from '../components/TextbookOverView'
import useCategoriesOverallChartContainer from '../hooks/useCategoriesOverallChartContainer'
import useOverallChartContainer from '../hooks/useOverallChartContainer'
import useOverallTimeChartContainer from '../hooks/useOverallTimeChartContainer'
import MyOverall from '@/containers/MyOverall'
import useQuestionTypesOverallChartContainer from '../hooks/useQuestionTypesOverallChartContainer'
import NoteDrawer from '@/containers/IncorrectAnswerNotes/components/NoteDrawer'

type Props = {
  examCode?: string
  code?: string
  examSessionId?: any
  onClose?: () => void
  chapterId?: number
  studentId?: number
  studentExamSessionId?: any
  onViewQA?: (studentId: number, sessionId?: number, questionId?: number, isTextbook?: boolean) => void
}

const ExamResult = ({ onClose, code, examSessionId, examCode, chapterId, studentExamSessionId, onViewQA }: Props) => {
  const {
    t,
    contentRef,
    QADialog,
    handlePrint,
    examResultData,
    examResultNotes,
    isOpenConfirmRestartExamDialog,
    handleOpenConfirmRestartExamDialog,
    handleCloseConfirmRestartExamDialog,
    handleOpenQuestionDialogFromNote,
    handleOpenNoteDialogFromQuestion
  } = useExamResult({
    examCode: examCode || code || '',
    chapterId,
    examSessionId,
    studentExamSessionId,
    isPrint: false
  })

  const {
    examStatusView,
    resultData,
    longTimeSpend,
    openProblem,
    effectSize,
    handleRestartExam,
    textbookResult,
    categoryResponses,
    questionOptions,
    selectedQuestion,
    handleChangeExamStatusView,
    setOpenProblem
  } = examResultData

  const {
    notes,
    noteDialogProps,
    noteIdContextMenu,
    isLoadingNotes,
    openDeleteNoteDialog,
    handleLoadMore,
    handleDeleteNote,
    handleOpenNoteDialogCreateNote,
    handleCloseTooltip,
    handleOpenTooltip,
    handleOpenEditNote,
    handleOpenDeleteNoteDialog,
    handleCloseDeleteDialog
  } = examResultNotes

  const { loading: loadingCreateConversation, isOpenQuestionDialog, handleCloseQuestionDialog, handleCreateQuestion, handleOpenQuestionDialog } = QADialog

  const questionActions: Action<Question>[] = chapterId
    ? [
        {
          label: 'ask_a_question',
          textStyle: {
            color: '#3dc674'
          },
          onPress: handleOpenQuestionDialog
        }
      ]
    : [
        {
          label: 'write_a_note_of_incorrect_answers',
          textStyle: {
            color: '#3dc674'
          },
          onPress: handleOpenNoteDialogFromQuestion
        },
        {
          label: 'ask_a_question',
          textStyle: {
            color: '#3dc674'
          },
          onPress: handleOpenQuestionDialog
        }
      ]

  const [selectedNoteView, setSelectedNoteView] = useState<NoteResponse>()

  const handleOpenNoteDrawer = (note: NoteResponse) => {
    setSelectedNoteView(note)
  }

  const handleCloseNoteDrawer = () => {
    setSelectedNoteView(undefined)
  }

  const overallChartContainer = useOverallChartContainer(
    examCode ?? '',
    studentExamSessionId,
    code ?? '',
    chapterId ?? 0
  )

  const categoriesOverallChartContainer = useCategoriesOverallChartContainer(
    examResultData.resultData,
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0,
    false
  )

  const subcategoriesOverallChartContainer = useCategoriesOverallChartContainer(
    examResultData.resultData,
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0,
    true
  )

  const questionTypesOverallChartContainer = useQuestionTypesOverallChartContainer(
    examResultData.resultData,
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0,
    true
  )

  const overallTimeChartContainer = useOverallTimeChartContainer(
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0
  )

  const noteItemActions: Action<NoteResponse>[] = [
    {
      label: t('ask_a_question'),
      textStyle: {
        color: palette.success.main
      },
      onPress: handleOpenQuestionDialogFromNote
    },
    {
      label: t('edit_note'),
      textStyle: {
        color: palette.warning.main
      },
      onPress: (data: NoteResponse) => handleOpenEditNote(data)
    },
    {
      label: t('delete_note'),
      startIcon: <Ionicons name="trash" size={14} color={palette.error.main} />,
      textStyle: {
        color: palette.error.main
      },
      onPress: (data: NoteResponse) => handleOpenDeleteNoteDialog(data)
    }
  ]

  const notesContainerProps: NotesContainerProps = {
    data: notes,
    noteIdContextMenu: noteIdContextMenu,
    itemActions: noteItemActions,
    onCloseTooltip: handleCloseTooltip,
    onOpenTooltip: handleOpenTooltip,
    onLoadMore: handleLoadMore,
    onItemClick: handleOpenNoteDrawer,
    isLoading: isLoadingNotes
  }

  const renderBody = () => {
    switch (examStatusView) {
      case ExamStatusView.ExamOverview:
        return chapterId
          ? textbookResult && <TextbookOverView t={t} resultData={textbookResult} />
          : resultData && <ExamOverView t={t} resultData={resultData} />
      case ExamStatusView.MyOverall:
        return chapterId
          ? null
          : resultData && (
              <MyOverall
                resultData={resultData}
                subcategoriesOverallChartContainerProps={subcategoriesOverallChartContainer}
                overallChartContainerProps={overallChartContainer}
                categoriesOverallChartContainerProps={categoriesOverallChartContainer}
                overallTimeChartContainerProps={overallTimeChartContainer}
                questionTypesOverallChartContainerProps={questionTypesOverallChartContainer}
              />
            )
      case ExamStatusView.MyAnswers:
        return chapterId
          ? textbookResult && <TextbookMyAnswer data={textbookResult} effectSize={effectSize} />
          : resultData && <ExamMyAnswer data={resultData} categories={categoryResponses} effectSize={effectSize} />
      case ExamStatusView.QuestionAnalysis:
        return chapterId
          ? textbookResult && (
              <TextbookQuestionAnalysis
                longTimeSpend={longTimeSpend}
                openProblem={openProblem}
                setOpenProblem={setOpenProblem}
                categoryResponses={categoryResponses}
                resultData={textbookResult}
              />
            )
          : resultData && (
              <ExamQuestionAnalysis
                longTimeSpend={longTimeSpend}
                openProblem={openProblem}
                setOpenProblem={setOpenProblem}
                categoryResponses={categoryResponses}
                resultData={resultData}
              />
            )
      case ExamStatusView.IncorrectAnswerNotes:
        return chapterId ? null : (
          <>
            <IncorrectAnswerNotes
              notesContainerProps={notesContainerProps}
              onCreateNote={handleOpenNoteDialogCreateNote}
            />
            <ConfirmDialog
              open={openDeleteNoteDialog}
              toggle={handleCloseDeleteDialog}
              onConfirm={handleDeleteNote}
              text={t('are_you_sure_you_want_to_delete_the_note')}
              title={t('delete_note')}
              okText={t('delete_note')}
              cancelText={t('cancel')}
              isDelete
            />
            <ExamNoteDialog {...noteDialogProps} selectedQuestion={selectedQuestion} />
          </>
        )
      default:
        return
    }
  }

  return (
    <SlideDrawer visible={!!resultData || !!textbookResult}>
      <View style={styles.container}>
        <View style={{ paddingVertical: 16 }}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="chevron-back-outline" size={20} color={palette.main[500]} />
              <Text style={[styles.backText]}>티로 가기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
              <Text style={[styles.printText]}>{t('print')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.action}>
            <TouchableOpacity style={styles.restartButton} onPress={handleOpenQuestionDialog}>
              <View style={styles.iconWrapper}>
                <Ionicons name="chatbubble-ellipses-sharp" size={14} color={palette.main[500]} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: palette.main[500] }}>{t('ask_a_question2')}</Text>
            </TouchableOpacity>
            {!chapterId && (
              <TouchableOpacity style={styles.restartButton} onPress={handleOpenConfirmRestartExamDialog}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="refresh-outline" size={14} color="#3498db" />
                </View>
                <Text style={styles.restartText}>{t('restart_exam')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.titleContainer}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text style={styles.examTitle}>{chapterId ? textbookResult?.chapterName : resultData?.title}</Text>
            {(resultData?.studentTotalAttemptTime || 0) > 1 && (
              <Text
                style={{
                  fontWeight: 500,
                  fontSize: 12,
                  color: resultData?.isSelected ? palette.main[700] : palette.red[900]
                }}
              >
                {`#${(resultData?.studentAttemptNumber || 0) + 1}/${resultData?.studentTotalAttemptTime}`}
              </Text>
            )}
          </View>
          <Text style={styles.examDate}>
            {chapterId
              ? utcToLocalTime(textbookResult?.startTime, t('date_format'))
              : utcToLocalTime(
                  isValidTime(resultData?.studentStartTime) ? resultData?.studentStartTime : resultData?.startTime,
                  t('date_format')
                )}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.dropdownContainer}>
            <StartArrowSelect
              items={examStatusViewOptions(t, chapterId)}
              value={examStatusView}
              onValueChange={handleChangeExamStatusView}
            />
          </View>
        </View>
        <View style={styles.contentContainer}>{renderBody()}</View>
      </View>
      <View style={{ opacity: 0, position: 'absolute', top: -9999 }}>
        <PrintExamResult
          contentRef={contentRef}
          categoryResponses={categoryResponses}
          resultData={resultData}
          overallChartContainer={overallChartContainer}
          categoriesOverallChartContainer={categoriesOverallChartContainer}
          overallTimeChartContainer={overallTimeChartContainer}
          chapterId={chapterId ?? 0}
          openProblem={openProblem}
          setOpenProblem={setOpenProblem}
          longTimeSpend={longTimeSpend}
          textbookResult={textbookResult}
        />
      </View>
      {!!selectedNoteView && (
        <NoteDrawer
          open={!!selectedNoteView}
          data={selectedNoteView}
          onClose={handleCloseNoteDrawer}
          showStudentInfo={false}
        />
      )}
      <CreateNewQuestionDialog
        loading={loadingCreateConversation}
        examSessionId={resultData?.examSessionId}
        studentTextbookId={textbookResult?.studentTextbookSessionId}
        handleCreateQuestion={handleCreateQuestion}
        openCreateQuestionDialog={isOpenQuestionDialog}
        onCloseCreateQuestion={handleCloseQuestionDialog}
        questionOptions={questionOptions}
        selectedQuestion={selectedQuestion}
      />
      <ConfirmDialog
        open={!!isOpenConfirmRestartExamDialog}
        toggle={() => handleCloseConfirmRestartExamDialog?.()}
        text={t('are_you_sure_you_want_to_restart_the_exam')}
        onConfirm={() => {
          handleCloseConfirmRestartExamDialog?.()
          handleRestartExam?.()
        }}
      />
    </SlideDrawer>
  )
}

export default ExamResult

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '24@ms'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    fontWeight: 700,
    color: palette.grey[900]
  },
  action: { paddingHorizontal: '24@ms', gap: 8, flexDirection: 'row', justifyContent: 'space-between' },
  printButton: {
    paddingVertical: '8@ms'
  },
  printText: {
    ...TYPO.button2,
    fontWeight: 700,
    color: palette.grey[900]
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    borderWidth: 1,
    borderColor: '#d0d0c8',
    borderRadius: '6@ms'
  },
  iconWrapper: {
    marginRight: '6@ms'
  },
  restartText: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#3498db'
  },
  titleContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: palette.grey[100],
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  examTitle: {
    ...TYPO.button3,
    fontWeight: 700,
    color: palette.grey[900]
  },
  examDate: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  section: {
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms',
    backgroundColor: palette.grey[50],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  sectionTitle: {
    marginLeft: 4
  },
  dropdownContainer: {
    alignSelf: 'flex-start'
  },
  overviewContainer: {
    paddingVertical: '24@ms',
    gap: '16@ms'
  },
  overviewValue: {
    ...TYPO.button3,
    color: palette.grey[900]
  },
  doubleColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  columnItem: {
    width: '48%'
  },
  contentContainer: {
    paddingBottom: '40@ms'
  }
})
