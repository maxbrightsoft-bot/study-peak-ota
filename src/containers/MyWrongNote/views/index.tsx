import React, { useCallback, useEffect, useRef, useState } from "react"
import { BackHandler, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { palette } from "@/theme"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import CreateNewQuestionDialog from "@/containers/ExamResult/components/CreateNewQuestionDialog"
import NoteDrawer from "@/containers/IncorrectAnswerNotes/components/NoteDrawer"
import { createConversationApi } from "@/containers/ExamResultList/apiClients"
import { getExamThreadApi } from "../apiClients"
import { navigate } from "@/navigators/NavigationHelpers"
import { Routes } from "@/navigators/RouteName"
import useMyWrongNoteList from "../hooks/useMyWrongNoteList"
import { MyExamFilter } from "../configs/enums"
import MyWrongNoteListView from "./MyWrongNoteListView"
import MyWrongNoteDetailView from "./MyWrongNoteDetailView"
import MyWrongNoteConfirmEditDialog from "../components/MyWrongNoteConfirmEditDialog"
import MyWrongNoteAppBar from "../components/MyWrongNoteAppBar"
import { MyNoteAction } from "../configs/helpers"
import {
    MyExamItemResponse,
    MyNoteResponse,
    MyQuestionResponse
} from "../configs/types"

type Props = {
    initialExamSessionId?: number
    initialStudentExamSessionId?: number
    initialQuestionSuperId?: number
    /** Nonce set by entry points so repeated identical navigations re-apply. */
    deepLinkKey?: number
}

type PendingEdit = {
    q: MyQuestionResponse
    note?: MyNoteResponse
    exam: MyExamItemResponse
}

type AskTarget = {
    q: MyQuestionResponse
    examSessionId: number
    studentExamSessionId?: number
}

type Selected = {
    examSessionId: number
    studentExamSessionId?: number
    questionSuperId?: number
}

const MyWrongNote = ({
    initialExamSessionId,
    initialStudentExamSessionId,
    initialQuestionSuperId,
    deepLinkKey
}: Props) => {
    const { t } = useTranslation()
    const list = useMyWrongNoteList()
    const { setFilter, refresh } = list
    const [selected, setSelected] = useState<Selected | undefined>()
    const [pendingEdit, setPendingEdit] = useState<PendingEdit | undefined>()
    const [askTarget, setAskTarget] = useState<AskTarget | undefined>()
    // G1: the note shown read-only in the drawer (web: NoteDrawer by note id).
    const [viewNoteId, setViewNoteId] = useState<number | undefined>()

    // Deep link (bell / result): show the exam; re-applies when route params change.
    useEffect(() => {
        if (initialExamSessionId === undefined) {
            // Keyed navigation without an exam (home card) = go to the list, keep the filter.
            if (deepLinkKey !== undefined) {
                setSelected(undefined)
                setPendingEdit(undefined)
                setAskTarget(undefined)
                setViewNoteId(undefined)
            }
            return
        }
        setViewNoteId(undefined)
        setFilter(MyExamFilter.All)
        setSelected({
            examSessionId: initialExamSessionId,
            studentExamSessionId: initialStudentExamSessionId,
            questionSuperId: initialQuestionSuperId
        })
    }, [
        initialExamSessionId,
        initialStudentExamSessionId,
        initialQuestionSuperId,
        deepLinkKey,
        setFilter
    ])

    // Refresh whenever the screen regains focus (the first focus is the initial load).
    const refreshRef = useRef(refresh)
    refreshRef.current = refresh
    const firstFocusRef = useRef(true)
    useFocusEffect(
        useCallback(() => {
            if (firstFocusRef.current) {
                firstFocusRef.current = false
                return
            }
            refreshRef.current({ silent: true })
        }, [])
    )

    // Counts may have changed in the detail: refresh when returning to the list.
    const hadSelectionRef = useRef(false)
    useEffect(() => {
        if (selected) hadSelectionRef.current = true
        else if (hadSelectionRef.current) {
            hadSelectionRef.current = false
            refreshRef.current({ silent: true })
        }
    }, [selected])

    const handleOpenExam = useCallback(
        (examSessionId: number, studentExamSessionId?: number) =>
            setSelected({ examSessionId, studentExamSessionId }),
        []
    )

    const handleBack = useCallback(() => {
        setViewNoteId(undefined)
        setSelected(undefined)
    }, [])

    const handleView = useCallback(
        (note?: MyNoteResponse) => {
            if (!note) {
                toast.error(t("mywrongnote_note_not_found"))
                return
            }
            setViewNoteId(note.noteId)
        },
        [t]
    )
    const handleCloseView = useCallback(() => setViewNoteId(undefined), [])

    // The drawer is a Portal overlay: close it when this tab loses focus so it never covers another screen.
    useFocusEffect(
        useCallback(() => () => setViewNoteId(undefined), [])
    )

    // The hub never edits a note: hand over to the existing exam-result editor (View stays on this screen).
    const openEditor = useCallback(
        (
            q: MyQuestionResponse,
            note: MyNoteResponse | undefined,
            exam: MyExamItemResponse,
            rewrite = false
        ) => {
            // A rejected note reopened for rewriting shows the teacher's reason above the input.
            const rejected = rewrite ? (note ?? q) : undefined
            navigate(Routes.Auth.ExamResult, {
                examCode: exam.examCode,
                examSessionId: exam.examSessionId,
                studentExamSessionId: exam.studentExamSessionId,
                wrongNoteQuestionSuperId: q.questionSuperId,
                wrongNoteNoteId: note?.noteId,
                wrongNoteRejectReason: rejected?.rejectReason || undefined,
                wrongNoteReviewerName: rejected?.reviewerName || undefined,
                wrongNoteReviewedAt: rejected?.reviewedAt || undefined,
                returnTo: Routes.Auth.MyWrongNote,
                returnParams: {
                    examSessionId: exam.examSessionId,
                    studentExamSessionId: exam.studentExamSessionId,
                    questionSuperId: q.questionSuperId
                }
            })
        },
        []
    )

    const handleWrite = useCallback(
        (
            q: MyQuestionResponse,
            note?: MyNoteResponse,
            action?: MyNoteAction,
            exam?: MyExamItemResponse
        ) => {
            if (!exam) return
            if (!exam.examCode) {
                toast.error(t("mywrongnote_not_found"))
                return
            }
            if (action === "confirmEdit") {
                setPendingEdit({ q, note, exam })
                return
            }
            openEditor(q, note, exam, action === "rewrite")
        },
        [openEditor, t]
    )

    const handleCancelEdit = useCallback(() => setPendingEdit(undefined), [])
    const handleConfirmEdit = useCallback(() => {
        if (pendingEdit) {
            openEditor(pendingEdit.q, pendingEdit.note, pendingEdit.exam)
        }
        setPendingEdit(undefined)
    }, [pendingEdit, openEditor])

    // Ask the teacher: open the existing thread, or create one via the dialog.
    const setLoadingWithoutOverlay = useAuthStore(
        state => state.setLoadingWithoutOverlay
    )
    const askBusyRef = useRef(false)

    const handleAsk = useCallback(
        async (q: MyQuestionResponse, exam?: MyExamItemResponse) => {
            // Use the loaded detail's attempt, not the (possibly absent) selection.
            if (askBusyRef.current || !exam) return
            askBusyRef.current = true
            try {
                const { data } = await getExamThreadApi(
                    exam.studentExamSessionId,
                    q.questionSuperId
                )
                if (data.conversationId) {
                    navigate(Routes.Auth.Question, {
                        conversationId: data.conversationId
                    })
                } else {
                    setAskTarget({
                        q,
                        examSessionId: exam.examSessionId,
                        studentExamSessionId: exam.studentExamSessionId
                    })
                }
            } catch (e) {
                toast.error(getErrorMessage(t, e))
            } finally {
                askBusyRef.current = false
            }
        },
        [t]
    )

    const handleCloseAsk = useCallback(() => setAskTarget(undefined), [])
    const handleCreateAsk = useCallback(
        async ({
            content,
            questionId
        }: {
            content: string
            questionId: number
        }) => {
            if (!askTarget || askBusyRef.current) return
            askBusyRef.current = true
            setLoadingWithoutOverlay(true)
            try {
                await createConversationApi({
                    examSessionId: askTarget.examSessionId,
                    studentExamSessionId: askTarget.studentExamSessionId,
                    content,
                    questionId
                })
                toast.success(t("conversation_created_success"))
                setAskTarget(undefined)
            } catch (e) {
                toast.error(getErrorMessage(t, e))
            } finally {
                setLoadingWithoutOverlay(false)
                askBusyRef.current = false
            }
        },
        [askTarget, t, setLoadingWithoutOverlay]
    )

    // Android hardware back closes the note drawer first, then returns from the detail to the list.
    // Only while this tab is focused and a detail is shown. (The drawer's own handler is registered
    // later and normally runs first; the ref check keeps the order right either way.)
    const hasSelection = !!selected
    const viewNoteIdRef = useRef(viewNoteId)
    viewNoteIdRef.current = viewNoteId
    useFocusEffect(
        useCallback(() => {
            if (!hasSelection) return undefined
            const sub = BackHandler.addEventListener(
                "hardwareBackPress",
                () => {
                    if (viewNoteIdRef.current !== undefined) {
                        setViewNoteId(undefined)
                        return true
                    }
                    handleBack()
                    return true
                }
            )
            return () => sub.remove()
        }, [hasSelection, handleBack])
    )

    return (
        <View style={styles.container}>
            <MyWrongNoteAppBar
                title={t("mywrongnote_title")}
                onBack={selected ? handleBack : () => navigate(Routes.Auth.Home)}
            />
            {selected ? (
                <MyWrongNoteDetailView
                    key={`${selected.examSessionId}-${selected.studentExamSessionId ?? ""}`}
                    examSessionId={selected.examSessionId}
                    studentExamSessionId={selected.studentExamSessionId}
                    initialQuestionSuperId={selected.questionSuperId}
                    onBack={handleBack}
                    onWrite={handleWrite}
                    onView={handleView}
                    onAsk={handleAsk}
                />
            ) : (
                <MyWrongNoteListView list={list} onOpenExam={handleOpenExam} />
            )}
            {viewNoteId !== undefined ? (
                <NoteDrawer
                    key={viewNoteId}
                    open
                    id={viewNoteId}
                    showStudentInfo={false}
                    onClose={handleCloseView}
                />
            ) : null}
            {askTarget && (
                <CreateNewQuestionDialog
                    openCreateQuestionDialog
                    onCloseCreateQuestion={handleCloseAsk}
                    handleCreateQuestion={handleCreateAsk}
                    examSessionId={askTarget.examSessionId}
                    questionOptions={[
                        {
                            label: t("question_order", {
                                number: askTarget.q.number
                            }),
                            value: askTarget.q.questionSuperId
                        }
                    ]}
                />
            )}
            <MyWrongNoteConfirmEditDialog
                open={!!pendingEdit}
                onConfirm={handleConfirmEdit}
                onCancel={handleCancelEdit}
            />
        </View>
    )
}

export default MyWrongNote

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.grey[50]
    }
})
