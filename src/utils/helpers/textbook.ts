import { QuestionAnswerType } from "../enums"

export const isTextType = (type: QuestionAnswerType)  => {
  return type === QuestionAnswerType.ShortAnswer ||
      type === QuestionAnswerType.OrderMatters ||
      type === QuestionAnswerType.OrderDoesNotMatters ||
      type === QuestionAnswerType.SynonymProcessing
}