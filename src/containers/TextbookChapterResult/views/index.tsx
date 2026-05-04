import { palette } from '@/theme'
import { Action, NoteResponse } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import TextbookMyAnswer from '@/containers/MyAnswer/views/TextbookMyAnswer'
import IncorrectAnswerNotes from '@/containers/IncorrectAnswerNotes'
import { NotesContainerProps } from '@/containers/IncorrectAnswerNotes/configs/interfaces'
import ExamNoteDialog from '@/containers/IncorrectAnswerNotes/components/ExamNoteDialog'
import NoteDrawer from '@/containers/IncorrectAnswerNotes/components/NoteDrawer'
import CreateNewQuestionDialog from '@/containers/ExamResult/components/CreateNewQuestionDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import useTextbookChapterResultView from '../hooks/useTextbookChapterResultView'
import { TextbookChapterResultTab } from '../configs/constants'

type Props = {
  open: boolean
  onClose: () => void
  chapterId?: number
}

const TextbookChapterResultView = ({ open, onClose, chapterId }: Props) => {
  const {
    t,
    activeTab,
    textbookResult,
    effectSize,
    selectedQuestion,
    questionOptions,
    tabOptions,
    textbookResultNotes,
    QADialog,
    handleChangeTab,
    handleOpenNoteDialogFromQuestion,
    handleOpenQuestionDialogFromNote
  } = useTextbookChapterResultView({ chapterId })

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
  } = textbookResultNotes

  const {
    isOpenQuestionDialog,
    handleCloseQuestionDialog,
    handleCreateQuestion,
    handleOpenQuestionDialog
  } = QADialog

  const [selectedNoteView, setSelectedNoteView] = useState<NoteResponse>()

  const handleOpenNoteDrawer = (note: NoteResponse) => {
    setSelectedNoteView(note)
  }

  const handleCloseNoteDrawer = () => {
    setSelectedNoteView(undefined)
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
    switch (activeTab) {
      case TextbookChapterResultTab.MyAnswers:
        return textbookResult && <TextbookMyAnswer data={textbookResult} effectSize={effectSize} />
      case TextbookChapterResultTab.IncorrectAnswerNotes:
        return (
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
        return null
    }
  }

  return (
    <SlideDrawerRoot visible={open}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#222222' }}>{t('solution_results')}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.container}>
        <View style={styles.tabs}>
          {tabOptions.map(({ label, value }, index) => {
            const active = value === activeTab
            return (
              <Pressable
                key={index}
                onPress={() => handleChangeTab(value)}
                style={[styles.tabButton, active && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </Pressable>
            )
          })}
        </View>
        {textbookResult && (
          <View
            style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, gap: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#222222', fontSize: 12, fontWeight: '600' }}>{textbookResult.chapterName}</Text>
          </View>
        )}
        <View style={styles.contentContainer}>{renderBody()}</View>
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
        studentTextbookId={textbookResult?.studentTextbookSessionId}
        handleCreateQuestion={handleCreateQuestion}
        openCreateQuestionDialog={isOpenQuestionDialog}
        onCloseCreateQuestion={handleCloseQuestionDialog}
        questionOptions={questionOptions}
        selectedQuestion={selectedQuestion}
      />
    </SlideDrawerRoot>
  )
}

export default TextbookChapterResultView

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
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: palette.grey[100]
  },
  tabButton: {
    flex: 1,
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
  contentContainer: {
    padding: 20,
    backgroundColor: palette.grey[100],
    paddingBottom: '40@ms'
  }
})
