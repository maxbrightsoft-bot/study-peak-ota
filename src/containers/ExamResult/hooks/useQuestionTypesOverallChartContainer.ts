import { ExamResult } from "@/utils/types"
import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { OverallQuestionTypeData } from "../configs/types"
import { SubjectType } from "@/utils/enums"
import { checkData, getPercentage } from "../configs/helpers"
import { getOverallQuestionTypesResultsApi } from "../apiClients"
import useAuthStore from "@/store/useAuthStore"
import { Language } from "@/utils/enums"

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
    const { language } = useAuthStore()
    const isKorean = language?.code === Language.ko;

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
                const res = await getOverallQuestionTypesResultsApi(examCode, +(studentExamSessionId || 0))
                setOverallData(res.data?.data?.slice(0, 6) ?? [])
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
        if (!overallData?.length) return ["", "", "", "", "", ""]
        return overallData.map(i => i.name)
    }, [JSON.stringify(overallData)])

    const shortCategories = useMemo(() => {
        if (!overallData?.length) return ["", "", "", "", "", ""]
        return overallData.map(i => i.name.slice(0, 4) + "...")
    }, [JSON.stringify(overallData)])

    const xAxisLabels = useMemo(() => {
        return categories.map((label, index) => {
            if (index === 0 || index === 3) return [label]
            return label.split(" ")
        })
    }, [JSON.stringify(categories)])

    const tooltipData = useMemo(() => {
        return categories.map((label, index) => {
            const data = overallData?.[index]
            const myValue = `${(!data?.totalQuestions ? 0 : (data.totalCorrectQuestions * 100) / data.totalQuestions).toFixed(2)}%`
            const avgValue = `${(!data?.totalQuestions ? 0 : (data.avgCorrectQuestions * 100) / data.totalQuestions).toFixed(2)}%`
            return { label, myValue, avgValue }
        })
    }, [JSON.stringify(overallData), JSON.stringify(categories)])

    return {
        isLoading,
        myData,
        avgData,
        categories: isKorean ? categories : shortCategories,
        xAxisLabels,
        tooltipData,
    }
}

export default useQuestionTypesOverallChartContainer