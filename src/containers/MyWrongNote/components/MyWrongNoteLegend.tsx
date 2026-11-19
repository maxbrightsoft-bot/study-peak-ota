import React, { memo } from "react"
import { Text, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { palette, TYPO } from "@/theme"
import { MyQuestionState } from "../configs/enums"
import { stateLook } from "../configs/look"

const STATES = [
    MyQuestionState.NotWritten,
    MyQuestionState.Rejected,
    MyQuestionState.Pending,
    MyQuestionState.Approved,
    MyQuestionState.Missed,
    MyQuestionState.Correct
]

// W10: what each grid colour/glyph means.
const MyWrongNoteLegend = () => {
    const { t } = useTranslation()
    return (
        <View style={styles.row}>
            {STATES.map(state => {
                const look = stateLook(state)
                return (
                    <View key={state} style={styles.item}>
                        <View
                            style={[
                                styles.swatch,
                                {
                                    backgroundColor: look.bg,
                                    borderColor:
                                        look.borderColor ?? "transparent",
                                    borderStyle: look.dashed
                                        ? "dashed"
                                        : "solid"
                                }
                            ]}
                        >
                            {look.glyph ? (
                                <Text
                                    style={[styles.glyph, { color: look.color }]}
                                >
                                    {look.glyph}
                                </Text>
                            ) : null}
                        </View>
                        <Text style={styles.label}>{t(look.key)}</Text>
                    </View>
                )
            })}
        </View>
    )
}

export default memo(MyWrongNoteLegend)

const styles = ScaledSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: "12@ms",
        rowGap: "6@ms",
        marginTop: "12@ms"
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: "4@ms"
    },
    swatch: {
        width: "16@ms",
        height: "16@ms",
        borderRadius: "5@ms",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    glyph: {
        ...TYPO.button4,
        fontSize: "9@ms",
        lineHeight: "11@ms"
    },
    label: {
        ...TYPO.caption,
        color: palette.grey[600]
    }
})
