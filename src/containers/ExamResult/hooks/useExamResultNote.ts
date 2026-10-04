import { MouseEvent, useRef } from "react"
import { Alert } from "react-native"
import { useState, useEffect } from "react"
import { DEFAULT_NOTE_FILTER } from "../../ExamResultList/configs/constants"
import { NoteRequest, NoteResponse, NoteSearchQuery } from "../../../utils/types/note"
import { ExamResult, Question, QuestionData, TextbookResult } from "../../../utils/types"
import { useTranslation } from "react-i18next"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { apiUploadImageFile } from "@/containers/Chat/apiClient/conversationService"
import useNotes from "./useNotes"
import { createNoteApi, deleteNoteApi, updateNoteApi } from "../../ExamResultList/apiClients/noteService"
import { ExamNoteDialogProps } from "@/containers/IncorrectAnswerNotes/configs/interfaces"
import * as ImagePicker from 'expo-image-picker';

interface UseExamResultNoteParams {
    questionOptions: any[]
    handleSelectQuestion: (question?: QuestionData) => void
    examCode?: string
    examSessionId?: any
    studentExamSessionId?: string
    studentTextbookSessionId?: number
    examResult?: ExamResult
    textbookResult?: TextbookResult
}

const useExamResultNote = ({
    questionOptions,
    handleSelectQuestion,
    examCode,
    examSessionId,
    studentExamSessionId,
    studentTextbookSessionId,
    examResult,
    textbookResult
}: UseExamResultNoteParams) => {

    const { t } = useTranslation()
    const user = useAuthStore(state => state.user)
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
                handleNoteUpdated(res.data)
            } else {
                if (studentTextbookSessionId) {
                    data.studentTextbookSessionId = studentTextbookSessionId
                } else {
                    data.examSessionId = examSessionId ? examSessionId : examResult?.examSessionId
                    data.studentExamSessionId = studentExamSessionId
                }
                data.questionId = questionId
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
                setNotesFilter(
                    { ...DEFAULT_NOTE_FILTER, examCode, studentExamSessionId }
                )
            }
        }
    }, [user?.id, examCode, studentTextbookSessionId])

    const noteDialogProps: ExamNoteDialogProps = {
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
