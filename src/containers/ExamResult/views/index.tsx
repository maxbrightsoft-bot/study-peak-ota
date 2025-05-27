import SlideDrawer from '@/components/ModalBase/SlideDrawer'
import StartArrowSelect from '@/components/Select/StartArrowSelect'
import { palette, TYPO } from '@/theme'
import { utcToLocalTime } from '@/utils/helpers'
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
import { AnswerItemBaseProps } from '@/containers/MyAnswer/configs/types'
import ExamOverView from '../components/ExamOverView'
import { examStatusViewOptions } from '../configs/constants'
import useExamResult from '../hooks/useExamResult'
import PrintExamResult from './PrintExamResult'
import TextbookOverView from '../components/TextbookOverView'

type Props = {
  examCode?: string
  onClose: () => void
  chapterId?: number
}

const ExamResult = ({ onClose, examCode, chapterId }: Props) => {
  const {
    t,
    contentRef,
    QADialog,
    handlePrint,
    examResultData,
    examResultNotes,
    handleOpenQuestionDialogFromNote,
    handleOpenNoteDialogFromQuestion
  } = useExamResult({ examCode, chapterId, isPrint: false })

  const {
    examStatusView,
    resultData,
    longTimeSpend,
    openProblem,
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
    isOpenQuestionDialog,
    questionIdContextMenu,
    handleCloseQuestionDialog,
    handleCreateQuestion,
    handleOpenQuestionContextMenu,
    handleOpenQuestionDialog,
    handleCloseQuestionContextMenu
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

  const questionItemProp: AnswerItemBaseProps = {
    menuContextActions: questionActions,
    onCloseContextMenu: handleCloseQuestionContextMenu,
    onOpenContextMenu: handleOpenQuestionContextMenu
  }

  const [setlectedNoteView, setSetlectedNoteView] = useState<NoteResponse>()

  const handleOpenNoteDrawer = (note: NoteResponse) => {
    setSetlectedNoteView(note)
  }
  const handleCloseNoteDrawer = () => {
    setSetlectedNoteView(undefined)
  }

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
      onPress: handleOpenEditNote
    },
    {
      label: t('delete_note'),
      startIcon: <Ionicons name="trash" size={14} color={palette.error.main} />,
      textStyle: {
        color: palette.error.main
      },
      onPress: handleOpenDeleteNoteDialog
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
      case ExamStatusView.MyAnswers:
        return (
          chapterId
          ? textbookResult && <TextbookMyAnswer data={textbookResult} />
          : resultData && <ExamMyAnswer data={resultData} categories={categoryResponses} />
        )
      case ExamStatusView.QuestionAnalysis:
        return (
          chapterId
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
        )
      case ExamStatusView.IncorrectAnswerNotes:
        return (
          chapterId ? null : <>
            <IncorrectAnswerNotes
              notesContainerProps={notesContainerProps}
              onCreateNote={handleOpenNoteDialogCreateNote}
            />
            <CreateNewQuestionDialog
              examSessionId={resultData?.examSessionId}
              studentTextbookId={textbookResult?.studentTextbookSessionId}
              handleCreateQuestion={handleCreateQuestion}
              openCreateQuestionDialog={isOpenQuestionDialog}
              onCloseCreateQuestion={handleCloseQuestionDialog}
              questionOptions={questionOptions}
              selectedQuestion={selectedQuestion}
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="chevron-back-outline" size={24} color={palette.main[500]} />
            <Text style={[styles.backText]}>티로 가기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
            <Text style={[styles.printText]}>{t('print')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.examTitle}>{chapterId ? textbookResult?.chapterName : resultData?.title}</Text>
          <Text style={styles.examDate}> {chapterId ? utcToLocalTime(textbookResult?.startTime, t('date_format')) :  utcToLocalTime(resultData?.startTime, t('date_format'))}</Text>
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
          chapterId={chapterId}
          openProblem={openProblem}
          setOpenProblem={setOpenProblem}
          longTimeSpend={longTimeSpend}
          textbookResult={textbookResult}
        />
      </View>
    </SlideDrawer>
  )
}

export default ExamResult

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: '24@ms'
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
    color: palette.main[500]
  },
  printButton: {
    padding: 8
  },
  printText: {
    ...TYPO.button2,
    fontWeight: 700,
    color: palette.main[500]
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '18@ms',
    paddingHorizontal: '24@ms'
  },
  examTitle: {
    ...TYPO.button3,
    fontWeight: 700,
    color: palette.grey[900],
    marginBottom: 4
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    marginLeft: 4
  },
  dropdownContainer: {
    marginVertical: '12@ms',
    alignSelf: 'flex-start'
  },
  overviewContainer: {
    paddingVertical: '24@ms',
    gap: '16@ms'
  },
  overviewItem: {
    marginBottom: 16
  },
  overviewLabel: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginBottom: 4
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
    marginBottom: '40@ms'
  }
})
