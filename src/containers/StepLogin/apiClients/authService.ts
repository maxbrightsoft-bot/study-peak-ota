import { api } from "@/services/apiClient"
import { BASE_URL } from "@/utils/constants"

const AUTH_LOGIN_URL = `${BASE_URL}/api/Auth`

export const updateInfoLogin = (body: any) => api.post(`${AUTH_LOGIN_URL}/info/mobile`, body)
export const checkInfoApi = (body: any, step: number) => api.post(`${AUTH_LOGIN_URL}/check`, body, {
    params: { step }
})