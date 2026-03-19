import { MouseEvent, useRef } from "react"
import { useState, useEffect } from "react"
import { DEFAULT_NOTE_FILTER } from "../../ExamResultList/configs/constants"
import { NoteRequest, NoteResponse, NoteSearchQuery } from "../../../utils/types/note"
import { ExamResult, Question, QuestionData } from "../../../utils/types"
import { useTranslation } from "react-i18next"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { apiUploadImageFile } from "@/containers/Chat/apiClient/conversationService"
import useNotes from "./useNotes"
import { createNoteApi, deleteNoteApi, updateNoteApi } from "../../ExamResultList/apiClients/noteService"
import { ExamNoteDialogProps } from "@/containers/IncorrectAnswerNotes/configs/interfaces"
import { pick } from "@react-native-documents/picker"

interface UseExamResultNoteParams {
    questionOptions: any[]
    handleSelectQuestion: (question?: QuestionData) => void
    examCode?: string
    examSessionId?: any
    studentExamSessionId: string
    examResult?: ExamResult
}

const useExamResultNote = ({
    questionOptions,
    handleSelectQuestion,
    examCode,
    examSessionId,
    studentExamSessionId,
    examResult
}: UseExamResultNoteParams) => {
    const { t } = useTranslation()
    const { user, setLoadingWithoutOverlay } = useAuthStore()
    const [notesFilter, setNotesFilter] = useState<NoteSearchQuery>()
    const [selectedNote, setSelectedNote] = useState<NoteResponse>()
    const [openNoteDialog, setOpenNoteDialog] = useState<boolean>(false)
    const [openDeleteNoteDialog, setOpenDeleteNoteDialog] = useState<boolean>(false)
    const [noteIdContextMenu, setNoteIdContextMenu] = useState<number>()
    const [imageUrl, setImageUrl] = useState("")

    const handleUploadImage = async () => {
        try {
            const [result] = await pick({
                mode: 'open',
                allowVirtualFiles: true
            })

            setLoadingWithoutOverlay(true)
            const formData = new FormData();
            formData.append("upload", result as any);
            const res = await apiUploadImageFile(formData);
            setImageUrl(res?.data?.url)
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        setLoadingWithoutOverlay(false);
    }

    const {
        isLoadingNotes,
        handleLoadChange,
        handleLoadMore,
        handleNoteAdded,
        handleNoteUpdated,
        handleNoteRemoved,
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
        setImageUrl("")
    }

    const handleOpenNoteDialog = (e: MouseEvent<HTMLButtonElement>, note: NoteResponse) => {
        setSelectedNote(note)
        setOpenNoteDialog(true)
    }

    const reset = () => {
        handleCloseNoteDialog()
        handleCloseTooltip()
        setOpenDeleteNoteDialog(false)
        handleSelectQuestion(undefined)
        setSelectedNote(undefined)
        setImageUrl('')
    }

    const handleSaveNote = async (content: string, questionId?: number) => {
        try {
            if (content.trim().length === 0) return

            handleLoadChange(true)

            const data: NoteRequest = {
                content,
                imageUrl
            }

            if (selectedNote) {
                const res = await updateNoteApi(selectedNote.id, data)
                handleNoteUpdated(res.data)
            } else {
                data.examSessionId = examSessionId ? examSessionId : examResult?.examSessionId
                data.questionId = questionId
                data.studentExamSessionId = studentExamSessionId
                const res = await createNoteApi(data)
                handleNoteAdded(res.data)
            }

            toast.success(t(!!selectedNote ? "update_note_successfully" : "create_note_successfully"))
            reset()

        } catch (error) {
            console.log({ error });
            toast.error(getErrorMessage(t, error))
        }
        finally {
            handleLoadChange(false)
            handleCloseNoteDialog()
        }
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
        setOpenDeleteNoteDialog(false)
        handleLoadChange(true)
        try {
            await deleteNoteApi(selectedNote.id)
            toast.success(t("delete_note_successfully"))
            handleNoteRemoved(selectedNote)
            reset()
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        finally {
            handleLoadChange(false)
        }
    }

    const handleOpenEditNote = (
        note: NoteResponse
    ) => {
        setSelectedNote(note)
        handleCloseTooltip()
        setOpenNoteDialog(true)
    }

    useEffect(() => {
        if (!user?.id || (!examCode)) {
            setNotesFilter(undefined)
        } else {
            setNotesFilter(
                { ...DEFAULT_NOTE_FILTER, examCode, studentExamSessionId }
            )
        }
    }, [user?.id, examCode])

    const noteDialogProps: ExamNoteDialogProps = {
        open: openNoteDialog,
        questionOptions: questionOptions,
        selectedNote,
        onClose: handleCloseNoteDialog,
        onSaveNote: handleSaveNote,
        imageUrl,
        isLoadingNotes,
        handleUploadImage
    }

    return {
        selectedNote,
        notes,
        noteDialogProps,
        noteIdContextMenu,
        openDeleteNoteDialog,
        handleOpenDeleteNoteDialog,
        setOpenNoteDialog,
        handleLoadMore,
        handleDeleteNote,
        isLoadingNotes,
        handleOpenNoteDialog,
        handleOpenNoteDialogCreateNote,
        handleCloseTooltip,
        handleOpenTooltip,
        handleOpenEditNote,
        handleCloseDeleteDialog
    }
}

export default useExamResultNote
