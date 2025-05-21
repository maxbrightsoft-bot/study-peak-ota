import { ExamStatusView, NoteSortColumn, OrderBy } from "@/utils/enums";
import { NoteSearchQuery } from "@/utils/types";

export const examStatusViewOptions = (t: any) => [
    {
        label: t('exam_overview'),
        value: ExamStatusView.ExamOverview
    },
    {
        label: t('my_answers'),
        value: ExamStatusView.MyAnswers
    },
    {
        label: t('question_analysis'),
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