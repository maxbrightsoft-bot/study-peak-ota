// Fixed app bar for the hub list and the exam detail (same look as the Exam results header).
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { Ionicons } from "@expo/vector-icons"
import { palette, TYPO } from "@/theme"

type MyWrongNoteAppBarProps = {
    title: string
    onBack: () => void
}

const MyWrongNoteAppBar = ({ title, onBack }: MyWrongNoteAppBarProps) => (
    <View style={styles.bar}>
        <TouchableOpacity
            style={styles.side}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="mywrongnote-back"
        >
            <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800]} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
            {title}
        </Text>
        <View style={styles.side} />
    </View>
)

export default MyWrongNoteAppBar

const styles = ScaledSheet.create({
    bar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: "16@ms",
        paddingVertical: "14@ms",
        backgroundColor: palette.common.white,
        borderBottomWidth: 1,
        borderBottomColor: palette.grey[200]
    },
    side: {
        width: "32@ms"
    },
    title: {
        ...TYPO.heading3,
        flex: 1,
        textAlign: "center",
        color: palette.grey[800]
    }
})
