import { NoteSortColumn, OrderBy } from "@/utils/enums";
import { NoteSearchQuery } from "@/utils/types";

export const DEFAULT_NOTE_FILTER: NoteSearchQuery = {
    sortColumnDirection: OrderBy.DESC,
    sortColumnName: NoteSortColumn.CreatedAt,
    currentPage: 1,
    pageSize: 12
}