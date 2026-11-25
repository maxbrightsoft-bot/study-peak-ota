import { api } from "@/services/api/apiClient"
import { BASE_URL } from "@/utils/constants"

const AUTH_LOGIN_URL = `${BASE_URL}/api/Auth`

export const setUsernameApi = (userName: string) =>
    api.post(`${AUTH_LOGIN_URL}/username`, { userName })
