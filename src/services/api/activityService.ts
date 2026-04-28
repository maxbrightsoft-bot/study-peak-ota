import { CreateActivityRequest } from "@/utils/types/activity";
import { api } from "./apiClient";
import { BASE_URL } from "@/utils/constants";

const ACTIVITY_URL = `${BASE_URL}/api/studentActivityEvents`;

export const getActivyityListApi = async () =>
  api.get(`${ACTIVITY_URL}`);

export const createActivyityBulkApi = async (data: CreateActivityRequest[]) =>
  api.post(`${ACTIVITY_URL}`, data);