import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { getOverallCategoriesResultsApi } from "../apiClients"
import { ExamResult, OverallCategoryData } from "@/utils/types"
import { checkData, getPercentage } from "../configs/helpers"
import useAuthStore from "@/store/useAuthStore"
import { Language } from "@/utils/enums"

const useCategoriesOverallChartContainer = (
    examResultData: ExamResult | undefined,
    examCode: string,
    studentExamSessionId: string,
    chapterId: number,
    useSubcategories: boolean = false,
    isGetDataResult: boolean = true
) => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [overallData, setOverallData] = useState<OverallCategoryData[]>([])
    const { t } = useTranslation()
    const { language } = useAuthStore()
    const isKorean = language?.code === Language.ko;

    useEffect(() => {
        const fetchData = async () => {
            if (
                (useSubcategories && !examResultData) ||
                checkData(overallData) ||
                !isGetDataResult
            ) return
            setLoading(true)
            try {
                if (chapterId) return
                const res = await getOverallCategoriesResultsApi(examCode, +(studentExamSessionId || 0), useSubcategories)
                setOverallData(res.data?.data?.slice(0, 6) ?? [])
            } catch (error) {
                console.log(error)
            }
            setLoading(false)
        }
        fetchData()
    }, [useSubcategories, examCode, isGetDataResult, examResultData?.type, studentExamSessionId, examResultData?.examSessionId, JSON.stringify(overallData)])

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
        return overallData.map(i => i.categoryName)
    }, [JSON.stringify(overallData)])

    const shortCategories = useMemo(() => {
        if (!overallData?.length) return ["", "", "", "", "", ""]
        return overallData.map(i => i.categoryName.slice(0, 4) + "...")
    }, [JSON.stringify(overallData)])

    const xAxisLabels = useMemo(() => {
        return categories.map((label, index) => {
            if (index === 0 || index === 3) return [label]
            const texts = label.split(" ")
            const middle = Math.floor(texts.length / 2)
            return [texts.slice(0, middle).join(" "), texts.slice(middle).join(" ")]
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

export default useCategoriesOverallChartContainer