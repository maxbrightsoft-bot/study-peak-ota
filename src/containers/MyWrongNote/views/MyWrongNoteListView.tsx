import React, { useCallback } from "react"
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { ScaledSheet } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { palette, TYPO } from "@/theme"
import useMyWrongNoteList from "../hooks/useMyWrongNoteList"
import { MyExamFilter } from "../configs/enums"
import { isDeadlineNear } from "../configs/helpers"
import { MyExamItemResponse } from "../configs/types"
import useNowTick from "../hooks/useNowTick"
import MyWrongNoteHeader from "../components/MyWrongNoteHeader"
import MyWrongNoteDeadlineBanner from "../components/MyWrongNoteDeadlineBanner"
import MyWrongNoteFilterTabs from "../components/MyWrongNoteFilterTabs"
import MyWrongNoteExamCard from "../components/MyWrongNoteExamCard"
import MyWrongNoteListSkeleton from "../components/MyWrongNoteListSkeleton"

type Props = {
    list: ReturnType<typeof useMyWrongNoteList>
    onOpenExam: (examSessionId: number, studentExamSessionId?: number) => void
}

const MyWrongNoteListView = ({ list, onOpenExam }: Props) => {
    const { t } = useTranslation()
    const {
        summary,
        totals,
        filter,
        setFilter,
        exams,
        isLoading,
        isLoadingMore,
        isRefreshing,
        error,
        summaryError,
        refresh,
        loadMore
    } = list

    // Tick once a minute while any shown deadline is inside the due-soon window.
    const hasNearDeadline =
        isDeadlineNear(summary?.nextDeadline?.deadlineAt) ||
        exams.some(e => isDeadlineNear(e.deadlineAt))
    const nowMs = useNowTick(hasNearDeadline)

    const handleRefresh = useCallback(() => {
        refresh()
    }, [refresh])
    const handleOpenBannerExam = useCallback(
        (id: number) => onOpenExam(id),
        [onOpenExam]
    )

    const showError = !!error && !isLoading

    const renderItem = ({ item }: { item: MyExamItemResponse }) => (
        <MyWrongNoteExamCard exam={item} onOpen={onOpenExam} nowMs={nowMs} />
    )

    const renderEmpty = () => {
        if (isLoading) return <MyWrongNoteListSkeleton />
        if (showError)
            return (
                <View style={styles.center}>
                    <Text style={styles.message}>{error}</Text>
                    <TouchableOpacity style={styles.retry} onPress={handleRefresh}>
                        <Text style={styles.retryText}>
                            {t("mywrongnote_retry")}
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        return (
            <View style={styles.center}>
                <Text style={styles.message}>
                    {filter === MyExamFilter.Todo
                        ? t("mywrongnote_empty_todo")
                        : t("mywrongnote_empty_all")}
                </Text>
            </View>
        )
    }

    return (
        <FlatList
            style={styles.list}
            contentContainerStyle={styles.content}
            data={exams}
            keyExtractor={item => String(item.studentExamSessionId)}
            renderItem={renderItem}
            ListHeaderComponent={
                <View>
                    <MyWrongNoteHeader summary={summary} />
                    <MyWrongNoteDeadlineBanner
                        summary={summary}
                        onOpenExam={handleOpenBannerExam}
                        nowMs={nowMs}
                    />
                    {summaryError ? (
                        <TouchableOpacity onPress={handleRefresh}>
                            <Text style={styles.summaryError}>
                                {summaryError} · {t("mywrongnote_retry")}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                    <MyWrongNoteFilterTabs
                        filter={filter}
                        totals={totals}
                        onChange={setFilter}
                    />
                </View>
            }
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={
                isLoadingMore ? (
                    <ActivityIndicator
                        style={styles.footer}
                        color={palette.main[500]}
                    />
                ) : null
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor={palette.main[500]}
                    colors={[palette.main[500]]}
                />
            }
            showsVerticalScrollIndicator={false}
        />
    )
}

export default MyWrongNoteListView

const styles = ScaledSheet.create({
    list: {
        flex: 1,
        backgroundColor: palette.grey[50]
    },
    content: {
        padding: "16@ms",
        paddingBottom: "32@ms",
        flexGrow: 1
    },
    center: {
        alignItems: "center",
        paddingVertical: "40@ms",
        gap: "12@ms"
    },
    message: {
        ...TYPO.body2,
        color: palette.grey[500],
        textAlign: "center"
    },
    summaryError: {
        ...TYPO.body3,
        color: palette.error.dark,
        marginTop: "8@ms"
    },
    retry: {
        paddingHorizontal: "18@ms",
        paddingVertical: "10@ms",
        borderRadius: "10@ms",
        backgroundColor: palette.main[500]
    },
    retryText: {
        ...TYPO.button3,
        color: palette.common.white
    },
    footer: {
        paddingVertical: "16@ms"
    }
})
