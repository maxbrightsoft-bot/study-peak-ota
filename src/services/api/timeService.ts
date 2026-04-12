import { BASE_URL } from "@/utils/constants";
import { api } from "./apiClient";

const TIME_API = `${BASE_URL}/api/auth/time`;

export const getTimeServerApi = async () =>
  api.get(TIME_API, {
    headers: { 'Cache-Control': 'no-cache' },
    timeout: 5000,
  });
