import { api } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"
import { getIdLinkAccount } from "@/utils/helpers"
import { NoteRequest, NoteSearchQuery } from "@/utils/types"

const NOTES_URL = `${BASE_URL}/api/notes`

export const getNotesApi = (query: NoteSearchQuery) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${NOTES_URL}`, {
        params: {
            ...query,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};

export const getGroupedNotesApi = (query: NoteSearchQuery) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${NOTES_URL}/grouped`, {
        params: {
            ...query,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};

export const getNotesByGroupApi = (query: NoteSearchQuery) => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${NOTES_URL}/group-notes`, {
        params: {
            ...query,
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};

export const getNoteFilterOptionsApi = () => {
    const idLinkAccount = getIdLinkAccount();
    return api.get(`${NOTES_URL}/filter-options`, {
        params: {
            ...(idLinkAccount ? { idLinkAccount } : {})
        }
    });
};
export const createNoteApi = (note: NoteRequest) =>
    api.post(`${NOTES_URL}`, note)

export const updateNoteApi = (id: number, data: NoteRequest) =>
    api.put(`${NOTES_URL}/${id}`, data)

export const deleteNoteApi = (id: number) => api.delete(`${NOTES_URL}/${id}`)
