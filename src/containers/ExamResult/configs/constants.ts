import { ExamStatusView, NoteSortColumn, OrderBy } from "@/utils/enums";
import { NoteSearchQuery } from "@/utils/types";
import { StudentExamSessionQuery, StudentExamSessionSortBy } from "./types";

export const examStatusViewOptions = (t: any, chapterId?: number) => chapterId ? [
    {
        label: t('my_answers'),
        value: ExamStatusView.MyAnswers
    },
    {
        label: t('question_analysis'),
        value: ExamStatusView.QuestionAnalysis
    },
] : [
    {
        label: t('my_overall'),
        value: ExamStatusView.MyOverall
    },
    {
        label: t('my_answers'),
        value: ExamStatusView.MyAnswers
    },
    {
        label: t('solution_order'),
        value: ExamStatusView.SolutionOrder
    },
    {
        label: t('compare_solution'),
        value: ExamStatusView.CompareSolution
    },
    {
        label: t('problem_analysis'),
        value: ExamStatusView.QuestionAnalysis
    },
    {
        label: t('incorrect_answer_notes'),
        value: ExamStatusView.IncorrectAnswerNotes
    }
]

export const DEFAULT_NOTE_FILTER: NoteSearchQuery = {
    sortColumnDirection: OrderBy.DESC,
    sortColumnName: NoteSortColumn.CreatedAt,
    currentPage: 1,
    pageSize: 12
}

export const DefaultStudentExamSessionFilter: StudentExamSessionQuery = {
  sortColumnDirection: OrderBy.DESC,
  sortColumnName: StudentExamSessionSortBy.StartTime,
};