import { CategoryResponse, ExamResult, Question, TextbookResult } from "@/utils/types";
import { FormatDataMyAnswer, FormatTextbookDataMyAnswer } from "./types";

export const getOverallColor = (correctRate: number): string => {
  if (correctRate < 40) return '#EF4444';
  if (correctRate <= 70) return '#F59E0B';
  return '#10B981';
};

export const formatDataMyAnswer = (inputData: ExamResult, categories: CategoryResponse[]) => {
  const validCategories = (categories || []).filter(
    (c: CategoryResponse) => c && c.id !== 0 && c.name && c.name.trim() !== ""
  );
  const assignedQuestionIds = new Set<number>();
  const questionsByCategory: FormatDataMyAnswer[] = validCategories.map(
    (category: CategoryResponse): FormatDataMyAnswer => {
      const questions = (inputData.questions || []).filter((question: Question) => {
        const matches = category.questionIds?.includes(question.id);
        if (matches) assignedQuestionIds.add(question.id);
        return matches;
      });
      return {
        category,
        questions,
      };
    }
  ).filter(group => group.questions.length > 0);

  const uncategorizedQuestions = (inputData.questions || []).filter(
    (q: Question) => !assignedQuestionIds.has(q.id)
  );

  if (uncategorizedQuestions.length > 0) {
    questionsByCategory.push({
      category: {
        id: 0,
        name: "",
        questionIds: uncategorizedQuestions.map(q => q.id),
        percentageAmongStudents: 0
      } as any,
      questions: uncategorizedQuestions,
    });
  }

  return questionsByCategory;
};


export const formatTextbookDataMyAnswer = (inputData: TextbookResult, questionGroupIds: number[]) => {
  const questionsByCategories = questionGroupIds.map(
    (questionGroupId: number): FormatTextbookDataMyAnswer => {
      const questions = inputData.studentQuestionResults.filter((question) => {
        return question.questionGroupId === questionGroupId;
      })
      const category = questions?.[0]?.categories?.[0]
      const subcategory = !category ? undefined : questions?.[0]?.categories?.find(c => !!c.parentCategoryId && c.parentCategoryId === category?.id)
      return {
        categories: category && subcategory ? [category, subcategory] : category ? [category] : [],
        questions,
        questionGroupId
      };
    }
  );
  return questionsByCategories;
};
