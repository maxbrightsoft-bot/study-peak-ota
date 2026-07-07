import { NoteSortColumn, OrderBy } from "@/utils/enums"
import { NoteSearchQuery } from "@/utils/types"

export const StudySpaceTabList = [
  {
    label: 'time_data',
    value: 0
  },
  {
    label: 'review_wrong_answer_notes',
    value: 2
  }
]


export const TabList = [
  {
    label: 'time_data',
    value: 0
  },
  {
    label: 'performance_data',
    value: 1
  },
  {
    label: 'review_wrong_answer_notes',
    value: 2
  }
]


export const TOTAL_SECONDS_IN_A_MINUTE = 60
export const TOTAL_SECONDS_IN_AN_HOUR = 60 * 60

export const timeTypeOptions = (t?: any) => [
  {
    label: t('daily_data'),
    value: 3
  },
  {
    label: t('weekly_data'),
    value: 0
  },
  {
    label: t('monthly_data'),
    value: 1
  },
  {
    label: t('yearly_data'),
    value: 2
  }
]

export enum TypeText { 'study', 'average', 'compare' }

export enum Mode { Timer, Question }

export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000
export const TOP_WEAKNESS_LIMIT = 5

export const DEFAULT_NOTE_FILTER: NoteSearchQuery = {
  sortColumnDirection: OrderBy.DESC,
  sortColumnName: NoteSortColumn.CreatedAt,
  currentPage: 1,
  pageSize: 12
}

export enum SectionKey { StudyTimeChart, SubjectDistribution, ComparisonChart }