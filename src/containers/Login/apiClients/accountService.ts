import { api } from "@/services/api/apiClient";
import { AcademyHeaders, BASE_URL, NoAcademyHeaders, SUPER_ADMIN_BASE_URL } from "@/utils/constants";
import {
  LoginAccessTokenRequest,
  LoginEmailRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyResetPasswordOtpRequest,
} from "@/utils/types";


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

export const apiLoginGoogle = (body: LoginRequest, isLearningSpace: boolean, domain?: string | null) =>
  api.post(`${AUTH_URL}/login`,
    body, {
    headers: {
      [AcademyHeaders]: domain,
      [NoAcademyHeaders]: isLearningSpace,
    }
  }
  );

export const apiLoginApple = (body: LoginRequest, isLearningSpace: boolean, domain?: string | null) =>
  api.post(`${AUTH_URL}/login-apple`,
    body, {
    headers: {
      [AcademyHeaders]: domain,
      [NoAcademyHeaders]: isLearningSpace,
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

export const apiLoginEmail = (body: LoginEmailRequest, isLearningSpace?: boolean, domain?: string | null) =>
  api.post(`${AUTH_URL}/login/demo`, body, {
    headers: {
      [AcademyHeaders]: domain,
      [NoAcademyHeaders]: isLearningSpace,
    }
  });


export const getSuperAdminInfoFromWeb = () => api.get(`${AUTH_SUPER_ADMIN_URL}/info`)

export const forgotPasswordApi = (data: ForgotPasswordRequest) =>
  api.post(`${AUTH_URL}/forgot-password`, data, {
    headers: {
      [NoAcademyHeaders]: true,
    },
  });

export const resetPasswordApi = (data: ResetPasswordRequest) =>
  api.post(`${AUTH_URL}/reset-password`, data, {
    headers: {
      [NoAcademyHeaders]: true,
    },
  });

export const changePasswordApi = (data: ChangePasswordRequest) =>
  api.post(`${AUTH_URL}/change-password`, data);

export const verifyResetPasswordOtpApi = (data: VerifyResetPasswordOtpRequest) =>
  api.post(`${AUTH_URL}/forgot-password/verify-otp`, data, {
    headers: {
      [NoAcademyHeaders]: true,
    },
  });
