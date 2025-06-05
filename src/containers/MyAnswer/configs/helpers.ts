import { CategoryResponse, ExamResult, Question, TextbookResult } from "@/utils/types";
import { FormatDataMyAnswer, FormatTextbookDataMyAnswer } from "./types";

export const getOverallColorClassName = (
  correctRate: number,
  styles: {
      [className: string]: string
  }
) => {
  return styles[
      `overall-response-${correctRate < 40 ? 1 : correctRate <= 70 ? 2 : 3}`
  ]
}

export const formatDataMyAnswer = (inputData: ExamResult, categories: CategoryResponse[]) => {
  const questionsByCategory = categories.map(
    (category: CategoryResponse): FormatDataMyAnswer => {
      return {
        category,
        questions: inputData.questions.filter((question: Question) => {
          return category.questionIds.includes(question.id);
        }),
      };
    }
  );
  return questionsByCategory;
};


export const formatTextbookDataMyAnswer = (inputData: TextbookResult, questionGroupIds: number[]) => {
  const questionsByCategories = questionGroupIds.map(
    (questionGroupId: number): FormatTextbookDataMyAnswer => {
      const questions = inputData.studentQuestionResults.filter((question) => {
        return question.questionGroupId === questionGroupId;
      })
      const category = questions?.[0]?.categories?.[0]
      const subcategory = !category ? null : questions?.[0]?.categories?.find(c => !!c.parentCategoryId && c.parentCategoryId === category?.id)
      return {
        categories: category && subcategory ? [category, subcategory] : category ? [category] : [],
        questions,
        questionGroupId
      };
    }
  );
  return questionsByCategories;
};
