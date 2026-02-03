import { Action, NoteResponse, QuestionData } from "@/utils/types"
import { MouseEvent, RefObject } from "react"

export interface NotesContainerProps{
    isLoading?: boolean
    noteIdContextMenu?: number
    data: NoteResponse[]
    itemActions: Action<NoteResponse>[]
    listHeight?: number
    containerListProps?: any
    onLoadMore: () => void
    onCloseTooltip: () => void
    onOpenTooltip: (note: NoteResponse) => void
    onItemClick?: (note: NoteResponse) => void
}

export interface ExamNoteDialogProps {
    open: boolean
    selectedNote?: NoteResponse
    selectedQuestion?: QuestionData
    questionOptions?: any[]
    onClose: () => void
    isLoadingNotes: boolean
    onSaveNote: (content: string, questionId: number) => void
    imageUrl: string
    handleUploadImage: () => Promise<void>
}

export interface ClassNoteDialogProps {
    id?: string
    open: boolean
    tip?: string
    studentName?: string
    selectedNote?: NoteResponse
    value?: string
    onClose: () => void
    onSaveNote: (content: string) => void
}
