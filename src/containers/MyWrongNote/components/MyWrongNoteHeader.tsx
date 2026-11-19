import React from "react"
import { Text, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { palette, TYPO } from "@/theme"
import { MyWrongNoteSummaryResponse } from "../configs/types"

type Props = {
    summary?: MyWrongNoteSummaryResponse
}

// W1 title + subtitle, W2 count chips (display only)
const MyWrongNoteHeader = ({ summary }: Props) => {
    const { t } = useTranslation()
    const chips = summary
        ? [
              {
                  key: "todo",
                  label: t("mywrongnote_chip_todo", { n: summary.todoCount }),
                  color: palette.error.dark,
                  bg: palette.error.lighter
              },
              {
                  key: "rejected",
                  label: t("mywrongnote_chip_rejected", {
                      n: summary.rejectedCount
                  }),
                  color: palette.warning.darker,
                  bg: palette.warning.lighter
              },
              {
                  key: "pending",
                  label: t("mywrongnote_chip_pending", {
                      n: summary.pendingCount
                  }),
                  color: palette.success.dark,
                  bg: palette.green_support[100]
              },
              {
                  key: "approved",
                  label: t("mywrongnote_chip_approved", {
                      n: summary.approvedCount
                  }),
                  color: palette.grey[500],
                  bg: palette.grey[200]
              }
          ]
        : []
    return (
        <View>
            <Text style={styles.subtitle}>{t("mywrongnote_subtitle")}</Text>
            <View style={styles.chips}>
                {chips.map(c => (
                    <View
                        key={c.key}
                        style={[styles.chip, { backgroundColor: c.bg }]}
                    >
                        <Text style={[styles.chipText, { color: c.color }]}>
                            {c.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default MyWrongNoteHeader

const styles = ScaledSheet.create({
    subtitle: {
        ...TYPO.body3,
        color: palette.grey[500]
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "6@ms",
        marginTop: "10@ms"
    },
    chip: {
        paddingHorizontal: "10@ms",
        paddingVertical: "4@ms",
        borderRadius: "999@ms"
    },
    chipText: {
        ...TYPO.button3
    }
})
