import { MouseEvent, useCallback, useMemo, useRef } from "react"
import { Alert } from "react-native"
import { useState, useEffect } from "react"
import { DEFAULT_NOTE_FILTER } from "../../ExamResultList/configs/constants"
import { NoteRequest, NoteResponse, NoteReviewStatus, NoteSearchQuery } from "../../../utils/types/note"
import { NoteSortColumn, OrderBy } from "@/utils/enums"
import { getQuestionNoteNumbers, getQuestionNotes, pickActionableNote, sortNotesByNumberDesc } from "@/utils/helpers/noteOrder"
import { isNewNoteLocked, isNoteWriteLocked } from "../configs/noteDialog"
import { ExamResult, Question, QuestionData, TextbookResult } from "../../../utils/types"
import { useTranslation } from "react-i18next"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { apiUploadImageFile } from "@/containers/Chat/apiClient/conversationService"
import useNotes from "./useNotes"
import { createNoteApi, deleteNoteApi, getNotesApi, updateNoteApi } from "../../ExamResultList/apiClients/noteService"
import { ExamNoteDialogProps } from "@/containers/IncorrectAnswerNotes/configs/interfaces"
import * as ImagePicker from 'expo-image-picker';

interface UseExamResultNoteParams {
    questionOptions: any[]
    handleSelectQuestion: (question?: QuestionData) => void
    /** The question the note dialog is for (H2: its notes are listed as chips). */
    selectedQuestion?: QuestionData
    examCode?: string
    examSessionId?: any
    studentExamSessionId?: string
    studentTextbookSessionId?: number
    examResult?: ExamResult
    textbookResult?: TextbookResult
    wrongNoteQuestionSuperId?: number
    wrongNoteNoteId?: number
    wrongNoteReadOnly?: boolean
    wrongNoteRejectReason?: string
    wrongNoteReviewerName?: string
    wrongNoteReviewedAt?: string
    onWrongNoteConsumed?: () => void
}

const STUDENT_EXAM_NOTE_PAGE_SIZE = 100

