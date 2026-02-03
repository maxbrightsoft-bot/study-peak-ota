import { api } from "@/services/api/apiClient";
import { AcademyHeaders, BASE_URL, NoAcademyHeaders, SUPER_ADMIN_BASE_URL } from "@/utils/constants";
import { LoginAccessTokenRequest, LoginRequest } from "@/utils/types";

const AUTH_URL = `${BASE_URL}/api/auth`;
const AUTH_SUPER_ADMIN_URL = `${SUPER_ADMIN_BASE_URL}/api/auth`

export const getInfo = (role: string, isLearningSpace: boolean) =>
  api.get(`${AUTH_URL}/info`, {
    params: {
      role,
    },
    headers: {
      [NoAcademyHeaders]: isLearningSpace,
    },
  });

export const apiLoginGoogle = (body: LoginRequest, isLearningSpace: boolean) =>
  api.post(`${AUTH_URL}/login`,
    body, {
    headers: {
      [NoAcademyHeaders]: isLearningSpace
    }
  }
  );

export const apiLoginGoogleSuperAdmin = (body: LoginRequest) => api.post(
  `${AUTH_SUPER_ADMIN_URL}/login`,
  body
)

export const apiLoginWithAccessToken = (
  body: LoginAccessTokenRequest,
  isLearningSpace?: boolean,
  domain?: string
) =>
  api.post(`${AUTH_URL}/login/access-token`, body, {
    params: {
      isLearningSpace,
    },
    headers: {
      [AcademyHeaders]: domain,
      [NoAcademyHeaders]: isLearningSpace,
    },
  });

export const getSuperAdminInfoFromWeb = () => api.get(`${AUTH_SUPER_ADMIN_URL}/info`)
