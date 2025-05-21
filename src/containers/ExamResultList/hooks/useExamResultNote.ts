import { ExamResult, NoteRequest, NoteResponse, NoteSearchQuery, Question, QuestionData } from "@/utils/types"
import { MouseEvent } from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import useNotes from "./useNotes"
import useAuthStore from "@/store/useAuthStore"
import { createNoteApi, deleteNoteApi, updateNoteApi } from "../apiClients/noteService"
import { getErrorMessage, toast } from "@/utils/helpers"
import { ExamNoteDialogProps } from "@/containers/IncorrectAnswerNotes/configs/interfaces"
import { DEFAULT_NOTE_FILTER } from "../configs/constants"

const useExamResultNote = (
    questionOptions: any[],
    examStatusView: number,
    examSessionId: number,
    handleSelectQuestion: (question?: QuestionData) => void,
    examCode?: string,
    examResult?: ExamResult
) => {
    const { t } = useTranslation()
    const { user, setLoading } = useAuthStore()
    const [notesFilter, setNotesFilter] = useState<NoteSearchQuery>()
    const [selectedNote, setSelectedNote] = useState<NoteResponse>()
    const [openNoteDialog, setOpenNoteDialog] = useState<boolean>(false)
    const [openDeleteNoteDialog, setOpenDeleteNoteDialog] = useState<boolean>(false)
    const [noteIdContextMenu, setNoteIdContextMenu] = useState<number>()

    const {
        handleLoadMore,
        handleNoteAdded,
        handleNoteUpdated,
        handleNoteRemoved,
        isLoadingNotes,
        notes
    } = useNotes(setNotesFilter, notesFilter)

    const handleOpenNoteDialogCreateNote = (question?: Question) => {
        question && handleSelectQuestion(question)
        handleCloseTooltip()
        setOpenNoteDialog(true)
    }

    const handleCloseTooltip = () => {
        setNoteIdContextMenu(0)
    }

    const handleOpenTooltip = (note: NoteResponse) => {
        setNoteIdContextMenu(note.id)
    }
    const handleCloseNoteDialog = () => {
        setSelectedNote(undefined)
        setOpenNoteDialog(false)
        handleSelectQuestion(undefined)
    }

    const handleOpenNoteDialog = (e: MouseEvent<HTMLButtonElement>, note: NoteResponse) => {
        e.stopPropagation()
        setSelectedNote(note)
        setOpenNoteDialog(true)
    }

    const reset = () => {
        handleCloseNoteDialog()
        handleCloseTooltip()
        setOpenDeleteNoteDialog(false)
        handleSelectQuestion(undefined)
        setSelectedNote(undefined)
    }

    const handleSaveNote = async (content: string, questionId?: number) => {
        setLoading(true)
        try {
            if (content.trim().length === 0) return
            const data: NoteRequest = {
                content
            }
            if (selectedNote) {
                const res = await updateNoteApi(selectedNote.id, data.content)
                handleNoteUpdated(res.data)
                toast.success(t("update_note_successfully"))
            } else {
                data.examSessionId = examSessionId ? examSessionId : examResult?.examSessionId
                data.questionId = questionId
                const res = await createNoteApi(data)
                handleNoteAdded(res.data)
                toast.success(t("create_note_successfully"))
            }
            reset()
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        setLoading(false)
    }

    const handleCloseDeleteDialog = () => {
        setOpenDeleteNoteDialog(false)
        setSelectedNote(undefined)
    }

    const handleOpenDeleteNoteDialog = (
        note: NoteResponse
    ) => {
        setSelectedNote(note)
        handleCloseTooltip()
        setOpenDeleteNoteDialog(true)
    }
    const handleDeleteNote = async () => {
        if (!selectedNote?.id) return
        setLoading(true)
        try {
            await deleteNoteApi(selectedNote.id)
            toast.success(t("delete_note_successfully"))
            handleNoteRemoved(selectedNote)
            reset()
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        setLoading(false)
    }

    const handleOpenEditNote = (
        note: NoteResponse
    ) => {
        setSelectedNote(note)
        handleCloseTooltip()
        setOpenNoteDialog(true)
    }
    useEffect(() => {
        if (!user?.id || (!examCode && (!examSessionId)) || examStatusView !== 3) {
            setNotesFilter(undefined)
        } else {
            setNotesFilter({ ...DEFAULT_NOTE_FILTER, examCode }
            )
        }
    }, [user?.id, examCode, examSessionId, examStatusView])

    const noteDialogProps: ExamNoteDialogProps = {
        open: openNoteDialog,
        questionOptions: questionOptions,
        selectedNote,
        onClose: handleCloseNoteDialog,
        onSaveNote: handleSaveNote
    }

    return {
        selectedNote,
        notes,
        noteDialogProps,
        noteIdContextMenu,
        isLoadingNotes,
        openDeleteNoteDialog,
        handleOpenDeleteNoteDialog,
        setOpenNoteDialog,
        handleLoadMore,
        handleDeleteNote,
        handleOpenNoteDialog,
        handleOpenNoteDialogCreateNote,
        handleCloseTooltip,
        handleOpenTooltip,
        handleOpenEditNote,
        handleCloseDeleteDialog
    }
}

export default useExamResultNote
