// Mobile counterpart of the web TextualAnswerCompare: "Your answer [mine] → correct [answer]".
// Each side shows its first answer (+ unit, ",..." when there are more); tapping opens all answers.
import React, { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { palette, TYPO } from "@/theme"
import { stripHtml } from "@/utils/helpers"
import MyWrongNoteAnswerSheet from "./MyWrongNoteAnswerSheet"

type MyWrongNoteTextualAnswerProps = {
    myAnswers: string[]
    correctAnswers: string[]
    questionAnswerType: number
    unit?: string | null
}

const MyWrongNoteTextualAnswer = ({
    myAnswers,
    correctAnswers,
    questionAnswerType,
    unit
}: MyWrongNoteTextualAnswerProps) => {
    const { t } = useTranslation()
    const [openSide, setOpenSide] = useState<"mine" | "correct" | null>(null)
    const unitText = unit?.trim() || ""

    const inline = (items: string[]) => {
        const first = stripHtml(items[0] ?? "")
        return `${first}${unitText ? ` ${unitText}` : ""}${items.length > 1 ? ",..." : ""}`
    }

    return (
        <View style={styles.row}>
            <Text style={styles.label}>{t("mywrongnote_your_answer")}</Text>
            {myAnswers.length > 0 ? (
                <TouchableOpacity
                    style={[styles.chip, styles.mineChip]}
                    onPress={() => setOpenSide("mine")}
                >
                    <Text style={[styles.chipText, styles.mineText]} numberOfLines={1}>
                        {inline(myAnswers)}
                    </Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.label}>_</Text>
            )}
            <Text style={styles.label}>{t("mywrongnote_correct_prefix")}</Text>
            <TouchableOpacity
                style={[styles.chip, styles.correctChip]}
                onPress={() => setOpenSide("correct")}
            >
                <Text style={[styles.chipText, styles.correctText]} numberOfLines={1}>
                    {inline(correctAnswers)}
                </Text>
            </TouchableOpacity>
            <MyWrongNoteAnswerSheet
                open={openSide !== null}
                isCorrectSide={openSide === "correct"}
                answers={openSide === "correct" ? correctAnswers : myAnswers}
                unit={unit}
                questionAnswerType={questionAnswerType}
                onClose={() => setOpenSide(null)}
            />
        </View>
    )
}

export default MyWrongNoteTextualAnswer

const styles = ScaledSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "6@ms",
        marginTop: "8@ms"
    },
    label: {
        ...TYPO.button3,
        color: palette.error.dark
    },
    chip: {
        maxWidth: "45%",
        borderRadius: "6@ms",
        borderWidth: 1,
        paddingHorizontal: "8@ms",
        paddingVertical: "2@ms"
    },
    mineChip: {
        borderColor: palette.error.light,
        backgroundColor: palette.error.lighter
    },
    correctChip: {
        borderColor: palette.green_support[500],
        backgroundColor: palette.green_support[100]
    },
    chipText: {
        ...TYPO.button3
    },
    mineText: {
        color: palette.error.dark
    },
    correctText: {
        color: palette.success.dark
    }
})
