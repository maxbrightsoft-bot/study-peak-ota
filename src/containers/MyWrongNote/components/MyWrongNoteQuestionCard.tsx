import React, { memo, useMemo } from "react"
import { LayoutChangeEvent, Text, TouchableOpacity, View } from "react-native"
import { moderateScale, ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { palette, TYPO } from "@/theme"
import { stripHtml } from "@/utils/helpers"
import { MyLockReason, MyQuestionState } from "../configs/enums"
import {
    actionButtons,
    canAddNote,
    formatWriting,
    isTextAnswerType,
    localTime,
    MyNoteAction,
    questionAction
} from "../configs/helpers"
import { stateLook } from "../configs/look"
import { MyNoteResponse, MyQuestionResponse } from "../configs/types"
import MyWrongNoteTextualAnswer from "./MyWrongNoteTextualAnswer"

// Fallback summary text may still contain editor HTML; show plain text.
const answerText = (value?: string | null) =>
    stripHtml(value ?? "").replace(/\s+,/g, ",")

type Props = {
    question: MyQuestionResponse
    onAction: (
        q: MyQuestionResponse,
        action: MyNoteAction,
        note?: MyNoteResponse
    ) => void
    onAsk: (q: MyQuestionResponse) => void
    onLayoutQuestion: (questionSuperId: number, y: number) => void
}

type MetaSource = Pick<
    MyQuestionResponse,
    "state" | "submittedAt" | "reviewedAt" | "writingSeconds"
>

const ACTION_LABEL: Record<
    Exclude<MyNoteAction, "none">,
    { key: string; filled: boolean }
> = {
    write: { key: "mywrongnote_action_write", filled: true },
    rewrite: { key: "mywrongnote_action_rewrite", filled: true },
    edit: { key: "mywrongnote_action_edit", filled: false },
    confirmEdit: { key: "mywrongnote_action_edit", filled: false },
    view: { key: "mywrongnote_action_view", filled: false },
    addNote: { key: "mywrongnote_action_add_note", filled: false }
}

// Matches styles.card marginTop; layout.y is reported from the margin edge so scroll targets are unchanged.
const CARD_MARGIN_TOP = 12

const shortTime = (serverDate: string | null) =>
    serverDate ? localTime(serverDate).format("MM/DD HH:mm") : ""

// W11 header, W12 reject box, hints, meta, W23 lock, action buttons and (S1) the notes list.
// Same layout as the web card: note-count chip in the title row, View before Rewrite / Edit, "Add note" for another note.
const MyWrongNoteQuestionCard = ({
    question: q,
    onAction,
    onAsk,
    onLayoutQuestion
}: Props) => {
    const { t } = useTranslation()
    const look = stateLook(q.state)

    const notes = useMemo(
        () =>
            [...(q.notes ?? [])].sort(
                (a, b) =>
                    (a.questionNoteOrder ?? Number.MAX_SAFE_INTEGER) -
                        (b.questionNoteOrder ?? Number.MAX_SAFE_INTEGER) ||
                    a.noteId - b.noteId
            ),
        [q.notes]
    )
    const multiNote = notes.length > 1
    const repNote =
        notes.find(n => n.noteId === q.noteId) ??
        (notes.length > 0 ? notes[0] : undefined)

    const metaLine = (m: MetaSource) =>
        [
            m.submittedAt
                ? t("mywrongnote_meta_submitted", {
                      at: shortTime(m.submittedAt)
                  })
                : null,
            m.reviewedAt && m.state === MyQuestionState.Rejected
                ? t("mywrongnote_meta_rejected", {
                      at: shortTime(m.reviewedAt)
                  })
                : null,
            m.reviewedAt && m.state === MyQuestionState.Approved
                ? t("mywrongnote_meta_approved", {
                      at: shortTime(m.reviewedAt)
                  })
                : null,
            formatWriting(m.writingSeconds, t) || null
        ]
            .filter(Boolean)
            .join(" · ")

    const renderButton = (
        action: MyNoteAction,
        note: MyNoteResponse | undefined
    ) => {
        if (action === "none") return null
        const cfg = ACTION_LABEL[action]
        return (
            <TouchableOpacity
                key={action}
                testID={`mywrongnote-action-${action}`}
                activeOpacity={0.8}
                onPress={() => onAction(q, action, note)}
                style={[
                    styles.button,
                    cfg.filled ? styles.buttonFilled : styles.buttonOutlined
                ]}
            >
                <Text
                    style={[
                        styles.buttonText,
                        {
                            color: cfg.filled
                                ? palette.common.white
                                : palette.main[600]
                        }
                    ]}
                >
                    {t(cfg.key)}
                </Text>
            </TouchableOpacity>
        )
    }

    // Read-only View first when the note is still editable, then the main action (web order).
    const renderActions = (
        action: MyNoteAction,
        note: MyNoteResponse | undefined
    ) => <>{actionButtons(action).map(a => renderButton(a, note))}</>

    const renderReject = (m: {
        reviewerName: string | null
        reviewedAt: string | null
        rejectReason: string | null
    }) => (
        <View style={styles.rejectBox}>
            <Text style={styles.rejectTitle}>
                {t("mywrongnote_reject_title", {
                    teacher: m.reviewerName ?? "",
                    at: shortTime(m.reviewedAt)
                })}
            </Text>
            <Text style={styles.rejectReason}>{m.rejectReason}</Text>
        </View>
    )

    // Single-note mode only (web): pending hint while still editable, approved-but-editable hint.
    const renderHint = (
        m: Pick<MyQuestionResponse, "state" | "editResetsApproval" | "canEdit">
    ) => {
        if (m.state === MyQuestionState.Pending && m.canEdit)
            return (
                <Text style={styles.pendingHint}>
                    {t("mywrongnote_pending_hint")}
                </Text>
            )
        if (m.state === MyQuestionState.Approved && m.editResetsApproval)
            return (
                <Text style={styles.hint}>{t("mywrongnote_approved_hint")}</Text>
            )
        return null
    }

    const meta = metaLine(q)
    const mainAction = questionAction(repNote, q)
    const showAddNote = canAddNote(q, notes)

    return (
        <View
            style={styles.card}
            onLayout={(e: LayoutChangeEvent) =>
                onLayoutQuestion(
                    q.questionSuperId,
                    e.nativeEvent.layout.y - moderateScale(CARD_MARGIN_TOP)
                )
            }
        >
            <View style={styles.titleRow}>
                <Text style={styles.number}>
                    {t("mywrongnote_question_no", { n: q.number })}
                </Text>
                <View style={[styles.chip, { backgroundColor: look.bg }]}>
                    <Text style={[styles.chipText, { color: look.color }]}>
                        {t(look.key)}
                    </Text>
                </View>
                {multiNote ? (
                    <View
                        style={[styles.chip, styles.countChip]}
                        testID="mywrongnote-q-note-count"
                    >
                        <Text style={[styles.chipText, styles.countChipText]}>
                            {t("mywrongnote_note_count", { n: notes.length })}
                        </Text>
                    </View>
                ) : null}
                {q.typeName ? (
                    <Text style={styles.typeName}>{q.typeName}</Text>
                ) : null}
            </View>

            {q.questionAnswerType !== null && isTextAnswerType(q.questionAnswerType) ? (
                <MyWrongNoteTextualAnswer
                    myAnswers={q.myAnswers ?? []}
                    correctAnswers={q.correctAnswers ?? []}
                    questionAnswerType={q.questionAnswerType}
                    unit={q.unit}
                />
            ) : (
                <Text style={styles.answer}>
                    {t("mywrongnote_picked", {
                        mine: answerText(q.myAnswerText) || "_",
                        answer: answerText(q.correctAnswerText)
                    })}
                </Text>
            )}

            {multiNote ? (
                <View style={styles.notes}>
                    {notes.map((note, idx) => {
                        const noteLook = stateLook(note.state)
                        const noteMeta = metaLine(note)
                        return (
                            <View key={note.noteId} style={styles.noteRow}>
                                <View style={styles.noteHead}>
                                    <View style={styles.noteTitle}>
                                        <Text style={styles.noteNumber}>
                                            {t("mywrongnote_note_n", {
                                                n: note.questionNoteOrder ?? idx + 1
                                            })}
                                        </Text>
                                        <View
                                            style={[
                                                styles.chip,
                                                { backgroundColor: noteLook.bg }
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    { color: noteLook.color }
                                                ]}
                                            >
                                                {t(noteLook.key)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.noteButtons}>
                                        {renderActions(
                                            questionAction(note, q),
                                            note
                                        )}
                                    </View>
                                </View>
                                {note.state === MyQuestionState.Rejected
                                    ? renderReject(note)
                                    : null}
                                {noteMeta ? (
                                    <Text style={styles.meta}>{noteMeta}</Text>
                                ) : null}
                            </View>
                        )
                    })}
                </View>
            ) : (
                <>
                    {q.state === MyQuestionState.Rejected
                        ? renderReject(q)
                        : null}
                    {renderHint(q)}
                    {meta ? <Text style={styles.meta}>{meta}</Text> : null}
                </>
            )}

            {q.lockReason === MyLockReason.DeadlinePassed ? (
                <View style={styles.lock}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={14}
                        color={palette.grey[500]}
                    />
                    <Text style={styles.lockText}>
                        {q.state === MyQuestionState.Missed
                            ? t("mywrongnote_lock_missed")
                            : t("mywrongnote_lock_deadline")}
                    </Text>
                </View>
            ) : null}

            <View style={styles.actions}>
                {multiNote ? null : renderActions(mainAction, repNote)}
                {showAddNote ? renderButton("addNote", undefined) : null}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onAsk(q)}
                    style={styles.ask}
                >
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={16}
                        color={palette.grey[500]}
                    />
                    <Text style={styles.askText}>
                        {t("mywrongnote_action_ask")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default memo(MyWrongNoteQuestionCard)

const styles = ScaledSheet.create({
    card: {
        backgroundColor: palette.common.white,
        borderRadius: "14@ms",
        borderWidth: 1,
        borderColor: palette.grey[200],
        padding: "14@ms",
        marginTop: `${CARD_MARGIN_TOP}@ms`
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "6@ms"
    },
    number: {
        ...TYPO.heading2,
        color: palette.grey[800]
    },
    chip: {
        paddingHorizontal: "9@ms",
        paddingVertical: "3@ms",
        borderRadius: "999@ms"
    },
    chipText: {
        ...TYPO.button4
    },
    countChip: {
        backgroundColor: palette.main[50]
    },
    countChipText: {
        color: palette.main[700]
    },
    typeName: {
        ...TYPO.body3,
        color: palette.grey[500]
    },
    answer: {
        ...TYPO.heading3,
        color: palette.error.dark,
        marginTop: "8@ms"
    },
    rejectBox: {
        backgroundColor: palette.warning.lighter,
        borderWidth: 1,
        borderColor: palette.warning.light,
        borderRadius: "10@ms",
        padding: "10@ms",
        marginTop: "10@ms"
    },
    rejectTitle: {
        ...TYPO.heading3,
        color: palette.warning.darker
    },
    rejectReason: {
        ...TYPO.body3,
        color: palette.grey[800],
        marginTop: "2@ms"
    },
    pendingHint: {
        ...TYPO.body3,
        color: palette.success.dark,
        marginTop: "8@ms"
    },
    hint: {
        ...TYPO.body3,
        color: palette.grey[500],
        marginTop: "8@ms"
    },
    meta: {
        ...TYPO.caption,
        color: palette.grey[500],
        marginTop: "8@ms"
    },
    lock: {
        flexDirection: "row",
        alignItems: "center",
        gap: "6@ms",
        marginTop: "8@ms"
    },
    lockText: {
        flex: 1,
        ...TYPO.caption,
        color: palette.grey[500]
    },
    notes: {
        marginTop: "10@ms",
        gap: "8@ms"
    },
    noteRow: {
        backgroundColor: palette.grey[50],
        borderRadius: "10@ms",
        borderWidth: 1,
        borderColor: palette.grey[200],
        padding: "10@ms"
    },
    noteHead: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8@ms"
    },
    noteButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        gap: "6@ms"
    },
    noteTitle: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
        gap: "6@ms"
    },
    noteNumber: {
        ...TYPO.button3,
        color: palette.grey[800]
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10@ms",
        marginTop: "12@ms"
    },
    button: {
        paddingHorizontal: "16@ms",
        paddingVertical: "8@ms",
        borderRadius: "8@ms",
        borderWidth: 1
    },
    buttonFilled: {
        backgroundColor: palette.main[500],
        borderColor: palette.main[500]
    },
    buttonOutlined: {
        backgroundColor: palette.common.white,
        borderColor: palette.main[300]
    },
    buttonText: {
        ...TYPO.button3
    },
    ask: {
        flexDirection: "row",
        alignItems: "center",
        gap: "4@ms",
        paddingVertical: "8@ms"
    },
    askText: {
        ...TYPO.button3,
        color: palette.grey[500]
    }
})
