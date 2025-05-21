import { CategoryResponse, ExamResult, Question, TextbookResult } from "@/utils/types";

export const totalSolveTimeCategories = (inputData: ExamResult, categories: CategoryResponse[]) => {
  let uniqueCategories = new Set<string>();
  const filterCategories = categories.filter((category: CategoryResponse) => {
    if (!uniqueCategories.has(category.name)) {
      uniqueCategories.add(category.name);
      return true;
    }
    return false;
  });
  
  const questionsByCategory = filterCategories.map(
    (category: CategoryResponse) => {
      return {
        ...category,
        totalSolveTime: inputData.questions.reduce((init: number, question: Question) => {
          return question.category.name === category.name ? init += question.duration : init
        }, 0),
      };
    }
  );
  return questionsByCategory;
};

export const totalTextbookSolveTimeCategories = (inputData: TextbookResult, categories: CategoryResponse[]) => {
  let uniqueCategories = new Set<string>();
  const filterCategories = categories.filter((category: CategoryResponse) => {
    if (!uniqueCategories.has(category.name)) {
      uniqueCategories.add(category.name);
      return true;
    }
    return false;
  });
  
  const questionsByCategory = filterCategories.map(
    (category: CategoryResponse) => {
      return {
        ...category,
        totalSolveTime: inputData.studentQuestionResults.reduce((init: number, question) => {
          return !!question.categories.find(i => i.name === category.name)? init += question.duration : init
        }, 0),
      };
    }
  );
  return questionsByCategory;
};