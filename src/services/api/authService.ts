import { api } from "./apiClient";
import { SUPER_ADMIN_BASE_URL } from "@/utils/constants";

const AUTH_URL = `${SUPER_ADMIN_BASE_URL}/api/auth`;

export const registerAccountApi = async (data: any) =>
  api.post(`${AUTH_URL}/register`, data);
