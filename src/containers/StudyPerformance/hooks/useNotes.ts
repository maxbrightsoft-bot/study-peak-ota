import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react"
import { useTranslation } from "react-i18next"
import _ from "lodash"
import { GroupedNoteResponse, NoteRequest, NoteResponse, NoteSearchQuery } from "@/utils/types"
import { getErrorMessage, toast } from "@/utils/helpers"
import { getGroupedNotesApi, getNoteFilterOptionsApi } from "../../ExamResultList/apiClients/noteService"
import { useFocusEffect } from "@react-navigation/native"
import { DEFAULT_NOTE_FILTER } from "../configs/constants"
import { deleteNoteApi, updateNoteApi } from "../apiClients"
import { apiUploadImageFile } from "@/containers/ExamResultList/apiClients"
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from "@/store/useAuthStore"
import { NoteSortColumn, OrderBy } from "@/utils/enums"

const useNotes = (
) => {
    const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
    const { t } = useTranslation()
    const [filter, setFilter] = useState<NoteSearchQuery>(DEFAULT_NOTE_FILTER)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [notes, setNotes] = useState<GroupedNoteResponse[]>([])
    const [isLoadingNotes, setLoadingNotes] = useState<boolean>(false)
    const [selectedNote, setSelectedNote] = useState<NoteResponse>()
    const [open, setOpen] = useState<boolean>(false)
    const [imageUrl, setImageUrl] = useState("")
    const uploadedUrlRef = useRef("")
    const uploadPromiseRef = useRef<Promise<any> | null>(null)
    const [search, setSearch] = useState<string>("");
    const inputSearch = useRef<any>(null);
    const [openConfirm, setOpenConfirm] = useState<boolean>(false)
    const [refreshGroup, setRefreshGroup] = useState<{subjectName?: string, categoryName?: string, key: number}>({key: 0})

    const removeGroup = (subjectName?: string, categoryName?: string) => {
        setNotes(prev => prev.filter(n =>
            !((n.subjectName || '') === (subjectName || '') &&
              (n.categoryName || '') === (categoryName || ''))
        ))
    }
    const [subjectValue, setSubjectValue] = useState<string[]>([])
    const [categoryValue, setCategoryValue] = useState<string | null>(null)
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false)
    const [subjectNoteOptions, setSubjectNoteOptions] = useState<{label: string, value: string | number, id?: number}[]>([])
    const [categoryNoteOptions, setCategoryNoteOptions] = useState<{label: string, value: string | number, id?: number, children?: {label: string, value: string | number, id?: number}[]}[]>([])

    const openFilter = () => setIsFilterVisible(true)
    const closeFilter = () => setIsFilterVisible(false)

    const fetchFilterOptions = async () => {
        try {
            const res = await getNoteFilterOptionsApi()
            const data = res.data
            setSubjectNoteOptions(data.subjects?.map((s: any) => ({ label: s.name, value: s.name, id: s.id })) || [])
            setCategoryNoteOptions(data.categories?.map((c: any) => ({ 
                label: c.name, 
                value: c.name, 
                id: c.id,
                children: c.children?.map((child: any) => ({ label: child.name, value: child.name, id: child.id })) || []
            })) || [])
        } catch (error) {
            console.error("Failed to fetch filter options", error)
        }
    }

    useEffect(() => {
        fetchFilterOptions()
    }, [])

    const handleApplyFilter = (newFilters: Partial<NoteSearchQuery>) => {
        setFilter(prev => ({ ...prev, ...newFilters, currentPage: 1 }))
        if (newFilters.subjectNames && newFilters.subjectNames.length > 0) {
            setSubjectValue(newFilters.subjectNames)
        } else {
            setSubjectValue([])
        }
    }

    const handleChangeSubject = (value: string | null) => {
        setSubjectValue(prev => {
            let newValues: string[]
            if (value === null) {
                newValues = []
            } else if (prev.includes(value)) {
                newValues = prev.filter(v => v !== value)
            } else {
                newValues = [...prev, value]
            }
            setFilter(f => ({
                ...f,
                subjectNames: newValues.length > 0 ? newValues : undefined,
                currentPage: 1
            }))
            return newValues
        })
    }

    const handleChangeCategory = (value: string | null) => {
        setCategoryValue(value)
        setFilter(prev => ({
            ...prev,
            categoryNames: value ? [value] : undefined,
            currentPage: 1
        }))
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
            setFilter(prev => {
                if ((prev.textSearch || "") === search) return prev;
                return { ...prev, textSearch: search, currentPage: 1 };
            });
        }, 500);

        return () => {
            if (inputSearch.current) {
                clearTimeout(inputSearch.current);
            }
        };
    }, [search]);

    const uploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
        setImageUrl(asset.uri);
        uploadedUrlRef.current = '';
        setLoadingWithoutOverlay(true);
        const promise = (async () => {
            try {
                let fileName = asset.fileName;
                if (!fileName || !fileName.includes('.')) {
                    const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
                    fileName = `photo_${Date.now()}.${ext}`;
                }
                const mimeType = asset.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');

                const formData = new FormData();
                formData.append("upload", {
                    uri: asset.uri,
                    type: mimeType,
                    name: fileName,
                } as any);

                const res = await apiUploadImageFile(formData);
                const serverUrl = res?.data?.url || res?.data?.Url || (typeof res?.data === 'string' ? res.data : '') || (res as any)?.url;
                if (serverUrl) {
                    uploadedUrlRef.current = serverUrl;
                }
            } catch (error) {
                console.log("[useNotes uploadAsset] Error:", error);
                toast.error(getErrorMessage(t, error));
            } finally {
                setLoadingWithoutOverlay(false);
            }
        })();
        uploadPromiseRef.current = promise;
        await promise;
    };

    const handlePickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.6,
            });

            if (!result.canceled && result.assets?.length) {
                await uploadAsset(result.assets[0]);
            }
        } catch (error) {
            toast.error(getErrorMessage(t, error));
        }
    };

    const handleTakePhoto = async () => {
        try {
            const currentPerm = await ImagePicker.getCameraPermissionsAsync();
            let isGranted = currentPerm.granted;
            if (!isGranted) {
                const requested = await ImagePicker.requestCameraPermissionsAsync();
                isGranted = requested.granted;
            }

            if (!isGranted) {
                toast.error(t('camera_permission_required') || '카메라 권한이 필요합니다');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.6,
            });

            let asset = (!result.canceled && result.assets?.length) ? result.assets[0] : null;

            if (!asset) {
                const pending = await ImagePicker.getPendingResultAsync();
                if (pending && 'assets' in pending && pending.assets?.length && !pending.canceled) {
                    asset = pending.assets[0];
                }
            }

            if (asset) {
                await uploadAsset(asset);
            }
        } catch (error) {
            console.log("[useNotes handleTakePhoto] Error:", error);
            toast.error(getErrorMessage(t, error));
        }
    };

    const handleRemoveImage = () => {
        setImageUrl('');
        uploadedUrlRef.current = '';
        uploadPromiseRef.current = null;
        if (selectedNote) {
            setSelectedNote({ ...selectedNote, imageUrl: '' });
        }
    };

    const handleUploadImage = async () => {
        await handlePickFromGallery();
    };

    const reset = () => {
        setSelectedNote(undefined)
        setImageUrl('')
        uploadedUrlRef.current = ''
        uploadPromiseRef.current = null
    }

    const handleOpenDialog = (item?: NoteResponse) => {
        if (item) {
            setSelectedNote(item)
            setImageUrl(item.imageUrl || '')
            uploadedUrlRef.current = item.imageUrl || ''
            uploadPromiseRef.current = null
        }
        setOpen(true)
    }

    const handleCloseDialog = () => {
        setOpen(false)
        reset()
    }

    const handleLoadChange = (bool: boolean) => {
        setLoadingNotes(bool)
    }

    const getNotes = async () => {
        if (!filter || !filter.currentPage) {
            setNotes([])
            return
        }
        if (isLoadingNotes) return
        
        const isLoadMore = filter.currentPage > 1
        if (isLoadMore) {
            setLoadingNotes(true)
        } else {
            setLoadingWithoutOverlay(true)
        }

        try {
            const res = await getGroupedNotesApi({ ...filter })
            const data = res.data
            setTotalPages(data?.totalPages || 0)
            const items: GroupedNoteResponse[] = data?.items || []
            let newNotes: GroupedNoteResponse[] = items

            if (filter?.currentPage && filter?.currentPage > 1) {
                const map = new Map<string, GroupedNoteResponse>();
                [...notes, ...items].forEach(item => {
                    const key = `${item.subjectName}-${item.categoryName}`;
                    if(map.has(key)) {
                       const existing = map.get(key)!;
                       existing.notes = [...existing.notes, ...item.notes];
                    } else {
                       map.set(key, item);
                    }
                });
                newNotes = Array.from(map.values());
            }
            setNotes(newNotes)
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        }
        finally {
            if (isLoadMore) {
                setLoadingNotes(false)
            } else {
                setLoadingWithoutOverlay(false)
            }
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
        const groupInfo = { subjectName: selectedNote.subjectName, categoryName: selectedNote.categoryName }
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
            setRefreshGroup({ ...groupInfo, key: Date.now() })
            handleCloseDialog()
        }
    }

    const handleSaveNote = async (content: string) => {
        if (!selectedNote?.id) return
        if (content.trim().length === 0) return
        const groupInfo = { subjectName: selectedNote.subjectName, categoryName: selectedNote.categoryName }
        try {
            handleLoadChange(true)

            if (uploadPromiseRef.current) {
                await uploadPromiseRef.current
            }

            const finalImageUrl = uploadedUrlRef.current || (imageUrl && !imageUrl.startsWith('file://') && !imageUrl.startsWith('content://') ? imageUrl : '')

            const data: NoteRequest = {
                content,
                imageUrl: finalImageUrl || undefined
            }

            await updateNoteApi(selectedNote.id, data)

            toast.success(t("update_note_successfully"))

        } catch (error) {
            console.log({ error });
            toast.error(getErrorMessage(t, error))
        }
        finally {
            handleLoadChange(false)
            setRefreshGroup({ ...groupInfo, key: Date.now() })
            handleCloseDialog()
        }
    }



    const isFirstFocus = useRef(true);

    useFocusEffect(
        useCallback(() => {
            if (isFirstFocus.current) {
                isFirstFocus.current = false;
                return;
            }
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
        handlePickFromGallery,
        handleTakePhoto,
        handleRemoveImage,
        handleOpenDialog,
        handleCloseDialog,
        handleLoadChange,
        isLoadingNotes,
        handleLoadMore,
        isFilterVisible,
        openFilter,
        closeFilter,
        handleApplyFilter,
        refreshGroup,
        removeGroup
    }
}

export default useNotes