// Pure guard for the exam result fetch: a response is applied only while its args are still the current ones.

export type ExamResultRequestArgs = {
  examCode: string
  studentExamSessionId: string
  chapterId?: number
  textbookId?: number
  date?: string
}

/** Whether two fetches ask for the same result (null = nothing in flight). */
export const isSameResultRequest = (
  a: ExamResultRequestArgs | null,
  b: ExamResultRequestArgs
): boolean =>
  !!a &&
  a.examCode === b.examCode &&
  a.studentExamSessionId === b.studentExamSessionId &&
  a.chapterId === b.chapterId &&
  a.textbookId === b.textbookId &&
  a.date === b.date

/** Stable key of a request's args (latest started sequence number is kept per key). */
export const resultRequestKey = (a: ExamResultRequestArgs): string =>
  JSON.stringify([a.examCode, a.studentExamSessionId, a.chapterId ?? null, a.textbookId ?? null, a.date ?? null])

export type ExamResultRequest = { seq: number; args: ExamResultRequestArgs }

/** Apply a response only for the current args and only if no newer request with the same args was started. */
export const isLatestResponse = (
  request: ExamResultRequest,
  current: ExamResultRequestArgs,
  latestSeqByKey: Record<string, number>
): boolean =>
  isSameResultRequest(request.args, current) &&
  latestSeqByKey[resultRequestKey(request.args)] === request.seq

/** Whether the latest request started for these args is still in flight (then a refetch can be skipped). */
export const isRequestPending = (
  args: ExamResultRequestArgs,
  latestSeqByKey: Record<string, number>,
  pendingSeqs: Set<number>
): boolean => {
  const seq = latestSeqByKey[resultRequestKey(args)]
  return seq !== undefined && pendingSeqs.has(seq)
}
