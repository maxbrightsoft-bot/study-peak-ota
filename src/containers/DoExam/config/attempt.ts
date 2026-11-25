/** The attempt number is only worth showing once the student has attempted the exam more than once. */
export const shouldShowAttemptNumber = (total?: number) => (total ?? 0) > 1
