import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
    getOverallResultsApi,
} from "../apiClients"
import { OverallExamResultResponse } from "@/utils/types"
import { checkData, getPercentage } from "../configs/helpers"
import { formatTimeSecond } from "@/utils/helpers"
import useAuthStore from "@/store/useAuthStore"
import { Language } from "@/utils/enums"

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
    const language = useAuthStore(state => state.language)
    const isKorean = language?.code === Language.ko;

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
        const questionLongestTime = overallData.data[0].questionLongestTime > overallData.maxData.questionLongestTime ? 100 : getPercentage(overallData.data[0].questionLongestTime, overallData.maxData.questionLongestTime)
        const problemSolvingTime = overallData.data[0].problemSolvingTime > overallData.maxData.problemSolvingTime ? 100 : getPercentage(overallData.data[0].problemSolvingTime, overallData.maxData.problemSolvingTime)
        const totalAsteriskQuestions = overallData.data[0].totalAsteriskQuestions > overallData.maxData.totalAsteriskQuestions ? 100 : getPercentage(overallData.data[0].totalAsteriskQuestions, overallData.maxData.totalAsteriskQuestions)

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
        const questionLongestTime = overallData.data[0].questionLongestTime > overallData.maxData.questionLongestTime ? getPercentage(overallData.data[1].questionLongestTime, overallData.data[0].questionLongestTime) : getPercentage(overallData.data[1].questionLongestTime, overallData.maxData.questionLongestTime)
        const problemSolvingTime = overallData.data[0].problemSolvingTime > overallData.maxData.problemSolvingTime ? getPercentage(overallData.data[1].problemSolvingTime, overallData.data[0].problemSolvingTime) : getPercentage(overallData.data[1].problemSolvingTime, overallData.maxData.problemSolvingTime)
        const totalAsteriskQuestions = overallData.data[0].totalAsteriskQuestions > overallData.maxData.totalAsteriskQuestions ? getPercentage(overallData.data[1].totalAsteriskQuestions, overallData.data[0].totalAsteriskQuestions) : getPercentage(overallData.data[1].totalAsteriskQuestions, overallData.maxData.totalAsteriskQuestions)

        return [
            overallData.data[1].correctRate,
            highLevelQuestions,
            questionLongestTime,
            problemSolvingTime,
            totalAsteriskQuestions,
            lowLevelQuestions
        ]
    }, [JSON.stringify(overallData)])

    const categories = useMemo(() => [
        t("correct_rate"),
        t("high_level"),
        t("longest_time"),
        t("solving_time"),
        t("asterisks"),
        t("low_level")
    ], [t])

    const shortCategories = useMemo(() => categories.map(i => i.slice(0, 4) + "..."), [categories])

    const xAxisLabels = useMemo(() => {
        return categories.map((label, index) => {
            if (index === 0 || index === 3) return [label]
            const texts = label.split(" ")
            const middle = Math.floor(texts.length / 2)
            return [texts.slice(0, middle).join(" "), texts.slice(middle).join(" ")]
        })
    }, [categories])

    const tooltipData = useMemo(() => {
        return categories.map((label, index) => {
            let myValue = ""
            let avgValue = ""

            switch (index) {
                case 1:
                    myValue = `${t("n_questions", { total: `${overallData?.data[0]?.highLevelQuestions ?? 0}/${overallData?.maxData.highLevelQuestions ?? 0}` })}`
                    avgValue = `${t("n_questions", { total: `${Math.round(overallData?.data[1]?.highLevelQuestions ?? 0)}/${overallData?.maxData.highLevelQuestions ?? 0}`})}`
                    break
                case 2:
                    myValue = formatTimeSecond((overallData?.data[0]?.questionLongestTime ?? 0) / 1000, t)
                    avgValue = formatTimeSecond((overallData?.data[1]?.questionLongestTime ?? 0) / 1000, t)
                    break
                case 3:
                    myValue = formatTimeSecond((overallData?.data[0]?.problemSolvingTime ?? 0) / 1000, t)
                    avgValue = formatTimeSecond((overallData?.data[1]?.problemSolvingTime ?? 0) / 1000, t)
                    break
                case 4:
                    myValue = `${t("n_questions", { total: `${overallData?.data[0]?.totalAsteriskQuestions ?? 0}/${overallData?.maxData.totalAsteriskQuestions ?? 0}` })}`
                    avgValue = `${t("n_questions", { total: `${Math.round(overallData?.data[1]?.totalAsteriskQuestions ?? 0)}/${overallData?.maxData.totalAsteriskQuestions ?? 0}` })}`
                    break
                case 5:
                    myValue = `${t("n_questions", { total: `${overallData?.data[0]?.lowLevelQuestions ?? 0}/${overallData?.maxData.lowLevelQuestions ?? 0}` })}`
                    avgValue = `${t("n_questions", { total: `${Math.round(overallData?.data[1]?.lowLevelQuestions ?? 0)}/${overallData?.maxData.lowLevelQuestions ?? 0}` })}`
                    break
                default:
                    myValue = `${overallData?.data[0]?.correctRate?.toFixed(2) ?? 0}%`
                    avgValue = `${overallData?.data[1]?.correctRate?.toFixed(2) ?? 0}%`
                    break
            }

            return { label, myValue, avgValue }
        })
    }, [t, categories, JSON.stringify(overallData)])


    return useMemo(() => ({
        isLoading,
        myData,
        avgData,
        categories: isKorean ? categories : shortCategories,
        xAxisLabels,
        tooltipData
    }), [isLoading, myData, avgData, categories, shortCategories, xAxisLabels, tooltipData, isKorean])
}

export default useOverallChartContainer
