import React from "react"
import { View } from "react-native"
import { ScaledSheet, ms } from "react-native-size-matters"
import { palette } from "@/theme"
import Skeleton from "@/components/Skeleton"

const MyWrongNoteListSkeleton = ({ count = 3 }: { count?: number }) => (
    <View>
        {Array.from({ length: count }).map((_, i) => (
            <View key={`mwn-skeleton-${i}`} style={styles.card}>
                <Skeleton width={ms(90)} height={ms(20)} borderRadius={ms(10)} />
                <Skeleton
                    width="80%"
                    height={ms(16)}
                    style={{ marginTop: ms(10) }}
                />
                <Skeleton
                    width="55%"
                    height={ms(12)}
                    style={{ marginTop: ms(8) }}
                />
                <Skeleton
                    width="100%"
                    height={ms(6)}
                    borderRadius={ms(3)}
                    style={{ marginTop: ms(14) }}
                />
            </View>
        ))}
    </View>
)

export default MyWrongNoteListSkeleton

const styles = ScaledSheet.create({
    card: {
        backgroundColor: palette.common.white,
        borderRadius: "14@ms",
        borderWidth: 1,
        borderColor: palette.grey[200],
        padding: "14@ms",
        marginBottom: "12@ms"
    }
})
