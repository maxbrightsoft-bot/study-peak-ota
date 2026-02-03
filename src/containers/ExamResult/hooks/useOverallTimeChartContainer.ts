import { useState, useEffect } from "react"
import {
    getQuestionTimeCategoriesResultsApi,
} from "../apiClients"
import { QuestionTimeCategoryData } from "@/utils/types"
import { checkData } from "../configs/helpers"

const useOverallTimeChartContainer = (
    examCode: string,
    studentExamSessionId: string,
    chapterId: number,
    isGetDataResult: boolean = true
) => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [categories, setCategories] = useState<QuestionTimeCategoryData[]>([])

    useEffect(() => {
        const fetchData = async () => {
            if (checkData(categories) || !isGetDataResult) return
            setLoading(true)
            try {
                if (chapterId) return
                else {
                    const res = await getQuestionTimeCategoriesResultsApi(examCode, +(studentExamSessionId || 0))
                        
                    setCategories(res.data?.data ?? [])
                }
            } catch (error) {
                console.log(error)
            }
            setLoading(false)
        }
        fetchData()
    }, [examCode, isGetDataResult, JSON.stringify(categories), studentExamSessionId])
    return {
        isLoading,
        categories
    }
}

export default useOverallTimeChartContainer
