import { useState, useEffect } from "react"
import {
    getQuestionTimeCategoriesResultsApi,
} from "../apiClients"
import { QuestionTimeCategoryData } from "@/utils/types"

const useOverallTimeChartContainer = (
    examCode: string,
    examSessionId: number,
    chapterId: number,
) => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [categories, setCategories] = useState<QuestionTimeCategoryData[]>([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                if (chapterId) return
                else {
                    const res = await getQuestionTimeCategoriesResultsApi(examCode)
                        
                    setCategories(res.data?.data ?? [])
                }
            } catch (error) {
                console.log(error)
            }
            setLoading(false)
        }
        fetchData()
    }, [examCode, examSessionId])
    return {
        isLoading,
        categories
    }
}

export default useOverallTimeChartContainer
