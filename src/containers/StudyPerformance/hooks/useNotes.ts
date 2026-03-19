import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react"
import { useTranslation } from "react-i18next"
import _ from "lodash"
import { NoteRequest, NoteResponse, NoteSearchQuery } from "@/utils/types"
import { getErrorMessage, toast } from "@/utils/helpers"
import { getNotesApi } from "../../ExamResultList/apiClients/noteService"
import { useFocusEffect } from "@react-navigation/native"
import { DEFAULT_NOTE_FILTER } from "../configs/constants"
import { deleteNoteApi, updateNoteApi } from "../apiClients"
import { apiUploadImageFile } from "@/containers/ExamResultList/apiClients"
import { pick } from "@react-native-documents/picker"
import useAuthStore from "@/store/useAuthStore"
import { NoteSortColumn, OrderBy } from "@/utils/enums"

const useNotes = (
) => {
    const { setLoadingWithoutOverlay } = useAuthStore()
    const { t } = useTranslation()
    const [filter, setFilter] = useState<NoteSearchQuery>(DEFAULT_NOTE_FILTER)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [notes, setNotes] = useState<NoteResponse[]>([])
    const [isLoadingNotes, setLoadingNotes] = useState<boolean>(false)
    const [selectedNote, setSelectedNote] = useState<NoteResponse>()
    const [open, setOpen] = useState<boolean>(false)
    const [imageUrl, setImageUrl] = useState("")
    const [search, setSearch] = useState<string>("");
    const inputSearch = useRef<any>(null);
    const [openConfirm, setOpenConfirm] = useState<boolean>(false)
    const [subjectValue, setSubjectValue] = useState<string | null>(null)
    const [categoryValue, setCategoryValue] = useState<string | null>(null)

    const handleChangeSubject = (value: string) => {
        setSubjectValue(value)
    }

    const handleChangeCategory = (value: string) => {
        setCategoryValue(value)
    }

    const toggleConfirmDialog = () => {
        setOpenConfirm((prev) => !prev)
    }

    const onChangeSearch = (value: string) => {
        setSearch(value);
    };

    useEffect(() => {
        if (inputSearch.current) {
            clearTimeout(inputSearch.current);
        }

        inputSearch.current = setTimeout(() => {
            getNotes(search);
        }, 500);

        return () => {
            if (inputSearch.current) {
                clearTimeout(inputSearch.current);
            }
        };
    }, [search]);

    const handleUploadImage = async () => {
        try {
            const [result] = await pick({
                mode: 'open',
                allowVirtualFiles: true
            })

            setLoadingWithoutOverlay(true)
            const formData = new FormData();
            formData.append("upload", result as any);
            const res = await apiUploadImageFile(formData);
            setImageUrl(res?.data?.url)
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        setLoadingWithoutOverlay(false);
    }

    const reset = () => {
        setSelectedNote(undefined)
        setImageUrl('')
    }

    const handleOpenDialog = (item?: NoteResponse) => {
        item && setSelectedNote(item)
        setOpen(true)
    }

    const handleCloseDialog = () => {
        setOpen(false)
    }

    const handleLoadChange = (bool: boolean) => {
        setLoadingNotes(bool)
    }

    const getNotes = async (textSearch?: string) => {
        if (!filter || !filter.currentPage) {
            setNotes([])
            return
        }
        if (isLoadingNotes) return
        setLoadingWithoutOverlay(true)
        try {
            const res = await getNotesApi({ ...filter, textSearch })
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
            setLoadingWithoutOverlay(false)
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

    useEffect(() => {
        getNotes()
    }, [JSON.stringify(filter)])

    const handleSort = () => {
        const sortColumnName = NoteSortColumn.CreatedAt;
        let sortColumnDirection = OrderBy.ASC;
        if (
            filter.sortColumnName === sortColumnName &&
            filter.sortColumnDirection === OrderBy.ASC
        )
            sortColumnDirection = OrderBy.DESC;
        setFilter({
            ...filter,
            sortColumnName,
            sortColumnDirection,
            currentPage: 1,
        });
    };

    const handleDeleteNote = async () => {
        if (!selectedNote?.id) return
        handleLoadChange(true)
        try {
            await deleteNoteApi(selectedNote.id)
            toast.success(t("delete_note_successfully"))
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        finally {
            handleLoadChange(false)
            toggleConfirmDialog()
            getNotes()
            handleCloseDialog()
        }
    }

    const handleSaveNote = async (content: string) => {
        try {
            if (!selectedNote?.id) return
            if (content.trim().length === 0) return

            handleLoadChange(true)

            const data: NoteRequest = {
                content,
                imageUrl
            }

            await updateNoteApi(selectedNote.id, data)

            toast.success(t("update_note_successfully"))

        } catch (error) {
            console.log({ error });
            toast.error(getErrorMessage(t, error))
        }
        finally {
            handleLoadChange(false)
            getNotes()
            handleCloseDialog()
        }
    }

    const subjectNoteOptions = useMemo(() => {
        const unique = [...new Set(notes.map(i => i.subjectName))]
        return unique.map(i => ({ label: i, value: i }))
    }, [notes])

    const categoryNoteOptions = useMemo(() => {
        const unique = [...new Set(notes.map(i => i.categoryName))]
        return unique.map(i => ({ label: i, value: i }))
    }, [notes])

    useFocusEffect(
        useCallback(() => {
            getNotes()
        }, [])
    );

    return {
        t,
        notes,
        open,
        search,
        handleSort,
        onChangeSearch,
        handleDeleteNote,
        selectedNote,
        openConfirm,
        subjectValue,
        categoryValue,
        imageUrl,
        filter,
        handleChangeSubject,
        handleChangeCategory,
        categoryNoteOptions,
        subjectNoteOptions,
        toggleConfirmDialog,
        handleSaveNote,
        handleUploadImage,
        handleOpenDialog,
        handleCloseDialog,
        handleLoadChange,
        isLoadingNotes,
        handleLoadMore,
    }
}

export default useNotes
