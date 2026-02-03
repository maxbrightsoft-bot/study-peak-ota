import { ExamSession, ExamSessionResponse } from "@/utils/types";

export type Category = {
  id: number;
  name: string;
  numberOfChildren?: number;
  numberOfQuestions?: number;
  parentCategoryId?: number | null;
  path?: string;
};

export type ExamSessionData = {
  code: string
}

export enum ExamPrintDataType
{
    MyOverall,
    ComprehensiveAnalysis,
    CompareSolution,
    ComparisonOfTopRankingsAndProblemSolvingOrder,
    ProblemAnalysis,
    IncorrectAnswerNotes
}

export type GroupExamSession = {
  [key: string]: ExamSessionResponse[]
}

