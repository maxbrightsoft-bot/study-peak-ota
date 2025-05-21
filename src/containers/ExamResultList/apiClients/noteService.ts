import { api } from "@/services/apiClient"
import { BASE_URL } from "@/utils/constants"
import { NoteRequest, NoteSearchQuery } from "@/utils/types"

const NOTES_URL = `${BASE_URL}/api/notes`

export const getNotesApi = (query: NoteSearchQuery) =>
    api.get(`${NOTES_URL}`, {
        params: query
    })
export const createNoteApi = (note: NoteRequest) =>
    api.post(`${NOTES_URL}`, note)
export const updateNoteApi = (id: number, content: string) =>
    api.put(`${NOTES_URL}/${id}`, { content })
export const deleteNoteApi = (id: number) => api.delete(`${NOTES_URL}/${id}`)
