import { BASE_URL } from "../../utils/constants";
import { api } from "./apiClient";

const CATEGORY_URL = `${BASE_URL}/api/examcategory`;

export const getCategoryListApi = async (query?: any) =>
  api.get(`${CATEGORY_URL}`, {
    params: query,
  });

export const getQuestionTypeListApi = async (query?: any) =>
  api.get(`${BASE_URL}/api/ExamQuestionType`, {
    params: query,
  });

export const getCategoryQuestionTypeListApi = async (query?: any) =>
  api.get(`${CATEGORY_URL}/question-types`, {
    params: query,
  });

