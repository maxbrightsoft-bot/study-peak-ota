import { UserResponse } from "./user";

export type LoginResponse = {
  token: string;
  isFirstLogin: boolean;
  isSuperAdmin?: boolean | undefined;
  user: UserResponse;
  loginMethod: string;
}

export type LoginRequest = {
  imageUrl?: string;
  fullName: string;
  email: string;
  token: string;
  appleUserId?: string
  googleId?: string;
  role: string;
  isMobile: boolean
  isKeepMeLoggedIn?: boolean
}

export type LoginAccessTokenRequest = {
  accessToken: string
  email: string
  role: string
  isMobile: boolean
}

export type LoginEmailRequest = {
  email: string
  password: string
  role: string
  isKeepMeLoggedIn: boolean
}

export type ForgotPasswordRequest = {
  email: string;
  reCaptcha?: string;
}

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  key: string;
  newPassword: string;
}

export type ChangePasswordRequest = {
  currentPassword?: string;
  newPassword: string;
}

export type VerifyResetPasswordOtpRequest = {
  email: string;
  key: string;
  otp: string;
}

