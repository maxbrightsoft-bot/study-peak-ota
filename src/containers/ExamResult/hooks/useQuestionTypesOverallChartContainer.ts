import { ExamResult } from "@/utils/types"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { OverallQuestionTypeData } from "../configs/types"
import { SubjectType } from "@/utils/enums"
import { checkData, getPercentage } from "../configs/helpers"
import { getOverallQuestionTypesResultsApi } from "../apiClients"

const useQuestionTypesOverallChartContainer = (
    examResultData: ExamResult | undefined,
    examCode: string,
    studentExamSessionId: string,
    chapterId: number,
    isGetDataResult: boolean = true
) => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [overallData, setOverallData] = useState<OverallQuestionTypeData[]>([])
    const { t } = useTranslation()

    useEffect(() => {
        if (examCode && studentExamSessionId) setOverallData([])
    }, [examCode, studentExamSessionId])

    useEffect(() => {
        const fetchData = async () => {
            if (!examResultData || examResultData.type !== SubjectType.Math || checkData(overallData) || !isGetDataResult)
                return
            setLoading(true)
            try {
                if (chapterId) return
                else {
                    const res = await getOverallQuestionTypesResultsApi(examCode, +(studentExamSessionId || 0))
                    setOverallData(res.data?.data?.slice(0, 6) ?? [])
                }
            } catch (error) {
                console.log(error)
            }
            setLoading(false)
        }
        fetchData()
    }, [examCode, isGetDataResult, examResultData?.type, examResultData?.examSessionId, JSON.stringify(overallData), studentExamSessionId])

    const myData = useMemo(() => {
        if (!overallData?.length) return [0, 0, 0, 0, 0, 0]
        return overallData.map(i => getPercentage(i.totalCorrectQuestions, i.totalQuestions))
    }, [JSON.stringify(overallData)])

    const avgData = useMemo(() => {
        if (!overallData?.length) return [0, 0, 0, 0, 0, 0]
        return overallData.map(i => getPercentage(i.avgCorrectQuestions, i.totalQuestions))
    }, [JSON.stringify(overallData)])

    const categories = useMemo(() => {
        if (!overallData) return ["", "", "", "", "", ""]
        return overallData.map(i => i.name)
    }, [overallData])

    const shortCategories = useMemo(() => {
        if (!overallData) return ["", "", "", "", "", ""]
        return overallData.map(i => i.name.slice(0, 4) + "...")
    }, [overallData])

    const xAxisLabelFormatter = useCallback(
        (_: string, { dataPointIndex }: any) => {
            if (dataPointIndex === 0 || dataPointIndex === 3) return categories[dataPointIndex]
            const texts = categories[dataPointIndex]?.split(" ") ?? []
            return texts
        },
        [JSON.stringify(categories)]
    )

    const formatTooltip = useCallback(
        ({ dataPointIndex, w }: any) => {
            const label = categories[dataPointIndex]
            if (!label) return ""
            const data = overallData?.[dataPointIndex]
            const myValue = `${(!data?.totalQuestions ? 0 : (data?.totalCorrectQuestions * 100) / data.totalQuestions)?.toFixed(2) ?? 0}%`
            const avgValue = `${(!data?.totalQuestions ? 0 : (data?.avgCorrectQuestions * 100) / data.totalQuestions)?.toFixed(2) ?? 0}%`

            return `<div style="padding: 8px; background: #fff; border-radius: 4px;">
                    <div style="border-bottom: 1px solid #f3f3f3; margin-bottom: 4px"><strong>${label}</strong></div>
                    <div style="display: flex; justify-content: space-between">
                        <p style="margin-right: 4px"><strong style="color: ${w.globals.colors[0]}">${t("my_data")}:</strong></p>
                        <p>${myValue}</p>
                    </div>
                    <div style="display: flex; justify-content: space-between">
                        <p style="margin-right: 4px"><strong style="color: ${w.globals.colors[1]}">${t("avg_data")}:</strong></p>
                        <p>${avgValue}</p>
                    </div>
                </div>`
        },
        [t, JSON.stringify(overallData), JSON.stringify(categories)]
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

export default useQuestionTypesOverallChartContainer
