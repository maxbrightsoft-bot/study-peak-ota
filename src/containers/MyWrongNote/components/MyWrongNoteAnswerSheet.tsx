// Mobile counterpart of the web AnswerPopover: all answers of one side (selected or correct), rich content.
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import ModalBase from "@/components/ModalBase/ModalBase"
import MathRender from "@/components/MathRender"
import { palette, TYPO } from "@/theme"
import { QuestionAnswerType } from "@/utils/enums/exam"

type MyWrongNoteAnswerSheetProps = {
    open: boolean
    isCorrectSide: boolean
    answers: string[]
    unit?: string | null
    questionAnswerType: number
    onClose: () => void
}

// Same labels as the web answerTypeOptions (types above ShortAnswer get a heading).
const ANSWER_TYPE_LABEL_KEYS: Partial<Record<number, string>> = {
    [QuestionAnswerType.OrderMatters]: "order_matters",
    [QuestionAnswerType.OrderDoesNotMatters]: "order_does_not_matter",
    [QuestionAnswerType.SynonymProcessing]: "synonym_processing",
    [QuestionAnswerType.MultipleCorrectAnswers]: "multiplecorrectanswers"
}

const MyWrongNoteAnswerSheet = ({
    open,
    isCorrectSide,
    answers,
    unit,
    questionAnswerType,
    onClose
}: MyWrongNoteAnswerSheetProps) => {
    const { t } = useTranslation()
    const typeKey = ANSWER_TYPE_LABEL_KEYS[questionAnswerType]
    const unitText = unit?.trim() || ""
    const color = isCorrectSide ? palette.success.dark : palette.error.dark

    return (
        <ModalBase isVisible={open} onClose={onClose}>
            <View style={styles.sheet}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {t(isCorrectSide ? "correct_answer" : "selected_answer")}
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={20} color={palette.grey[500]} />
                    </TouchableOpacity>
                </View>
                <View style={styles.body}>
                    {typeKey ? <Text style={styles.typeLabel}>{t(typeKey)}</Text> : null}
                    {answers.length === 0 ? (
                        <Text style={styles.empty}>_</Text>
                    ) : (
                        answers.map((answer, index) => (
                            <View key={index} style={styles.answerBox}>
                                <MathRender
                                    content={unitText ? `${answer} ${unitText}` : answer}
                                    textColor={color}
                                    fontSize={15}
                                />
                            </View>
                        ))
                    )}
                </View>
            </View>
        </ModalBase>
    )
}

export default MyWrongNoteAnswerSheet

const styles = ScaledSheet.create({
    sheet: {
        padding: "16@ms"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: "10@ms",
        borderBottomWidth: 1,
        borderBottomColor: palette.grey[200]
    },
    title: {
        ...TYPO.body2,
        color: palette.grey[600]
    },
    body: {
        paddingTop: "12@ms",
        gap: "8@ms"
    },
    typeLabel: {
        ...TYPO.button3,
        color: palette.grey[800],
        textAlign: "center",
        marginBottom: "4@ms"
    },
    answerBox: {
        borderWidth: 1,
        borderColor: palette.grey[200],
        borderRadius: "8@ms",
        paddingHorizontal: "12@ms",
        paddingVertical: "8@ms"
    },
    empty: {
        ...TYPO.body2,
        color: palette.grey[500],
        textAlign: "center"
    }
})
