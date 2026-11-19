import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react"
import { useTranslation } from "react-i18next"
import _ from "lodash"
import { NoteResponse, NoteSearchQuery } from "@/utils/types"
import { getErrorMessage, toast } from "@/utils/helpers"
import { resequenceAfterRemoval } from "@/utils/helpers/noteOrder"
import { getNotesApi } from "../../ExamResultList/apiClients/noteService"
import { useFocusEffect } from "@react-navigation/native"
import {
    canLoadMoreNotes,
    isNewNotesQuery,
    isCurrentNotesResponse,
    isNotesRequestInFlight,
    mergeNotesPage,
    notesFilterKey,
    NotesRequest
} from "../configs/notesRequestGuard"

const useNotes = (
    setFilter: Dispatch<SetStateAction<NoteSearchQuery | undefined>>,
    filter?: NoteSearchQuery
) => {
    const { t } = useTranslation()
    const [totalPages, setTotalPages] = useState<number>(0)
    const [notes, setNotes] = useState<NoteResponse[]>([])
    const [isLoadingNotes, setLoadingNotes] = useState<boolean>(false)

    // G4: focus and filter changes always fetch with the latest filter; a response for a filter that is
    // no longer current (another attempt, cleared filter) or superseded by a newer request is dropped.
    const filterRef = useRef(filter)
    filterRef.current = filter
    const requestSeqRef = useRef(0)
    const inFlightRef = useRef<NotesRequest | null>(null)

    // RV-209: a new query (another attempt / exam, not just the next page) drops the previous list during
    // render, so it is never shown, also when the new request fails.
    const [shownQuery, setShownQuery] = useState(filter)
    if (isNewNotesQuery(shownQuery, filter)) {
        setShownQuery(filter)
        setNotes([])
        setTotalPages(0)
    }

    const handleLoadChange = (bool: boolean) => {
        setLoadingNotes(bool)
    }

    const getNotes = useCallback(async () => {
        const current = filterRef.current
        const key = notesFilterKey(current)
        if (!current || key === null) {
            // Invalidate anything still in flight for a previous filter.
            requestSeqRef.current += 1
            inFlightRef.current = null
            setNotes([])
            setLoadingNotes(false)
            return
        }
        if (isNotesRequestInFlight(key, inFlightRef.current)) return
        requestSeqRef.current += 1
        const request: NotesRequest = { seq: requestSeqRef.current, key }
        inFlightRef.current = request
        setLoadingNotes(true)
        const isCurrent = () =>
            isCurrentNotesResponse(
                request,
                notesFilterKey(filterRef.current),
                requestSeqRef.current
            )
        try {
            const res = await getNotesApi(current)
            if (!isCurrent()) return
            const data = res.data
            setTotalPages(data?.totalPages || 0)
            const items: NoteResponse[] = data?.items || []
            setNotes(prev => mergeNotesPage(prev, items, current.currentPage))
        } catch (error) {
            if (!isCurrent()) return
            toast.error(getErrorMessage(t, error))
        } finally {
            if (inFlightRef.current?.seq === request.seq) {
                inFlightRef.current = null
                setLoadingNotes(false)
            }
        }
    }, [t])

    const handleLoadMore = useCallback(() => {
        // RV-202: onEndReached can fire twice; never advance while a page is loading.
        if (
            !canLoadMoreNotes(
                filter?.currentPage,
                totalPages,
                inFlightRef.current
            )
        ) {
            return
        }
        setFilter((state?: NoteSearchQuery) => ({
            ...state,
            currentPage: (state?.currentPage || 0) + 1
        }))
    }, [filter?.currentPage, totalPages])

    const handleNoteAdded = (note: NoteResponse) => {
        setNotes(prev => _.uniqBy([note, ...prev], "id") as NoteResponse[])
    }

    const handleNoteUpdated = (note: NoteResponse) => {
        setNotes(prev => prev.map(n => (n.id !== note.id ? n : note)))
    }

    // H1: renumber the question's remaining notes 1..N right away (the server does the same on delete).
    const handleNoteRemoved = (note: NoteResponse) => {
        setNotes(prev => resequenceAfterRemoval(prev, note))
    }

    const filterKey = JSON.stringify(filter)
    useEffect(() => {
        getNotes()
    }, [filterKey, getNotes])

    // Refetch on focus (e.g. back from another tab/screen) with the current filter, not the first render's.
    useFocusEffect(
        useCallback(() => {
            getNotes()
        }, [getNotes])
    )

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
