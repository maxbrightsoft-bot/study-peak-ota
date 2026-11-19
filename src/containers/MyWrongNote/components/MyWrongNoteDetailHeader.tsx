import React from "react"
import { Text, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { palette, TYPO } from "@/theme"
import { MyDeadlineState } from "../configs/enums"
import { localTime, resolveDeadlineState, timeLeft } from "../configs/helpers"
import { MyExamItemResponse } from "../configs/types"

type Props = {
    exam: MyExamItemResponse
    /** Tick value from useNowTick. */
    nowMs?: number
}

type Tone = { bg: string; border: string; text: string }

const TONES: Record<"error" | "main" | "warning" | "grey", Tone> = {
    error: {
        bg: palette.error.lighter,
        border: palette.error.light,
        text: palette.error.dark
    },
    main: {
        bg: palette.main[50],
        border: palette.main[300],
        text: palette.main[700]
    },
    warning: {
        bg: palette.warning.lighter,
        border: palette.warning.light,
        text: palette.warning.darker
    },
    grey: {
        bg: palette.grey[100],
        border: palette.grey[300],
        text: palette.grey[700]
    }
}

// W8/W19/W21 deadline banner, W20 parent chip, title + meta line (W24 back lives in the app bar).
// The grid and legend are rendered by the view below this header.
const MyWrongNoteDetailHeader = ({ exam, nowMs }: Props) => {
    const { t } = useTranslation()
    const state = resolveDeadlineState(exam.deadlineState, exam.deadlineAt, nowMs)
    const deadline = exam.deadlineAt ? localTime(exam.deadlineAt) : undefined
    const weekdays = t("mywrongnote_weekdays").split(",")
    const at = deadline
        ? `${deadline.format("MM/DD")} (${weekdays[deadline.day()]}) ${deadline.format("HH:mm")}`
        : ""

    const banner = (() => {
        switch (state) {
            case MyDeadlineState.Open:
            case MyDeadlineState.DueSoon:
                return {
                    tone: state === MyDeadlineState.DueSoon ? "error" : "main",
                    title: t("mywrongnote_deadline_banner_open", {
                        left: timeLeft(
                            exam.deadlineAt as string,
                            t,
                            nowMs
                        ),
                        at
                    }),
                    desc: t("mywrongnote_deadline_desc_open")
                } as const
            case MyDeadlineState.Overdue:
                return {
                    tone: "error",
                    title: t("mywrongnote_deadline_banner_overdue", { at }),
                    desc: t("mywrongnote_deadline_desc_overdue")
                } as const
            case MyDeadlineState.LateAllowed:
                return {
                    tone: "warning",
                    title: t("mywrongnote_deadline_banner_late", { at }),
                    desc: t("mywrongnote_deadline_desc_late")
                } as const
            default:
                return {
                    tone: "grey",
                    title: t("mywrongnote_deadline_none"),
                    desc: t("mywrongnote_deadline_desc_none")
                } as const
        }
    })()
    const tone = TONES[banner.tone]

    return (
        <View>
            {exam.parentVisible ? (
                <View style={styles.parentChip}>
                    <Text style={styles.parentChipText}>
                        {t("mywrongnote_parent_visible")}
                    </Text>
                </View>
            ) : null}
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
                {t("mywrongnote_question_count", { n: exam.questionCount })} ·{" "}
                {t("mywrongnote_wrong_count", { n: exam.wrongCount })}
            </Text>

            <View
                style={[
                    styles.banner,
                    { backgroundColor: tone.bg, borderColor: tone.border }
                ]}
            >
                <Text style={[styles.bannerTitle, { color: tone.text }]}>
                    {banner.title}
                </Text>
                <Text style={styles.bannerDesc}>{banner.desc}</Text>
            </View>
        </View>
    )
}

export default MyWrongNoteDetailHeader

const styles = ScaledSheet.create({
    parentChip: {
        alignSelf: "flex-start",
        paddingHorizontal: "9@ms",
        paddingVertical: "3@ms",
        borderRadius: "999@ms",
        backgroundColor: palette.warning.lighter,
        marginBottom: "6@ms"
    },
    parentChipText: {
        ...TYPO.button4,
        color: palette.warning.darker
    },
    title: {
        ...TYPO.heading1,
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
    banner: {
        borderWidth: 1,
        borderRadius: "10@ms",
        padding: "12@ms",
        marginTop: "12@ms"
    },
    bannerTitle: {
        ...TYPO.heading3
    },
    bannerDesc: {
        ...TYPO.body3,
        color: palette.grey[600],
        marginTop: "2@ms"
    }
})
