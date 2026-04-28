import { api } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"

const AUTH_LOGIN_URL = `${BASE_URL}/api/Auth`

export const updateInfoLogin = (body: any) => api.post(`${AUTH_LOGIN_URL}/info`, body)
export const checkInfoApi = (body: any, step: number) => api.post(`${AUTH_LOGIN_URL}/check`, body, {
    params: { step }
})
export const checkPhoneNumberApi = (body: any) => api.post(`${AUTH_LOGIN_URL}/check-phone-number`, body)