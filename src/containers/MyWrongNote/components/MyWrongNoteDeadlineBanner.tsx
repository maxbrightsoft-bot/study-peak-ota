import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { palette, TYPO } from "@/theme"
import { localTime, timeLeft } from "../configs/helpers"
import { MyWrongNoteSummaryResponse } from "../configs/types"
import { MY_WRONG_NOTE_DUE_SOON_HOURS } from "../configs/constants"

type Props = {
    summary?: MyWrongNoteSummaryResponse
    onOpenExam: (examSessionId: number) => void
    /** Tick value from useNowTick. */
    nowMs: number
}

// W3 nearest deadline with something left to do; hidden when none / already passed.
const MyWrongNoteDeadlineBanner = ({ summary, onOpenExam, nowMs }: Props) => {
    const { t } = useTranslation()
    const next = summary?.nextDeadline
    if (!next) return null
    const now = nowMs
    const deadline = localTime(next.deadlineAt)
    if (deadline.valueOf() <= now) return null
    const urgent =
        deadline.diff(now, "hours", true) < MY_WRONG_NOTE_DUE_SOON_HOURS
    const weekdays = t("mywrongnote_weekdays").split(",")
    const at = `${deadline.format("MM/DD")} (${weekdays[deadline.day()]}) ${deadline.format("HH:mm")}`
    const tone = urgent
        ? {
              bg: palette.error.lighter,
              border: palette.error.light,
              icon: palette.error.main,
              text: palette.error.dark
          }
        : {
              bg: palette.main[50],
              border: palette.main[300],
              icon: palette.main[500],
              text: palette.main[700]
          }
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onOpenExam(next.examSessionId)}
            style={[
                styles.banner,
                { backgroundColor: tone.bg, borderColor: tone.border }
            ]}
        >
            <Ionicons name="alarm-outline" size={22} color={tone.icon} />
            <View style={styles.body}>
                <Text style={[styles.title, { color: tone.text }]}>
                    {t("mywrongnote_banner_title", {
                        left: timeLeft(next.deadlineAt, t, nowMs),
                        at
                    })}
                </Text>
                <Text style={styles.sub} numberOfLines={1}>
                    {next.title}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.grey[700]}
            />
        </TouchableOpacity>
    )
}

export default MyWrongNoteDeadlineBanner

const styles = ScaledSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        gap: "10@ms",
        padding: "12@ms",
        borderRadius: "12@ms",
        borderWidth: 1,
        marginTop: "14@ms"
    },
    body: {
        flex: 1
    },
    title: {
        ...TYPO.heading3
    },
    sub: {
        ...TYPO.body3,
        color: palette.grey[500],
        marginTop: "2@ms"
    }
})
