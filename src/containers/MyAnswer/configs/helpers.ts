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
  let uniqueCategories = new Set<string>();
  const filterCategories = categories.filter((category: CategoryResponse) => {
    if (!uniqueCategories.has(category.name)) {
      uniqueCategories.add(category.name);
      return true;
    }
    return false;
  });
  const questionsByCategory = filterCategories.map(
    (category: CategoryResponse): FormatDataMyAnswer => {
      return {
        category,
        questions: inputData.questions.filter((question: Question) => {
          return question.category.name === category.name;
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
