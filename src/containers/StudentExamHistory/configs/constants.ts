import { OrderBy } from "@/utils/enums";
import { StudentExamSessionQuery, StudentExamSessionSortBy } from "./types";

export const DefaultStudentExamSessionFilter: StudentExamSessionQuery = {
  sortColumnDirection: OrderBy.DESC,
  sortColumnName: StudentExamSessionSortBy.StartTime,
};