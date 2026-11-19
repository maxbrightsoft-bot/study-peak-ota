import { palette } from '@/theme'

// Same order as the web: success, warning, error, main, grey. Unknown / null subject = the last (grey).
const SUBJECT_COLORS = [
  palette.success.main,
  palette.warning.main,
  palette.error.main,
  palette.main[600],
  palette.grey[500]
]

/** Colour of a subject by its index in summary.subjects, so bars, rows and timeline agree. */
export const subjectColor = (
  subjectId: number | null | undefined,
  subjectIds: number[]
): string => {
  const index = subjectId === null || subjectId === undefined ? -1 : subjectIds.indexOf(subjectId)
  return SUBJECT_COLORS[
    index >= 0 && index < SUBJECT_COLORS.length ? index : SUBJECT_COLORS.length - 1
  ]
}
