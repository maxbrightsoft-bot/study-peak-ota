import { Action, ExamResult, NoteResponse, QuestionData, TextbookResult } from "@/utils/types"
import { MouseEvent, RefObject } from "react"

export interface NotesContainerProps{
    isLoading?: boolean
    noteIdContextMenu?: number
    data: NoteResponse[]
    examResultData?: ExamResult
    itemActions: Action<NoteResponse>[]
    listHeight?: number
    containerListProps?: any
    onLoadMore: () => void
    onCloseTooltip: () => void
    onOpenTooltip: (note: NoteResponse) => void
    onItemClick?: (note: NoteResponse) => void
    /** H1: note id -> "#n" for questions with 2+ notes. */
    noteNumbers?: Record<number, number>
}

export interface ExamNoteDialogProps {
    open: boolean
    selectedNote?: NoteResponse | any
    selectedQuestion?: QuestionData
    questionOptions?: any[]
    onClose: () => void
    isLoadingNotes: boolean
    onSaveNote: (content: string, questionId: number) => void
    imageUrl: string
    handleUploadImage?: () => Promise<void>
    handleRemoveImage?: () => void
    handleTakePhoto?: () => Promise<void>
    handlePickFromGallery?: () => Promise<void>
    examResultData?: ExamResult
    readOnly?: boolean
    /** Set when a rejected note is reopened for rewriting: teacher's reason shown above the input. */
    rejectInfo?: { reason: string; reviewerName?: string | null; reviewedAt?: string | null }
    textbookResult?: TextbookResult
    /** H2: the student's notes of the dialog's question (newest first); shown as "Note #n" chips. */
    questionNotes?: NoteResponse[]
    /** Wrong-note deadline passed without late allowance: no "+ Add note", no saving a new note. */
    newNoteLocked?: boolean
    /** After the deadline: the selected note (or a new one) cannot be written, unless it is an open send-back. */
    writeLocked?: boolean
    /** Opened without a question: the select stays usable while a new note is written. */
    questionPickable?: boolean
    onSelectNote?: (note: NoteResponse) => void
    onStartNewNote?: () => void
    onSelectQuestionId?: (questionId: number) => void
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
