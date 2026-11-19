import React, { memo } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { palette, TYPO } from "@/theme"
import {
    deadlineChip,
    localTime,
    resolveDeadlineState
} from "../configs/helpers"
import { deadlineTone } from "../configs/look"
import { MyExamItemResponse } from "../configs/types"

type Props = {
    exam: MyExamItemResponse
    onOpen: (examSessionId: number, studentExamSessionId?: number) => void
    /** Tick value from useNowTick. */
    nowMs?: number
}

// W5 title/date/teacher/count, W6 deadline chip, W7 progress + counts, W20 parent chip
const MyWrongNoteExamCard = ({ exam, onOpen, nowMs }: Props) => {
    const { t } = useTranslation()
    const state = resolveDeadlineState(exam.deadlineState, exam.deadlineAt, nowMs)
    const tone = deadlineTone(state)
    const counts = [
        {
            n: exam.notWrittenCount,
            label: t("mywrongnote_state_not_written"),
            color: palette.error.dark
        },
        {
            n: exam.rejectedCount,
            label: t("mywrongnote_state_rejected"),
            color: palette.warning.darker
        },
        {
            n: exam.pendingCount,
            label: t("mywrongnote_state_pending"),
            color: palette.success.dark
        },
        {
            n: exam.approvedCount,
            label: t("mywrongnote_state_approved"),
            color: palette.grey[500]
        },
        {
            n: exam.missedCount,
            label: t("mywrongnote_state_missed"),
            color: palette.grey[500]
        }
    ].filter(c => c.n > 0)
    const percent = Math.max(0, Math.min(100, exam.progressPercent ?? 0))

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.card}
            onPress={() =>
                onOpen(exam.examSessionId, exam.studentExamSessionId)
            }
        >
            <View style={styles.chips}>
                <View style={[styles.chip, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.chipText, { color: tone.color }]}>
                        {deadlineChip(
                            state,
                            exam.deadlineAt,
                            t,
                            nowMs
                        )}
                    </Text>
                </View>
                {exam.parentVisible ? (
                    <View
                        style={[
                            styles.chip,
                            { backgroundColor: palette.warning.lighter }
                        ]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                { color: palette.warning.darker }
                            ]}
                        >
                            {t("mywrongnote_parent_visible")}
                        </Text>
                    </View>
                ) : null}
            </View>
            <Text style={styles.title}>
                {exam.title}
                {exam.attemptCount > 1 ? (
                    <Text
                        style={[
                            styles.attempt,
                            {
                                color: exam.isCounted
                                    ? palette.main[600]
                                    : palette.grey[500]
                            }
                        ]}
                    >{`  ${t("mywrongnote_attempt_label", {
                        n: exam.attemptNumber,
                        m: exam.attemptCount
                    })}`}</Text>
                ) : null}
            </Text>
            <Text style={styles.meta}>
                {localTime(exam.startedAt).format("YYYY-MM-DD")} ·{" "}
                {exam.teacherName} ·{" "}
                {t("mywrongnote_question_count", { n: exam.questionCount })}
            </Text>
            {exam.wrongCount > 0 ? (
                <>
                    <View style={styles.progressRow}>
                        <View style={styles.track}>
                            <View
                                style={[styles.fill, { width: `${percent}%` }]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {exam.pendingCount + exam.approvedCount}/
                            {exam.wrongCount}
                        </Text>
                    </View>
                    <View style={styles.counts}>
                        {counts.map(c => (
                            <Text
                                key={c.label}
                                style={[styles.count, { color: c.color }]}
                            >
                                {c.label}{" "}
                                <Text style={styles.bold}>{c.n}</Text>
                            </Text>
                        ))}
                    </View>
                </>
            ) : (
                <Text style={styles.perfect}>{t("mywrongnote_perfect")}</Text>
            )}
        </TouchableOpacity>
    )
}

export default memo(MyWrongNoteExamCard)

const styles = ScaledSheet.create({
    card: {
        backgroundColor: palette.common.white,
        borderRadius: "14@ms",
        borderWidth: 1,
        borderColor: palette.grey[200],
        padding: "14@ms",
        marginBottom: "12@ms"
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "6@ms",
        marginBottom: "8@ms"
    },
    chip: {
        paddingHorizontal: "9@ms",
        paddingVertical: "3@ms",
        borderRadius: "999@ms"
    },
    chipText: {
        ...TYPO.button4
    },
    title: {
        ...TYPO.heading2,
        color: palette.grey[800]
    },
    attempt: {
        ...TYPO.button3
    },
    meta: {
        ...TYPO.body3,
        color: palette.grey[500],
        marginTop: "4@ms"
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: "8@ms",
        marginTop: "12@ms"
    },
    track: {
        flex: 1,
        height: "6@ms",
        borderRadius: "3@ms",
        backgroundColor: palette.grey[100],
        overflow: "hidden"
    },
    fill: {
        height: "100%",
        backgroundColor: palette.main[500]
    },
    progressText: {
        ...TYPO.button3,
        color: palette.grey[500]
    },
    counts: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: "10@ms",
        rowGap: "2@ms",
        marginTop: "8@ms"
    },
    count: {
        ...TYPO.body3
    },
    bold: {
        ...TYPO.button3
    },
    perfect: {
        ...TYPO.button3,
        color: palette.success.dark,
        marginTop: "10@ms"
    }
})
