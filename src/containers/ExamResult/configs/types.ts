import { ExamSession } from "@/utils/types";

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

export type GroupExamSession = {
  [key: string]: ExamSession[]
}

export const getPercentage = (current: number, max: number) => {
  if(!max) return 0;
  return (current * 100) / max 
}
