import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";

const AUTH_URL = `${BASE_URL}/api/auth`;


export const removeAccountApi = () => api.delete(`${AUTH_URL}`)
