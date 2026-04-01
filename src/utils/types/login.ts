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
}
