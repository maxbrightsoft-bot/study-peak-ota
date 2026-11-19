import { api } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"
import {
    ExamThreadResponse,
    MyExamDetailQuery,
    MyExamDetailResponse,
    MyExamListResponse,
    MyExamsQuery,
    MyExamTotalsResponse,
    MyWrongNoteSummaryResponse
} from "../configs/types"

const MY_WRONG_NOTE_URL = `${BASE_URL}/api/my-wrong-note`

export const getMyWrongNoteSummaryApi = () =>
    api.get<MyWrongNoteSummaryResponse>(`${MY_WRONG_NOTE_URL}/summary`)

export const getMyWrongNoteExamsApi = (query: MyExamsQuery) =>
    api.get<MyExamListResponse>(`${MY_WRONG_NOTE_URL}/exams`, { params: query })

export const getMyWrongNoteExamTotalsApi = () =>
    api.get<MyExamTotalsResponse>(`${MY_WRONG_NOTE_URL}/exams/totals`)

export const getMyWrongNoteExamApi = (
    examSessionId: number,
    query?: MyExamDetailQuery
) =>
    api.get<MyExamDetailResponse>(
        `${MY_WRONG_NOTE_URL}/exams/${examSessionId}`,
        { params: query }
    )

export const getExamThreadApi = (
    studentExamSessionId: number,
    questionId: number
) =>
    api.get<ExamThreadResponse>(`${BASE_URL}/api/conversation/exam-thread`, {
        params: { studentExamSessionId, questionId }
    })
