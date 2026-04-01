import { palette, TYPO } from '@/theme'
import { Action, NoteResponse, Question } from '@/utils/types'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { Platform, Pressable, Text, TouchableOpacity, View } from 'react-native'
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
import { examStatusViewOptions } from '../configs/constants'
import useExamResult from '../hooks/useExamResult'
import PrintExamResult from './PrintExamResult'
import useCategoriesOverallChartContainer from '../hooks/useCategoriesOverallChartContainer'
import useOverallChartContainer from '../hooks/useOverallChartContainer'
import useOverallTimeChartContainer from '../hooks/useOverallTimeChartContainer'
import MyOverall from '@/containers/MyOverall'
import useQuestionTypesOverallChartContainer from '../hooks/useQuestionTypesOverallChartContainer'
import NoteDrawer from '@/containers/IncorrectAnswerNotes/components/NoteDrawer'
import CompareSolution from '@/containers/CompareSolution'
import SolutionOrderChart from '../components/SolutionOrderChart'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Menu, TouchableRipple } from 'react-native-paper'

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
    openActionMenu,
    handleOpenActionMenu,
    handleCloseActionMenu,
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
    timelyOrderQuestions,
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

  const {
    loading: loadingCreateConversation,
    isOpenQuestionDialog,
    handleCloseQuestionDialog,
    handleCreateQuestion,
    handleOpenQuestionDialog
  } = QADialog

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
    examResultData: resultData,
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
      case ExamStatusView.CompareSolution:
        return effectSize && <CompareSolution effectSize={effectSize} data={resultData} />
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
              categoryResponses={categoryResponses}
              resultData={resultData}
            />
          )
      case ExamStatusView.SolutionOrder:
        return <SolutionOrderChart data={timelyOrderQuestions} />
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
            <ExamNoteDialog examResultData={resultData} {...noteDialogProps} selectedQuestion={selectedQuestion} />
          </>
        )
      default:
        return
    }
  }

  return (
    <SlideDrawerRoot visible={!!resultData || !!textbookResult}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>
            {t('exam_results')}
          </Text>
        </View>
        <View>
          <Menu
            visible={openActionMenu}
            onDismiss={handleCloseActionMenu}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity onPress={handleOpenActionMenu} style={{ padding: 0, margin: 0 }}>
                <MaterialCommunityIcons name="dots-vertical" size={24} color={palette.grey[700]} />
              </TouchableOpacity>
            }
            contentStyle={{
              backgroundColor: '#F9F9F9',
              paddingVertical: 4,
              borderRadius: 12,
              overflow: 'hidden',
              minWidth: 250,
              top: Platform.OS === 'ios' ? -50 : 10
            }}
          >
            <TouchableRipple
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: '#E0E0E0'
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  gap: 8
                }}
              >
                <Feather name="rotate-cw" size={24} color="black" />
                <Text style={{ color: palette.grey[900], fontWeight: '600' }}>{t('restart_exam')}</Text>
              </View>
            </TouchableRipple>
          </Menu>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.tabs}>
          {examStatusViewOptions(t, chapterId).map(({ label, value }, index) => {
            const active = value === examStatusView
            return (
              <Pressable
                key={index}
                onPress={() => handleChangeExamStatusView(value)}
                style={[styles.tabButton, active && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(label)}</Text>
              </Pressable>
            )
          })}
        </View>
        <View
          style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, gap: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#222222', fontSize: 12, fontWeight: 600 }}>{resultData?.subjectName}</Text>
          <View style={{ height: 12, width: 2, backgroundColor: palette.grey[300] }} />
          <Text style={{ color: '#222222', fontSize: 12, fontWeight: 400 }}>{resultData?.title}</Text>
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
    </SlideDrawerRoot>
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
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms'
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: palette.grey[100]
  },
  tabButton: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '8@ms'
  },
  tabButtonActive: {
    backgroundColor: palette.main[600]
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: palette.grey[400]
  },
  tabTextActive: {
    color: '#FFFF'
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
    padding: 20,
    backgroundColor: palette.grey[100],
    paddingBottom: '40@ms'
  }
})
