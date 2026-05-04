export enum TextbookChapterResultTab {
  MyAnswers = 0,
  IncorrectAnswerNotes = 1
}

export const textbookChapterResultTabOptions = (t: any) => [
  {
    label: t('my_answers'),
    value: TextbookChapterResultTab.MyAnswers
  },
  {
    label: t('incorrect_answer_notes'),
    value: TextbookChapterResultTab.IncorrectAnswerNotes
  }
]
