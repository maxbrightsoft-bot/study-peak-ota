import {
  getNoteCreationNumbers,
  getQuestionNoteNumbers,
  getQuestionNotes,
  pickActionableNote,
  questionNumberLabel,
  resequenceAfterRemoval,
  sortNotesByNumberDesc
} from '../noteOrder'

type N = {
  id: number
  reviewStatus?: number
  questionId?: number
  createdAt?: string | null
  studentEditedAt?: string | null
  questionNoteOrder?: number | null
  isStudentNote?: boolean
  isOwned?: boolean
  studentExamSessionId?: number | null
}

const n = (id: number, questionId: number, createdAt: string, extra: Partial<N> = {}): N => ({
  id,
  questionId,
  createdAt,
  isStudentNote: true,
  isOwned: true,
  ...extra
})

describe('getNoteCreationNumbers (port of web utils/functions/noteOrder.ts)', () => {
  test('#1 = oldest by createdAt, then id', () => {
    const map = getNoteCreationNumbers([
      n(30, 1, '2026-11-03T10:00:00'),
      n(10, 1, '2026-11-03T09:00:00'),
      n(20, 1, '2026-11-03T09:00:00')
    ])
    expect(map.get(10)).toBe(1)
    expect(map.get(20)).toBe(2)
    expect(map.get(30)).toBe(3)
  })
  test('the server questionNoteOrder wins when present', () => {
    const map = getNoteCreationNumbers([
      n(1, 1, '2026-11-03T09:00:00', { questionNoteOrder: 2 }),
      n(2, 1, '2026-11-03T10:00:00', { questionNoteOrder: 1 })
    ])
    expect(map.get(1)).toBe(2)
    expect(map.get(2)).toBe(1)
  })
  test('missing createdAt sorts first, by id', () => {
    const map = getNoteCreationNumbers([n(5, 1, '2026-11-03T09:00:00'), { id: 7 }, { id: 6 }])
    expect([map.get(6), map.get(7), map.get(5)]).toEqual([1, 2, 3])
  })
})

describe('getQuestionNoteNumbers (web noteNumbers)', () => {
  test('numbers only questions with 2+ notes, per question', () => {
    const result = getQuestionNoteNumbers(
      [
        n(1, 100, '2026-11-03T09:00:00'),
        n(2, 100, '2026-11-03T10:00:00'),
        n(3, 200, '2026-11-03T09:00:00')
      ],
      true
    )
    expect(result).toEqual({ 1: 1, 2: 2 })
  })
  test('a student only counts own student notes', () => {
    const notes = [
      n(1, 100, '2026-11-03T09:00:00'),
      n(2, 100, '2026-11-03T10:00:00', { isOwned: false }),
      n(3, 100, '2026-11-03T11:00:00', { isStudentNote: false })
    ]
    expect(getQuestionNoteNumbers(notes, true)).toEqual({})
    expect(getQuestionNoteNumbers(notes, false)).toEqual({ 1: 1, 2: 2 })
  })
})

describe('getQuestionNotes', () => {
  test('notes of one question, id asc; none for no question', () => {
    const notes = [n(5, 100, 'b'), n(2, 100, 'a'), n(3, 200, 'a')]
    expect(getQuestionNotes(notes, 100, true).map(x => x.id)).toEqual([2, 5])
    expect(getQuestionNotes(notes, undefined, true)).toEqual([])
  })
})

describe('resequenceAfterRemoval (web useNotes.handleNoteRemoved)', () => {
  test('drops the note and renumbers the same question 1..N by createdAt, id', () => {
    const deleted = n(1, 100, '2026-11-03T09:00:00', { questionNoteOrder: 1, studentExamSessionId: 9 })
    const result = resequenceAfterRemoval(
      [
        deleted,
        n(2, 100, '2026-11-03T10:00:00', { questionNoteOrder: 2, studentExamSessionId: 9 }),
        n(3, 100, '2026-11-03T11:00:00', { questionNoteOrder: 3, studentExamSessionId: 9 }),
        n(4, 200, '2026-11-03T11:00:00', { questionNoteOrder: 1, studentExamSessionId: 9 })
      ],
      deleted
    )
    expect(result.map(x => [x.id, x.questionNoteOrder])).toEqual([
      [2, 1],
      [3, 2],
      [4, 1]
    ])
  })
  test('other attempts are not renumbered', () => {
    const deleted = n(1, 100, '2026-11-03T09:00:00', { studentExamSessionId: 9 })
    const other = n(2, 100, '2026-11-03T10:00:00', { questionNoteOrder: 2, studentExamSessionId: 8 })
    expect(resequenceAfterRemoval([deleted, other], deleted)).toEqual([other])
  })
  test('a note without question is just removed', () => {
    const deleted = { id: 1 }
    expect(resequenceAfterRemoval([deleted, { id: 2 }], deleted)).toEqual([{ id: 2 }])
  })
})

describe('sortNotesByNumberDesc (dialog chips: #3, #2, #1)', () => {
  test('device bug: #1 edited last must not jump ahead (was "#3, #1, #2")', () => {
    const list = [
      n(1, 1, '2026-11-03T09:00:00', { questionNoteOrder: 1, studentEditedAt: '2026-11-03T12:00:00' }),
      n(2, 1, '2026-11-03T10:00:00', { questionNoteOrder: 2 }),
      n(3, 1, '2026-11-03T11:00:00', { questionNoteOrder: 3 })
    ]
    expect(sortNotesByNumberDesc(list).map(x => x.id)).toEqual([3, 2, 1])
  })
  test('without server order: newest created first', () => {
    const list = [n(5, 1, '2026-11-03T11:00:00'), n(4, 1, '2026-11-03T09:00:00'), n(6, 1, '2026-11-03T10:00:00')]
    expect(sortNotesByNumberDesc(list).map(x => x.id)).toEqual([5, 6, 4])
  })
})

describe('pickActionableNote (web: rejected first, else the latest)', () => {
  const list = [
    n(3, 1, '2026-11-03T11:00:00', { questionNoteOrder: 3, reviewStatus: 0 }),
    n(2, 1, '2026-11-03T10:00:00', { questionNoteOrder: 2, reviewStatus: 2 }),
    n(1, 1, '2026-11-03T09:00:00', { questionNoteOrder: 1, reviewStatus: 1 })
  ]
  test('a rejected note wins', () => {
    expect(pickActionableNote(list)?.id).toBe(2)
  })
  test('else the latest (#n highest)', () => {
    expect(pickActionableNote([list[2], list[0]])?.id).toBe(3)
  })
  test('no notes: nothing (new note)', () => {
    expect(pickActionableNote([])).toBeUndefined()
  })
})

describe('questionNumberLabel', () => {
  test('sub-question shows parent.child (controller: Q1.1 showed "No.1")', () => {
    expect(questionNumberLabel({ questionOrder: 0, parentQuestionId: 77, parentQuestionOrder: 0 })).toBe('1.1')
    expect(questionNumberLabel({ questionOrder: 2, parentQuestionId: 77, parentQuestionOrder: 3 })).toBe('4.3')
  })
  test('top-level question shows its own number', () => {
    expect(questionNumberLabel({ questionOrder: 4 })).toBe('5')
    expect(questionNumberLabel({ questionOrder: 4, parentQuestionId: 0 })).toBe('5')
    expect(questionNumberLabel(undefined)).toBe('1')
  })
})
