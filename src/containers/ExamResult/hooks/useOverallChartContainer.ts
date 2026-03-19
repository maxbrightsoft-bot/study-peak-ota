import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
    getOverallResultsApi,
} from "../apiClients"
import { OverallExamResultResponse } from "@/utils/types"
import { checkData, getPercentage } from "../configs/helpers"

const useOverallChartContainer = (
    examCode: string,
    studentExamSessionId: string,
    code: string,
    chapterId: number,
    isGetDataResult: boolean = true
) => {
    const { t } = useTranslation()
    const [isLoading, setLoading] = useState<boolean>(false)
    const [overallData, setOverallData] = useState<OverallExamResultResponse>()
    useEffect(() => {
        const fetchData = async () => {
            if (checkData(overallData) || !isGetDataResult) return
            setLoading(true)
            try {
                if (chapterId) return
                else {
                    const res = await getOverallResultsApi(examCode, +(studentExamSessionId || 0))

                    setOverallData(res.data)
                }
            } catch (error) {
                console.log(error)
            }
            setLoading(false)
        }
        fetchData()
    }, [examCode, code, studentExamSessionId, isGetDataResult, JSON.stringify(overallData)])

    const myData = useMemo(() => {
        if (!overallData || !overallData.data[0]) return [0, 0, 0, 0, 0, 0]
        const highLevelQuestions = getPercentage(overallData.data[0].highLevelQuestions, overallData.maxData.highLevelQuestions)
        const lowLevelQuestions = getPercentage(overallData.data[0].lowLevelQuestions, overallData.maxData.lowLevelQuestions)
        const questionLongestTime = getPercentage(overallData.data[0].questionLongestTime, overallData.maxData.questionLongestTime)
        const problemSolvingTime = getPercentage(overallData.data[0].problemSolvingTime, overallData.maxData.problemSolvingTime)
        const totalAsteriskQuestions = getPercentage(overallData.data[0].totalAsteriskQuestions, overallData.maxData.totalAsteriskQuestions)

        return [
            overallData.data[0].correctRate,
            highLevelQuestions,
            questionLongestTime,
            problemSolvingTime,
            totalAsteriskQuestions,
            lowLevelQuestions
        ]
    }, [JSON.stringify(overallData)])
    const avgData = useMemo(() => {
        if (!overallData || !overallData.data[1]) return [0, 0, 0, 0, 0, 0]
        const highLevelQuestions = getPercentage(overallData.data[1].highLevelQuestions, overallData.maxData.highLevelQuestions)
        const lowLevelQuestions = getPercentage(overallData.data[1].lowLevelQuestions, overallData.maxData.lowLevelQuestions)
        const questionLongestTime = getPercentage(overallData.data[1].questionLongestTime, overallData.maxData.questionLongestTime)
        const problemSolvingTime = getPercentage(overallData.data[1].problemSolvingTime, overallData.maxData.problemSolvingTime)
        const totalAsteriskQuestions = getPercentage(overallData.data[1].totalAsteriskQuestions, overallData.maxData.totalAsteriskQuestions)

        return [
            overallData.data[1].correctRate,
            highLevelQuestions,
            questionLongestTime,
            problemSolvingTime,
            totalAsteriskQuestions,
            lowLevelQuestions
        ]
    }, [JSON.stringify(overallData)])

    const categories = [
        t("correct_rate"),
        t("high_level"),
        t("longest_time"),
        t("solving_time"),
        t("asterisks"),
        t("low_level")
    ]

    const shortCategories = categories.map(i => i.slice(0, 4) + "...")

    const xAxisLabelFormatter = useCallback(
        (_: string, data: any) => {
            const dataPointIndex = data?.dataPointIndex
            if (dataPointIndex === 0 || dataPointIndex === 3) return categories[dataPointIndex]
            const texts = categories[dataPointIndex]?.split(" ") ?? []
            const middle = Math.floor(texts.length / 2)
            return [texts.slice(0, middle), texts.slice(middle)]
        },
        [JSON.stringify(categories)]
    )

    const formatTooltip = useCallback(
        (dataProps: any) => {
            const dataPointIndex = dataProps?.dataPointIndex
            const label = categories?.[dataPointIndex]
            let myValue = ""
            let avgValue = ""

            switch (dataPointIndex) {
                case 1:
                    myValue = `${t("n_questions", { total: overallData?.data[0]?.highLevelQuestions ?? 0 })}`
                    avgValue = `${t("n_questions", { total: overallData?.data[1]?.highLevelQuestions?.toFixed(2) ?? 0 })}`
                    break
                case 2:
                    myValue = `${t("n_seconds", { sec: ((overallData?.data[0]?.questionLongestTime ?? 0) / 1000).toFixed(2) })}`
                    avgValue = `${t("n_seconds", { sec: ((overallData?.data[1]?.questionLongestTime ?? 0) / 1000).toFixed(2) })}`
                    break
                case 3:
                    myValue = `${t("n_seconds", { sec: ((overallData?.data[0]?.problemSolvingTime ?? 0) / 1000).toFixed(2) })}`
                    avgValue = `${t("n_seconds", { sec: ((overallData?.data[1]?.problemSolvingTime ?? 0) / 1000).toFixed(2) })}`
                    break
                case 4:
                    myValue = `${t("n_questions", { total: overallData?.data[0]?.totalAsteriskQuestions ?? 0 })}`
                    avgValue = `${t("n_questions", { total: overallData?.data[1]?.totalAsteriskQuestions?.toFixed(2) ?? 0 })}`
                    break
                case 5:
                    myValue = `${t("n_questions", { total: overallData?.data[0]?.lowLevelQuestions ?? 0 })}`
                    avgValue = `${t("n_questions", { total: overallData?.data[1]?.lowLevelQuestions?.toFixed(2) ?? 0 })}`
                    break
                default:
                    myValue = `${overallData?.data[0]?.correctRate?.toFixed(2) ?? 0}%`
                    avgValue = `${overallData?.data[1]?.correctRate?.toFixed(2) ?? 0}%`
                    break
            }

            return `<View style={{
                        padding: 8,
                        backgroundColor: '#fff',
                        borderRadius: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        minWidth: 120,
                        }}>
                        <View style={{
                            borderBottomWidth: 1,
                            borderBottomColor: '#f3f3f3',
                            marginBottom: 4,
                            paddingBottom: 4,
                        }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 14 }}>${label}</Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginVertical: 2,
                        }}>
                            <Text style={{
                            marginRight: 4,
                            fontWeight: 'bold',
                            fontSize: 12,
                            color: colors && colors[0] ? colors[0] : '#4CAF50',
                            }}>
                            {t("my_data")}:
                            </Text>
                            <Text style={{ fontSize: 12 }}>${myValue}</Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginVertical: 2,
                        }}>
                            <Text style={{
                            marginRight: 4,
                            fontWeight: 'bold',
                            fontSize: 12,
                            color: colors && colors[1] ? colors[1] : '#F44336',
                            }}>
                            {t("avg_data")}:
                            </Text>
                            <Text style={{ fontSize: 12 }}>${avgValue}</Text>
                        </View>
                        </View>`
        },
        [t, JSON.stringify(overallData)]
    )
    return {
        isLoading,
        myData,
        avgData,
        categories,
        shortCategories,
        xAxisLabelFormatter,
        formatTooltip
    }
}

export default useOverallChartContainer