const useExamResultNote = ({
    questionOptions,
    handleSelectQuestion,
    selectedQuestion,
    examCode,
    examSessionId,
    studentExamSessionId,
    studentTextbookSessionId,
    examResult,
    textbookResult,
    wrongNoteQuestionSuperId,
    wrongNoteNoteId,
    wrongNoteReadOnly,
    wrongNoteRejectReason,
    wrongNoteReviewerName,
    wrongNoteReviewedAt,
    onWrongNoteConsumed
}: UseExamResultNoteParams) => {

    const { t } = useTranslation()
    const user = useAuthStore(state => state.user)
    const isStudent = !!user?.roles?.includes('Student')
    const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
    const [notesFilter, setNotesFilter] = useState<NoteSearchQuery>()
    const [selectedNote, setSelectedNote] = useState<NoteResponse>()
    const [openNoteDialog, setOpenNoteDialog] = useState<boolean>(false)
    const [openDeleteNoteDialog, setOpenDeleteNoteDialog] = useState<boolean>(false)
    const [noteIdContextMenu, setNoteIdContextMenu] = useState<number>()
    const [imageUrl, setImageUrl] = useState("")
    const uploadedUrlRef = useRef("")
    const uploadPromiseRef = useRef<Promise<any> | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    // My Wrong Note hand-over: read-only view, reject reason box, one-shot guard.
    const [noteReadOnly, setNoteReadOnly] = useState(false)
    const [rejectInfo, setRejectInfo] = useState<ExamNoteDialogProps["rejectInfo"]>()
    const wrongNoteKeyRef = useRef<string | undefined>(undefined)
    const unmountedRef = useRef(false)

    const uploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
        // Immediately show the image preview so user sees the photo right away
        setImageUrl(asset.uri);
        uploadedUrlRef.current = '';
        setIsUploadingImage(true);
        setLoadingWithoutOverlay(true);
        const promise = (async () => {
            try {
                let fileName = asset.fileName;
                if (!fileName || !fileName.includes('.')) {
                    const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
                    fileName = `photo_${Date.now()}.${ext}`;
                }
                const mimeType = asset.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');

                const formData = new FormData();
                formData.append("upload", {
                    uri: asset.uri,
                    type: mimeType,
                    name: fileName,
                } as any);

                const res = await apiUploadImageFile(formData);
                const serverUrl = res?.data?.url || res?.data?.Url || (typeof res?.data === 'string' ? res.data : '') || (res as any)?.url;
                if (serverUrl) {
                    uploadedUrlRef.current = serverUrl;
                }
            } catch (error) {
                console.log("Image upload error:", error);
                toast.error(getErrorMessage(t, error));
            } finally {
                setIsUploadingImage(false);
                setLoadingWithoutOverlay(false);
            }
        })();
        uploadPromiseRef.current = promise;
        await promise;
    };

    const handlePickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.6,
            });

            if (!result.canceled && result.assets?.length) {
                await uploadAsset(result.assets[0]);
            }
        } catch (error) {
            console.log("[PickGallery] Error:", error);
            toast.error(getErrorMessage(t, error));
        }
    };

    const handleTakePhoto = async () => {
        try {
            const currentPerm = await ImagePicker.getCameraPermissionsAsync();
            let isGranted = currentPerm.granted;
            if (!isGranted) {
                const requested = await ImagePicker.requestCameraPermissionsAsync();
                isGranted = requested.granted;
            }

            if (!isGranted) {
                toast.error(t('camera_permission_required') || '카메라 권한이 필요합니다');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.6,
            });

            let asset = (!result.canceled && result.assets?.length) ? result.assets[0] : null;

            if (!asset) {
                const pending = await ImagePicker.getPendingResultAsync();
                if (pending && 'assets' in pending && pending.assets?.length && !pending.canceled) {
                    asset = pending.assets[0];
                }
            }

            if (asset) {
                await uploadAsset(asset);
            }
        } catch (error) {
            console.log("[TakePhoto] Error:", error);
            toast.error(getErrorMessage(t, error));
        }
    };

    const handleUploadImage = async () => {
        Alert.alert(
            t('attach_photo') || '사진 첨부',
            '',
            [
                {
                    text: t('take_photo') || '카메라로 촬영',
                    onPress: handleTakePhoto,
                },
                {
                    text: t('choose_from_gallery') || '앨범에서 선택',
                    onPress: handlePickFromGallery,
                },
                {
                    text: t('cancel') || '취소',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleRemoveImage = () => {
        setImageUrl("");
        uploadedUrlRef.current = "";
        uploadPromiseRef.current = null;
        if (selectedNote) {
            setSelectedNote({ ...selectedNote, imageUrl: '' });
        }
    };

    const {
        isLoadingNotes,
        handleLoadChange,
        handleLoadMore,
        handleNoteAdded,
        handleNoteUpdated,
        handleNoteRemoved,
        notes
    } = useNotes(setNotesFilter, notesFilter)

    // H1: "#n" for every note whose question has 2+ notes (web noteNumbers).
    const noteNumbers = useMemo(() => getQuestionNoteNumbers(notes, isStudent), [notes, isStudent])

    // H2: the dialog lists the notes of its question (newest first) with "+ Add note", like web.
    // They come from GET api/notes?questionId=… for the attempt; the loaded list is the fallback meanwhile.
    const isStudentExamNote = isStudent && !studentTextbookSessionId
    const dialogSessionId = studentExamSessionId || (examResult?.studentExamSessionId ? String(examResult.studentExamSessionId) : '')
    const activeQuestionId = selectedQuestion?.id ?? selectedNote?.questionId
    const [dialogNotes, setDialogNotes] = useState<{ questionId: number; items: NoteResponse[] }>()
    const dialogNotesReqRef = useRef(0)
    const questionNotes = useMemo(() => {
        if (!isStudentExamNote || !activeQuestionId) return []
        return dialogNotes && dialogNotes.questionId === activeQuestionId
            ? dialogNotes.items
            : sortNotesByNumberDesc(getQuestionNotes(notes, activeQuestionId, isStudent))
    }, [isStudentExamNote, activeQuestionId, dialogNotes, notes, isStudent])
    // Generic entry (My answers "Note"): preselect the question's actionable note once its notes are known (web).
    const pendingAutoPickRef = useRef<number | undefined>(undefined)
    // Opened without a question ("Write a note"): the question select stays usable for a new note (RV-303).
    const [isQuestionPickable, setQuestionPickable] = useState(false)
    // Teacher name of a Rewrite hand-over, kept for that note when switching chips (RV-305).
    const handoverReviewerRef = useRef<{ noteId: number; reviewerName?: string } | undefined>(undefined)

    useEffect(() => {
        if (!openNoteDialog || !isStudentExamNote || !dialogSessionId || !activeQuestionId) return
        const reqId = ++dialogNotesReqRef.current
        const questionId = activeQuestionId
        const load = async () => {
            try {
                const res = await getNotesApi({
                    studentExamSessionId: dialogSessionId,
                    questionId,
                    IsOwned: true,
                    currentPage: 1,
                    pageSize: 50,
                    sortColumnName: NoteSortColumn.CreatedAt,
                    sortColumnDirection: OrderBy.DESC
                })
                if (reqId !== dialogNotesReqRef.current) return
                const items = sortNotesByNumberDesc((res.data?.items as NoteResponse[] | undefined) ?? [])
                setDialogNotes({ questionId, items })
                if (pendingAutoPickRef.current === questionId) {
                    pendingAutoPickRef.current = undefined
                    applyNoteRef.current(pickActionableNote(items))
                }
            } catch (error) {
                if (reqId !== dialogNotesReqRef.current) return
                toast.error(getErrorMessage(t, error))
            }
        }
        load()
    }, [openNoteDialog, isStudentExamNote, dialogSessionId, activeQuestionId, t])

    const findQuestion = useCallback(
        (questionId?: number) =>
            questionId ? examResult?.questions?.find(q => q.id === questionId) : undefined,
        [examResult?.questions]
    )

    // Chips always open a note for editing (the read-only flag is only set by a read-only hand-over).
    const applyNoteToDialog = (note?: NoteResponse) => {
        setSelectedNote(note)
        setNoteReadOnly(false)
        const handover = handoverReviewerRef.current
        setRejectInfo(
            note?.reviewStatus === NoteReviewStatus.Rejected && note.rejectReason
                ? {
                      reason: note.rejectReason,
                      reviewedAt: note.reviewedAt,
                      reviewerName: handover?.noteId === note.id ? handover.reviewerName : undefined
                  }
                : undefined
        )
        setImageUrl(note?.imageUrl || "")
        uploadedUrlRef.current = note?.imageUrl || ""
        uploadPromiseRef.current = null
    }
    const applyNoteRef = useRef(applyNoteToDialog)
    applyNoteRef.current = applyNoteToDialog

    const handleSelectNoteInDialog = (note: NoteResponse) => {
        pendingAutoPickRef.current = undefined
        applyNoteToDialog(note)
    }

    // "+ Add note": keep the question, start an empty note (saving always creates a new one).
    const handleStartNewNoteInDialog = () => {
        pendingAutoPickRef.current = undefined
        if (!selectedQuestion && selectedNote?.questionId) {
            const match = findQuestion(selectedNote.questionId)
            if (match) handleSelectQuestion(match)
            else if (selectedNote.questionOrder !== undefined)
                handleSelectQuestion({
                    id: selectedNote.questionId,
                    questionOrder: selectedNote.questionOrder,
                    parentQuestionId: selectedNote.parentQuestionId,
                    parentQuestionOrder: selectedNote.parentQuestionOrder
                })
        }
        applyNoteToDialog(undefined)
    }

    // Question picked in the dialog's select: show that question's notes; the new note and its typed text stay (RV-303).
    const handleSelectQuestionIdInDialog = (questionId: number) => {
        const match = findQuestion(questionId)
        if (match) handleSelectQuestion(match)
    }

    // Explicit new note (wrong-note "Add note" / "Write" hand-over, Incorrect Answer Notes "Write a note").
    const handleOpenNoteDialogCreateNote = (question?: Question) => {
        pendingAutoPickRef.current = undefined
        setQuestionPickable(!question)
        question && handleSelectQuestion(question)
        handleCloseTooltip()
        setOpenNoteDialog(true)
    }

    // Generic entry for a question (My answers "Note"): like web, preselect its rejected note, else the latest;
    // "+ Add note" starts a new one. Uses the loaded list now and the per-question fetch once it returns.
    const handleOpenNoteDialogForQuestion = (question: Question) => {
        handleSelectQuestion(question)
        setQuestionPickable(false)
        const actionable = isStudentExamNote
            ? pickActionableNote(getQuestionNotes(notes, question.id, isStudent))
            : undefined
        pendingAutoPickRef.current = isStudentExamNote ? question.id : undefined
        applyNoteToDialog(actionable)
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
        dialogNotesReqRef.current += 1
        pendingAutoPickRef.current = undefined
        handoverReviewerRef.current = undefined
        setQuestionPickable(false)
        setDialogNotes(undefined)
        setSelectedNote(undefined)
        setOpenNoteDialog(false)
        setNoteReadOnly(false)
        setRejectInfo(undefined)
        handleSelectQuestion(undefined)
        setImageUrl("")
        uploadedUrlRef.current = ""
        uploadPromiseRef.current = null
    }

    const handleOpenNoteDialog = (e: MouseEvent<HTMLButtonElement>, note: NoteResponse) => {
        setSelectedNote(note)
        setImageUrl(note?.imageUrl || "")
        uploadedUrlRef.current = note?.imageUrl || ""
        uploadPromiseRef.current = null
        setOpenNoteDialog(true)
    }

    const reset = () => {
        handleCloseNoteDialog()
        handleCloseTooltip()
        setOpenDeleteNoteDialog(false)
        handleSelectQuestion(undefined)
        setSelectedNote(undefined)
        setImageUrl('')
        uploadedUrlRef.current = ''
        uploadPromiseRef.current = null
    }

    const handleSaveNote = async (content: string, questionId?: number) => {
        try {
            if (content.trim().length === 0) return

            handleLoadChange(true)

            if (uploadPromiseRef.current) {
                await uploadPromiseRef.current
            }

            const finalImageUrl = uploadedUrlRef.current || (imageUrl && !imageUrl.startsWith('file://') && !imageUrl.startsWith('content://') ? imageUrl : '')

            const data: NoteRequest = {
                content,
                imageUrl: finalImageUrl || undefined
            }

            if (selectedNote) {
                const res = await updateNoteApi(selectedNote.id, data)
                // Keep fields the update response may omit (question order, #n).
                handleNoteUpdated({ ...selectedNote, ...res.data })
            } else {
                if (studentTextbookSessionId) {
                    data.studentTextbookSessionId = studentTextbookSessionId
                } else {
                    data.examSessionId = examSessionId ? examSessionId : examResult?.examSessionId
                    data.studentExamSessionId = studentExamSessionId
                    // H2: always a new note (#2, #3…). Without it the server appends to the question's first note.
                    data.asNewNote = true
                }
                // The selected question's id already equals the question super id.
                data.questionId = questionId
                const res = await createNoteApi(data)
                const target = findQuestion(questionId)
                handleNoteAdded({
                    questionId,
                    questionOrder: target?.questionOrder,
                    parentQuestionId: target?.parentQuestionId,
                    parentQuestionOrder: target?.parentQuestionOrder,
                    questionGroupIndex: target?.questionGroupIndex,
                    categoryName: target?.category?.name,
                    isStudentNote: isStudent,
                    isOwned: true,
                    reviewStatus: NoteReviewStatus.Pending,
                    ...res.data
                })
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
        setImageUrl(note.imageUrl || '')
        uploadedUrlRef.current = note.imageUrl || ''
        handleCloseTooltip()
        setOpenNoteDialog(true)
    }

    useEffect(() => {
        if (!user?.id || (!examCode && !studentTextbookSessionId)) {
            setNotesFilter(undefined)
        } else {
            if (studentTextbookSessionId) {
                setNotesFilter(
                    { ...DEFAULT_NOTE_FILTER, studentTextbookSessionId }
                )
            } else {
                // H1: a student's notes of one attempt in one page (web: 100), so every question's #n is complete.
                setNotesFilter(
                    {
                        ...DEFAULT_NOTE_FILTER,
                        ...(isStudent ? { pageSize: STUDENT_EXAM_NOTE_PAGE_SIZE } : {}),
                        examCode,
                        studentExamSessionId
                    }
                )
            }
        }
        // G4: another attempt of the same exam is another filter.
    }, [user?.id, isStudent, examCode, studentExamSessionId, studentTextbookSessionId])

    // One-shot per navigation: open the editor on the question handed over by My Wrong Note.
    useEffect(() => {
        unmountedRef.current = false
        return () => {
            unmountedRef.current = true
        }
    }, [])

    // Latest handlers for the one-shot effect below (it must fire only on its own deps).
    const handoverRef = useRef({ t, handleOpenNoteDialogCreateNote, handleOpenEditNote, onWrongNoteConsumed })
    handoverRef.current = { t, handleOpenNoteDialogCreateNote, handleOpenEditNote, onWrongNoteConsumed }
    // Reject box params, read when the effect fires (the screen clears them right after).
    const rejectParamsRef = useRef({ wrongNoteRejectReason, wrongNoteReviewerName, wrongNoteReviewedAt })
    rejectParamsRef.current = { wrongNoteRejectReason, wrongNoteReviewerName, wrongNoteReviewedAt }

    useEffect(() => {
        if (!wrongNoteQuestionSuperId) {
            wrongNoteKeyRef.current = undefined
            return
        }
        if (!examResult?.questions) return
        // Ignore a stale result still held from another exam/attempt while the new one loads.
        if (studentExamSessionId != null && examResult.studentExamSessionId != null) {
            if (Number(examResult.studentExamSessionId) !== Number(studentExamSessionId)) return
        } else if (examSessionId != null && Number(examResult.examSessionId) !== Number(examSessionId)) {
            return
        }
        const key = [wrongNoteQuestionSuperId, wrongNoteNoteId, wrongNoteReadOnly, studentExamSessionId, examCode].join(':')
        if (wrongNoteKeyRef.current === key) return
        wrongNoteKeyRef.current = key

        const superId = wrongNoteQuestionSuperId
        const noteId = wrongNoteNoteId
        const readOnly = !!wrongNoteReadOnly
        const sessionId = studentExamSessionId ?? examResult.studentExamSessionId
        // The question id in the result already equals the question super id.
        const question = examResult.questions.find(q => q.id === superId)
        const { t, handleOpenNoteDialogCreateNote, handleOpenEditNote, onWrongNoteConsumed } = handoverRef.current
        const { wrongNoteRejectReason: rejectReason, wrongNoteReviewerName: reviewerName, wrongNoteReviewedAt: reviewedAt } = rejectParamsRef.current
        onWrongNoteConsumed?.()

        const openCreate = () => {
            handleOpenNoteDialogCreateNote(question)
        }
        const run = async () => {
            if (!question) {
                toast.error(t("mywrongnote_note_not_found"))
                return
            }
            if (noteId) {
                let found: NoteResponse | undefined
                try {
                    const res = await getNotesApi({
                        ...DEFAULT_NOTE_FILTER,
                        studentExamSessionId: sessionId,
                        questionId: superId,
                        IsOwned: true,
                        pageSize: 50
                    } as NoteSearchQuery)
                    found = (res.data?.items as NoteResponse[] | undefined)?.find(n => n.id === noteId)
                } catch (error) {
                    toast.error(getErrorMessage(t, error))
                    return
                }
                if (unmountedRef.current) return
                if (found) {
                    handoverReviewerRef.current = reviewerName ? { noteId: found.id, reviewerName } : undefined
                    setNoteReadOnly(readOnly)
                    setRejectInfo(rejectReason ? { reason: rejectReason, reviewerName, reviewedAt } : undefined)
                    handleOpenEditNote(found)
                    return
                }
                // A note was requested but is gone: never fall through to creating a new one.
                toast.error(t("mywrongnote_note_not_found"))
                return
            }
            if (readOnly) {
                toast.error(t("mywrongnote_note_not_found"))
                return
            }
            openCreate()
        }
        run()
    }, [wrongNoteQuestionSuperId, wrongNoteNoteId, wrongNoteReadOnly, examResult, studentExamSessionId, examSessionId, examCode])

    const noteDialogProps: ExamNoteDialogProps = {
        readOnly: noteReadOnly,
        rejectInfo,
        questionNotes,
        newNoteLocked: isStudentExamNote && isNewNoteLocked(examResult?.wrongNoteDeadline, examResult?.wrongNoteLateAllowed),
        // RV-306: after the deadline only an open send-back stays writable (web isWriteLocked).
        writeLocked:
            isStudentExamNote &&
            isNoteWriteLocked(examResult?.wrongNoteDeadline, examResult?.wrongNoteLateAllowed, selectedNote),
        questionPickable: isQuestionPickable,
        onSelectNote: handleSelectNoteInDialog,
        onStartNewNote: isStudentExamNote ? handleStartNewNoteInDialog : undefined,
        onSelectQuestionId: isStudentExamNote ? handleSelectQuestionIdInDialog : undefined,
        open: openNoteDialog,
        questionOptions: questionOptions,
        selectedNote,
        onClose: handleCloseNoteDialog,
        onSaveNote: handleSaveNote,
        imageUrl,
        isLoadingNotes: isLoadingNotes || isUploadingImage,
        handleUploadImage: handleUploadImage as any,
        handleRemoveImage,
        handleTakePhoto,
        handlePickFromGallery
    }

    return {
        selectedNote,
        notes,
        noteNumbers,
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
        handleOpenNoteDialogForQuestion,
        handleCloseTooltip,
        handleOpenTooltip,
        handleOpenEditNote,
        handleCloseDeleteDialog
    }
}

export default useExamResultNote
