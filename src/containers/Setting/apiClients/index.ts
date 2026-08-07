import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";

const AUTH_URL = `${BASE_URL}/api/auth`;
const CONSENT_URL = `${BASE_URL}/api/consent`;

export const removeAccountApi = () => api.delete(`${AUTH_URL}`)

export const getConsentStatusApi = () => api.get(`${CONSENT_URL}/status`)

export const agreeConsentApi = (version: string) =>
  api.post(`${CONSENT_URL}`, { version })
