// Per-question note order ("Note #n"), same rules as web TouchStudy.Core utils/functions/noteOrder.ts.
// The server's questionNoteOrder wins; otherwise #1 = oldest (createdAt asc, then id asc).

type OrderableNote = {
  id: number
  createdAt?: string | null
  questionNoteOrder?: number | null
}

type QuestionNote = OrderableNote & {
  questionId?: number
  isStudentNote?: boolean
  isOwned?: boolean
  studentEditedAt?: string | null
  studentExamSessionId?: number | string | null
  studentTextbookSessionId?: number | null
}

const getCreatedTime = (note: OrderableNote) => new Date(note.createdAt ?? 0).getTime() || 0

/** id -> #n for the notes of one question, whatever order they are displayed in. */
export const getNoteCreationNumbers = (notes: OrderableNote[]): Map<number, number> =>
  new Map(
    notes
      .slice()
      .sort((a, b) => getCreatedTime(a) - getCreatedTime(b) || a.id - b.id)
      .map((note, index) => [note.id, note.questionNoteOrder ?? index + 1])
  )

/** The (own, for a student) student notes of one question, id asc. */
export const getQuestionNotes = <T extends QuestionNote>(
  notes: T[],
  questionId: number | undefined,
  isStudent: boolean
): T[] => {
  if (!questionId) return []
  return notes
    .filter(
      (n) => n.isStudentNote !== false && (!isStudent || n.isOwned !== false) && n.questionId === questionId
    )
    .slice()
    .sort((a, b) => a.id - b.id)
}

/** id -> #n for every note whose question has 2+ notes in the list (web useExamResultNote noteNumbers). */
export const getQuestionNoteNumbers = (notes: QuestionNote[], isStudent: boolean): Record<number, number> => {
  const result: Record<number, number> = {}
  const seen = new Set<number>()
  notes.forEach((note) => {
    if (!note.questionId || seen.has(note.questionId)) return
    seen.add(note.questionId)
    const items = getQuestionNotes(notes, note.questionId, isStudent)
    if (items.length < 2) return
    getNoteCreationNumbers(items).forEach((number, id) => {
      result[id] = number
    })
  })
  return result
}

/** After a delete: drop the note and renumber its question's remaining notes 1..N locally (web useNotes.handleNoteRemoved). */
export const resequenceAfterRemoval = <T extends QuestionNote>(notes: T[], deleted: QuestionNote): T[] => {
  const filtered = notes.filter((n) => n.id !== deleted.id)
  if (!deleted.questionId) return filtered
  const siblings = filtered
    .filter(
      (n) =>
        n.isStudentNote !== false &&
        n.questionId === deleted.questionId &&
        (deleted.studentExamSessionId == null ||
          n.studentExamSessionId == null ||
          String(n.studentExamSessionId) === String(deleted.studentExamSessionId)) &&
        (deleted.studentTextbookSessionId == null ||
          n.studentTextbookSessionId == null ||
          n.studentTextbookSessionId === deleted.studentTextbookSessionId)
    )
    .slice()
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.id - b.id)
  const orderById = new Map<number, number>()
  siblings.forEach((n, index) => orderById.set(n.id, index + 1))
  return filtered.map((n) => {
    const next = orderById.get(n.id)
    return next !== undefined ? { ...n, questionNoteOrder: next } : n
  })
}

/** Note dialog chip order: newest note first by its #n (#3, #2, #1), then id desc. Not by edit time. */
export const sortNotesByNumberDesc = <T extends QuestionNote>(items: T[]): T[] => {
  const numbers = getNoteCreationNumbers(items)
  return items.slice().sort((a, b) => (numbers.get(b.id) ?? 0) - (numbers.get(a.id) ?? 0) || b.id - a.id)
}

/** Default note when the dialog opens for a question (web pickActionableNote): a rejected one, else the latest (#n highest). */
export const pickActionableNote = <T extends QuestionNote & { reviewStatus?: number }>(items: T[]): T | undefined => {
  const sorted = sortNotesByNumberDesc(items)
  // NoteReviewStatus.Rejected = 2 (kept numeric so this file has no type imports)
  return sorted.find((n) => n.reviewStatus === 2) ?? sorted[0]
}

/** "5" or, for a sub-question, "parent.child" (e.g. "1.1"), 1-based like web. */
export const questionNumberLabel = (
  q?: { questionOrder?: number; parentQuestionId?: number | null; parentQuestionOrder?: number | null } | null
): string =>
  q?.parentQuestionId
    ? `${(q.parentQuestionOrder || 0) + 1}.${(q.questionOrder || 0) + 1}`
    : `${(q?.questionOrder || 0) + 1}`
