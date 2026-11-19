import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { palette, TYPO } from "@/theme"
import { MyExamFilter } from "../configs/enums"
import { MyExamTotalsResponse } from "../configs/types"

type Props = {
    filter: MyExamFilter
    totals?: MyExamTotalsResponse
    onChange: (filter: MyExamFilter) => void
}

// W4 three segments with exam counts
const MyWrongNoteFilterTabs = ({ filter, totals, onChange }: Props) => {
    const { t } = useTranslation()
    const tabs = [
        {
            value: MyExamFilter.Todo,
            label: t("mywrongnote_filter_todo"),
            n: totals?.todoExams
        },
        {
            value: MyExamFilter.All,
            label: t("mywrongnote_filter_all"),
            n: totals?.allExams
        },
        {
            value: MyExamFilter.Done,
            label: t("mywrongnote_filter_done"),
            n: totals?.doneExams
        }
    ]
    return (
        <View style={styles.row}>
            {tabs.map(tab => {
                const selected = tab.value === filter
                return (
                    <TouchableOpacity
                        key={tab.value}
                        style={[styles.tab, selected && styles.tabSelected]}
                        onPress={() => onChange(tab.value)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                    >
                        <Text
                            style={[
                                styles.label,
                                selected && styles.labelSelected
                            ]}
                        >
                            {tab.n === undefined
                                ? tab.label
                                : `${tab.label} ${tab.n}`}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default MyWrongNoteFilterTabs

const styles = ScaledSheet.create({
    row: {
        flexDirection: "row",
        backgroundColor: palette.common.white,
        borderRadius: "10@ms",
        borderWidth: 1,
        borderColor: palette.grey[300],
        marginTop: "14@ms",
        marginBottom: "12@ms",
        overflow: "hidden"
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: "11@ms",
        borderBottomWidth: 2,
        borderBottomColor: "transparent"
    },
    tabSelected: {
        borderBottomColor: palette.main[500]
    },
    label: {
        ...TYPO.button3,
        color: palette.grey[500]
    },
    labelSelected: {
        color: palette.main[700]
    }
})
