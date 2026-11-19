import React, { useCallback, useMemo, useRef } from "react"
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { useFocusEffect } from "@react-navigation/native"
import { palette, TYPO } from "@/theme"
import useMyWrongNoteDetail from "../hooks/useMyWrongNoteDetail"
import { cardOrder, isDeadlineNear, MyNoteAction } from "../configs/helpers"
import useNowTick from "../hooks/useNowTick"
import {
    MyExamItemResponse,
    MyNoteResponse,
    MyQuestionResponse
} from "../configs/types"
import MyWrongNoteDetailHeader from "../components/MyWrongNoteDetailHeader"
import MyWrongNoteQuestionGrid from "../components/MyWrongNoteQuestionGrid"
import MyWrongNoteLegend from "../components/MyWrongNoteLegend"
import MyWrongNoteQuestionCard from "../components/MyWrongNoteQuestionCard"

type Props = {
    examSessionId: number
    studentExamSessionId?: number
    initialQuestionSuperId?: number
    onBack: () => void
    onWrite: (
        q: MyQuestionResponse,
        note?: MyNoteResponse,
        action?: MyNoteAction,
        exam?: MyExamItemResponse
    ) => void
    /** G1: View opens the note in place (drawer), no navigation. */
    onView: (note?: MyNoteResponse) => void
    onAsk: (q: MyQuestionResponse, exam?: MyExamItemResponse) => void
}

const SCROLL_MARGIN = 8

// W8-W12, W19-W24: header card (banner, grid, legend) then one card per wrong question.
const MyWrongNoteDetailView = ({
    examSessionId,
    studentExamSessionId,
    initialQuestionSuperId,
    onBack,
    onWrite,
    onView,
    onAsk
}: Props) => {
    const { t } = useTranslation()
    const { detail, isLoading, error, notFound, reload } =
        useMyWrongNoteDetail(examSessionId, studentExamSessionId)

    // Reload when the screen regains focus (e.g. back from the editor); the first focus is the initial load.
    const reloadRef = useRef(reload)
    reloadRef.current = reload
    const firstFocusRef = useRef(true)
    useFocusEffect(
        useCallback(() => {
            if (firstFocusRef.current) {
                firstFocusRef.current = false
                return
            }
            reloadRef.current()
        }, [])
    )

    const scrollRef = useRef<ScrollView>(null)
    const layoutYRef = useRef<Record<number, number>>({})
    // Deep-link target: scrolled to once, when its card has been laid out.
    const pendingFocusRef = useRef<number | undefined>(initialQuestionSuperId)

    const scrollToQuestion = useCallback((questionSuperId: number) => {
        const y = layoutYRef.current[questionSuperId]
        if (y === undefined) return
        scrollRef.current?.scrollTo({
            y: Math.max(0, y - SCROLL_MARGIN),
            animated: true
        })
    }, [])

    const handleCardLayout = useCallback(
        (questionSuperId: number, y: number) => {
            layoutYRef.current[questionSuperId] = y
            if (pendingFocusRef.current === questionSuperId) {
                pendingFocusRef.current = undefined
                scrollToQuestion(questionSuperId)
            }
        },
        [scrollToQuestion]
    )

    // Tick once a minute while the header's deadline is inside the due-soon window.
    const nowMs = useNowTick(isDeadlineNear(detail?.exam.deadlineAt))

    const cards = useMemo(
        () => (detail ? cardOrder(detail.questions) : []),
        [detail]
    )

    const exam = detail?.exam
    const handleAction = useCallback(
        (
            q: MyQuestionResponse,
            action: MyNoteAction,
            note?: MyNoteResponse
        ) => {
            switch (action) {
                case "view":
                    onView(note)
                    break
                case "addNote":
                    // Another note for the question: the existing write path without a note.
                    onWrite(q, undefined, "write", exam)
                    break
                case "confirmEdit":
                    // The root shows the confirm dialog before opening the editor.
                    onWrite(q, note, action, exam)
                    break
                case "write":
                case "rewrite":
                case "edit":
                    onWrite(q, note, action, exam)
                    break
                default:
                    break
            }
        },
        [onWrite, onView, exam]
    )
    const handleAskQuestion = useCallback(
        (q: MyQuestionResponse) => onAsk(q, exam),
        [onAsk, exam]
    )

    if (notFound) {
        return (
            <View style={styles.center}>
                <Text style={styles.message}>{t("mywrongnote_not_found")}</Text>
                <TouchableOpacity style={styles.button} onPress={onBack}>
                    <Text style={styles.buttonText}>
                        {t("mywrongnote_back")}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (!detail) {
        if (error) {
            return (
                <View style={styles.center}>
                    <Text style={styles.message}>{error}</Text>
                    <TouchableOpacity style={styles.button} onPress={reload}>
                        <Text style={styles.buttonText}>
                            {t("mywrongnote_retry")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.link}>{t("mywrongnote_back")}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <View style={styles.center}>
                {isLoading ? (
                    <ActivityIndicator color={palette.main[500]} />
                ) : null}
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.link}>{t("mywrongnote_back")}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headerCard}>
                <MyWrongNoteDetailHeader
                    exam={detail.exam}
                    nowMs={nowMs}
                />
                <MyWrongNoteQuestionGrid
                    questions={detail.questions}
                    onPressQuestion={scrollToQuestion}
                />
                <MyWrongNoteLegend />
            </View>
            {cards.length === 0 ? (
                <Text style={styles.perfect}>{t("mywrongnote_perfect")}</Text>
            ) : null}
            {cards.map(q => (
                <MyWrongNoteQuestionCard
                    key={q.questionSuperId}
                    question={q}
                    onAction={handleAction}
                    onAsk={handleAskQuestion}
                    onLayoutQuestion={handleCardLayout}
                />
            ))}
        </ScrollView>
    )
}

export default MyWrongNoteDetailView

const styles = ScaledSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: palette.grey[50]
    },
    content: {
        padding: "16@ms",
        paddingBottom: "32@ms"
    },
    headerCard: {
        backgroundColor: palette.common.white,
        borderRadius: "14@ms",
        borderWidth: 1,
        borderColor: palette.grey[200],
        padding: "14@ms"
    },
    perfect: {
        ...TYPO.heading3,
        color: palette.success.dark,
        textAlign: "center",
        paddingVertical: "24@ms"
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: "12@ms",
        padding: "16@ms",
        backgroundColor: palette.grey[50]
    },
    message: {
        ...TYPO.body2,
        color: palette.grey[500],
        textAlign: "center"
    },
    button: {
        paddingHorizontal: "18@ms",
        paddingVertical: "10@ms",
        borderRadius: "10@ms",
        backgroundColor: palette.main[500]
    },
    buttonText: {
        ...TYPO.button3,
        color: palette.common.white
    },
    link: {
        ...TYPO.button3,
        color: palette.main[600]
    }
})
