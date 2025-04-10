import { UserResponse } from "./user";

export type LoginResponse = {
  token: string;
  isFirstLogin: boolean;
  isSuperAdmin?: boolean | undefined;
  user: UserResponse;
}

export type LoginRequest = {
  imageUrl: string;
  fullName: string;
  email: string;
  token: string;
  googleId: string;
  role: string;
}

export type LoginAccessTokenRequest = {
  accessToken: string
  email: string
  role: string
}