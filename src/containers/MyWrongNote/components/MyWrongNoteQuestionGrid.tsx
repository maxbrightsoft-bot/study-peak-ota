import React, { memo, useMemo } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { palette, TYPO } from "@/theme"
import { MyQuestionState } from "../configs/enums"
import { MY_WRONG_NOTE_GRID_COLUMNS } from "../configs/constants"
import { sortByNumber } from "../configs/helpers"
import { stateLook } from "../configs/look"
import { MyQuestionResponse } from "../configs/types"

type Props = {
    questions: MyQuestionResponse[]
    onPressQuestion: (questionSuperId: number) => void
}

const CELL_WIDTH = `${100 / MY_WRONG_NOTE_GRID_COLUMNS}%` as const

// W9: every question as a 7-column grid; correct cells are inert, the others jump to their card.
const MyWrongNoteQuestionGrid = ({ questions, onPressQuestion }: Props) => {
    const sorted = useMemo(() => sortByNumber(questions), [questions])
    return (
        <View style={styles.grid}>
            {sorted.map(q => {
                const look = stateLook(q.state)
                const correct = q.state === MyQuestionState.Correct
                return (
                    <View key={q.questionSuperId} style={styles.slot}>
                        <TouchableOpacity
                            disabled={correct}
                            activeOpacity={0.7}
                            onPress={() => onPressQuestion(q.questionSuperId)}
                            style={[
                                styles.cell,
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
                            <Text
                                style={[
                                    styles.number,
                                    { color: look.color }
                                ]}
                                numberOfLines={1}
                            >
                                {q.number}
                            </Text>
                            {look.glyph ? (
                                <Text
                                    style={[
                                        styles.glyph,
                                        { color: look.color }
                                    ]}
                                >
                                    {look.glyph}
                                </Text>
                            ) : null}
                        </TouchableOpacity>
                    </View>
                )
            })}
        </View>
    )
}

export default memo(MyWrongNoteQuestionGrid)

const styles = ScaledSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: "14@ms"
    },
    slot: {
        width: CELL_WIDTH,
        padding: "2@ms"
    },
    cell: {
        height: "40@ms",
        borderRadius: "8@ms",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    number: {
        ...TYPO.button4
    },
    glyph: {
        ...TYPO.caption,
        lineHeight: "12@ms",
        color: palette.grey[500]
    }
})
