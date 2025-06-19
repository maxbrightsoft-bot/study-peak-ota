import { api } from "@/services/apiClient"
import { PhoneLoginRequest } from "../configs/types"
import { AcademyHeaders, BASE_URL, SUPER_ADMIN_BASE_URL } from "@/utils/constants"

const AUTH_LOGIN_URL = `${BASE_URL}/api/Auth`
const SUPER_AUTH_LOGIN_URL = `${SUPER_ADMIN_BASE_URL}/api/Auth`

export const superLoginPhone = (req: PhoneLoginRequest) =>
    api.post(`${SUPER_AUTH_LOGIN_URL}/login/phone`, req)

export const loginPhone = (domain: string, req: PhoneLoginRequest) =>
    api.post(`${AUTH_LOGIN_URL}/login/phone`, req, {
        headers: {
            [AcademyHeaders]: domain
        }
    })
