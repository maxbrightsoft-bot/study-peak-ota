import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState
} from "react"
import { useTranslation } from "react-i18next"
import _ from "lodash"
import { NoteResponse, NoteSearchQuery } from "@/utils/types"
import { getErrorMessage, toast } from "@/utils/helpers"
import { getNotesApi } from "../../ExamResultList/apiClients/noteService"
import { useFocusEffect } from "@react-navigation/native"

const useNotes = (
    setFilter: Dispatch<SetStateAction<NoteSearchQuery | undefined>>,
    filter?: NoteSearchQuery
) => {
    const { t } = useTranslation()
    const [totalPages, setTotalPages] = useState<number>(0)
    const [notes, setNotes] = useState<NoteResponse[]>([])
    const [isLoadingNotes, setLoadingNotes] = useState<boolean>(false)

    const handleLoadChange = (bool: boolean) => {
        setLoadingNotes(bool)
    }

    const getNotes = async () => {
        if (!filter || !filter.currentPage) {
            setNotes([])
            return
        }
        if (isLoadingNotes) return
        setLoadingNotes(true)
        try {
            const res = await getNotesApi(filter)
            const data = res.data
            setTotalPages(data?.totalPages || 0)
            const items: NoteResponse[] = data?.items || []
            let newNotes: NoteResponse[] = items

            if (filter?.currentPage && filter?.currentPage > 1) {
                newNotes = [..._.uniqBy([...notes, ...items], "id")] as NoteResponse[]
            }
            setNotes(newNotes)
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        finally {
            setLoadingNotes(false)
        }
    }
    const handleLoadMore = useCallback(() => {
        if (
            !filter ||
            !filter.currentPage ||
            filter?.currentPage >= totalPages
        ) {
            return
        }
        setFilter((state?: NoteSearchQuery) => ({
            ...state,
            currentPage: (state?.currentPage || 0) + 1
        }))
    }, [filter?.currentPage, totalPages])

    const handleNoteAdded = (note: NoteResponse) => {
        const newNotes: NoteResponse[] = [..._.uniqBy([note, ...notes], "id")] as NoteResponse[]
        setNotes(newNotes)
    }

    const handleNoteUpdated = (note: NoteResponse) => {
        const newNotes: NoteResponse[] = notes.map(n => (n.id !== note.id ? n : note))
        setNotes(newNotes)
    }

    const handleNoteRemoved = (note: NoteResponse) => {
        const newNotes: NoteResponse[] = notes.filter(n => n.id !== note.id)
        setNotes(newNotes)
    }

    useEffect(() => {
        getNotes()
    }, [JSON.stringify(filter)])

    useFocusEffect(
        useCallback(() => {
            getNotes()
        }, [])
    );

    return {
        t,
        notes,
        handleLoadChange,
        isLoadingNotes,
        handleLoadMore,
        handleNoteAdded,
        handleNoteRemoved,
        handleNoteUpdated
    }
}

export default useNotes
