import { useState, useEffect, useMemo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { getOverallCategoriesResultsApi } from "../apiClients"
import { ExamResult, OverallCategoryData } from "@/utils/types"
import { checkData, getPercentage } from "../configs/helpers"

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
                else {
                    const res = await getOverallCategoriesResultsApi(examCode, +(studentExamSessionId || 0), useSubcategories)
                        
                    setOverallData(res.data?.data?.slice(0, 6) ?? [])
                }
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
        if (!overallData) return ["", "", "", "", "", ""]
        return overallData.map(i => i.categoryName)
    }, [overallData])

    const shortCategories = useMemo(() => {
        if (!overallData) return ["", "", "", "", "", ""]
        return overallData.map(i => i.categoryName.slice(0, 4) + "...")
    }, [overallData])

    const xAxisLabelFormatter = useCallback(
        (_: string, { dataPointIndex }: any) => {
            if(dataPointIndex === 0 || dataPointIndex === 3) return categories[dataPointIndex]
            const texts = categories[dataPointIndex]?.split(" ") ?? []
            const middle = Math.floor(texts.length / 2)
            return [texts.slice(0, middle), texts.slice(middle)]
        },
        [JSON.stringify(categories)]
    )

    const formatTooltip = useCallback(
        (dataProps: any) => {
            const dataPointIndex = dataProps?.dataPointIndex
            const label = categories[dataPointIndex]
            if (!label) return ""
            const data = overallData?.[dataPointIndex]
            const myValue = `${(!data?.totalQuestions ? 0 : (data?.totalCorrectQuestions * 100) / data.totalQuestions)?.toFixed(2) ?? 0}%`
            const avgValue = `${(!data?.totalQuestions ? 0 : (data?.avgCorrectQuestions * 100) / data.totalQuestions)?.toFixed(2) ?? 0}%`

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
                        <Text style={{ fontWeight: 'bold' }}>${label}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ marginRight: 4, fontWeight: 'bold', color: colors?.[0] || '#4CAF50' }}>
                        {t("my_data")}:
                        </Text>
                        <Text>{myValue}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ marginRight: 4, fontWeight: 'bold', color: colors?.[1] || '#F44336' }}>
                        {t("avg_data")}:
                        </Text>
                        <Text>${avgValue}</Text>
                    </View>
                    </View>`
        },
        [t, JSON.stringify(overallData), JSON.stringify(categories)]
    )
    return {
        isLoading,
        myData,
        avgData,
        shortCategories,
        categories,
        xAxisLabelFormatter,
        formatTooltip
    }
}

export default useCategoriesOverallChartContainer
