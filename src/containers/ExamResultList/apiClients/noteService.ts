import { api } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"
import { NoteRequest, NoteSearchQuery } from "@/utils/types"

const NOTES_URL = `${BASE_URL}/api/notes`

export const getNotesApi = (query: NoteSearchQuery) =>
    api.get(`${NOTES_URL}`, {
        params: query
    })

export const getGroupedNotesApi = (query: NoteSearchQuery) =>
    api.get(`${NOTES_URL}/grouped`, {
        params: query
    })

export const getNotesByGroupApi = (query: NoteSearchQuery) =>
    api.get(`${NOTES_URL}/group-notes`, {
        params: query
    })

export const getNoteFilterOptionsApi = () => api.get(`${NOTES_URL}/filter-options`)
export const createNoteApi = (note: NoteRequest) =>
    api.post(`${NOTES_URL}`, note)

export const updateNoteApi = (id: number, data: NoteRequest) =>
    api.put(`${NOTES_URL}/${id}`, data)

export const deleteNoteApi = (id: number) => api.delete(`${NOTES_URL}/${id}`)
